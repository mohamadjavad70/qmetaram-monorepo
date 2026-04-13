# Guardian State Machine Spec v1

Status: Draft-Ready
Owner: Core Security
Scope: Mother Node, Child Node, Q-Sat gateway control loop

## 1. Goal
Define deterministic and auditable Guardian behavior under bounded autonomy.

## 2. Design Principles
- Fail-closed for high-risk actions.
- Human override always available.
- Every state transition emits audit events.
- Blast radius must remain under policy threshold.

## 3. Inputs
- nodeHealth (0..1)
- entropyLevel (0..1)
- activeThreats (integer)
- latencyP95Ms
- replayRate
- falsePositiveRate
- killSwitchActive
- humanApprovalToken

## 4. States
- BOOTSTRAP: Initial checks and key integrity validation.
- OBSERVE: Passive monitoring, no disruptive action.
- EVALUATE: Risk scoring and policy simulation.
- CONTAIN: Quarantine and selective isolation.
- SELF_HEAL: Controlled remediation with bounded impact.
- DEGRADED: Service reduced to preserve safety.
- HUMAN_REVIEW: Wait for explicit approval.
- RECOVER: Stepwise return to normal operation.
- HALT: Emergency stop, only control-plane operations allowed.

## 5. Transition Matrix
| From | To | Condition | Action |
|---|---|---|---|
| BOOTSTRAP | OBSERVE | keysValid && policyLoaded | start telemetry |
| OBSERVE | EVALUATE | riskSignalDetected | compute risk score |
| EVALUATE | CONTAIN | riskScore >= 0.75 | isolate nodes |
| EVALUATE | SELF_HEAL | 0.45 <= riskScore < 0.75 | run safe repair |
| EVALUATE | OBSERVE | riskScore < 0.45 | continue monitoring |
| CONTAIN | HUMAN_REVIEW | blastRadius > maxBlastRadius | require approval |
| CONTAIN | SELF_HEAL | blastRadius <= maxBlastRadius | repair within bounds |
| SELF_HEAL | RECOVER | remediationSuccess | staged recovery |
| SELF_HEAL | DEGRADED | partialFailure | keep reduced capacity |
| DEGRADED | HUMAN_REVIEW | repeatedFailureCount >= 3 | manual decision |
| HUMAN_REVIEW | RECOVER | validApprovalToken | proceed with guardrails |
| ANY | HALT | killSwitchActive | immediate stop |
| HALT | OBSERVE | killSwitchActive == false && signedResumeOrder | controlled resume |

## 6. Guard Conditions
- GC1: predictedImpact <= maxBlastRadius
- GC2: pqcProofValid == true
- GC3: replayRate <= 0.002
- GC4: latencyP95Ms <= 80 for auto-actions; else HUMAN_REVIEW
- GC5: no unverified config delta in the last 5 minutes

## 7. Safety Invariants
- INV1: No autonomous action when kill switch is active.
- INV2: No transition to RECOVER without signed remediation report.
- INV3: Quarantine cannot exceed policy max blast radius.
- INV4: Every transition writes immutable audit event.

## 8. Event Schema (Audit)
Event fields:
- eventId
- ts
- prevState
- nextState
- reasonCode
- riskScore
- predictedImpact
- actorType (guardian|human)
- approvalRef
- pqcProofId

## 9. SLO Coupling
- control_plane_uptime >= 99.95%
- guardian_containment_time < 2s
- false_positive_rate <= 0.5%
- payout_fraud_threshold <= 0.2%

## 10. Test Plan (Minimum)
- replay attack simulation
- node compromise simulation
- forced kill switch test
- repeated failure escalation test
- human review token validation test

## 11. Rollout Plan
- Phase 1: shadow mode in OBSERVE/EVALUATE only.
- Phase 2: limited CONTAIN on 5% traffic.
- Phase 3: full bounded autonomy + manual fallback.

## 12. Open Decisions
- Final risk scoring weights.
- Approval token issuer and expiration policy.
- Cross-region consistency strategy for HALT/RESUME.
