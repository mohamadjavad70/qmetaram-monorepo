
-- Invite tokens table: stores hashed tokens for secure invite links
CREATE TABLE public.invite_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  email text NOT NULL,
  created_by uuid NOT NULL,
  assigned_user_id uuid,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  revoked_at timestamptz,
  is_used boolean DEFAULT false,
  is_revoked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invite_tokens ENABLE ROW LEVEL SECURITY;

-- Only admins can manage invite tokens
CREATE POLICY "Admins can manage invite tokens"
ON public.invite_tokens FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Index for fast token lookup
CREATE INDEX idx_invite_tokens_hash ON public.invite_tokens(token_hash);
CREATE INDEX idx_invite_tokens_created_by ON public.invite_tokens(created_by);

-- Audit log table
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  actor_id uuid,
  target_id uuid,
  target_email text,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can read audit logs"
ON public.audit_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Service role inserts (edge functions)
CREATE POLICY "Service role inserts audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (false);

CREATE INDEX idx_audit_logs_event ON public.audit_logs(event_type, created_at DESC);
CREATE INDEX idx_audit_logs_target ON public.audit_logs(target_email, created_at DESC);
