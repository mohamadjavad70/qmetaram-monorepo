
-- Create plan type enum
CREATE TYPE public.plan_type AS ENUM ('starter', 'pro', 'business');

-- Create user_plans table
CREATE TABLE public.user_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan plan_type NOT NULL DEFAULT 'starter',
  subdomain TEXT,
  agent_limit INTEGER NOT NULL DEFAULT 1,
  storage_limit_mb INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

-- Users can view their own plan
CREATE POLICY "Users can view their own plan"
  ON public.user_plans FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own plan (initial setup)
CREATE POLICY "Users can insert their own plan"
  ON public.user_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own plan
CREATE POLICY "Users can update their own plan"
  ON public.user_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_plans_updated_at
  BEFORE UPDATE ON public.user_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Security definer function for service_role plan activation
CREATE OR REPLACE FUNCTION public.apply_plan_limits(p_user UUID, p_plan plan_type)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agent_limit INTEGER;
  v_storage_limit INTEGER;
BEGIN
  -- Determine limits based on plan
  CASE p_plan
    WHEN 'starter' THEN
      v_agent_limit := 3;
      v_storage_limit := 500;
    WHEN 'pro' THEN
      v_agent_limit := 15;
      v_storage_limit := 5000;
    WHEN 'business' THEN
      v_agent_limit := 100;
      v_storage_limit := 50000;
  END CASE;

  -- Upsert user plan
  INSERT INTO public.user_plans (user_id, plan, agent_limit, storage_limit_mb)
  VALUES (p_user, p_plan, v_agent_limit, v_storage_limit)
  ON CONFLICT (user_id)
  DO UPDATE SET
    plan = EXCLUDED.plan,
    agent_limit = EXCLUDED.agent_limit,
    storage_limit_mb = EXCLUDED.storage_limit_mb,
    updated_at = now();
END;
$$;
