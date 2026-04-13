# Cognitive Latency Horizon v1

Status: Draft-Ready
Owner: Q-NET Core

## Purpose
Define the boundary where autonomous Guardian decisions become operationally faster than human-in-the-loop intervention.

## Core Definition
The Cognitive Latency Horizon is reached when the end-to-end containment loop stays below 80 ms at P95 under bounded-autonomy rules.

## Decomposition
- Detection budget: <= 20 ms
- Risk scoring and policy evaluation: <= 15 ms
- PQC envelope verification: <= 15 ms
- Routing / quarantine propagation: <= 20 ms
- Audit emission: <= 10 ms

## Preconditions
- Edge runtime is WASM-isolated.
- Guardian actions are blast-radius bounded.
- Kill switch propagation is deterministic across regions.
- Telemetry sampling does not block quarantine action.

## Safety Constraint
Crossing the horizon does not remove human authority. It only changes the default path from "manual review first" to "bounded auto-execution first, auditable rollback second".

## Required Metrics
- containment_p95_ms
- containment_p99_ms
- route_swap_p95_ms
- proof_verify_p95_ms
- replay_reject_rate
- false_positive_rate

## Go / No-Go Rule
- Go: P95 containment < 80 ms and false positive rate <= 0.5%
- No-Go: Any condition above threshold or any non-deterministic halt/resume behavior

## Operational Consequence
At the horizon, dashboards become observability surfaces, not approval gates.