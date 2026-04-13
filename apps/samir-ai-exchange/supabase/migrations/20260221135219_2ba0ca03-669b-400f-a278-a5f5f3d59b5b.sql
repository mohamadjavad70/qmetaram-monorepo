
-- 1. Chat history table for AI agent conversations
CREATE TABLE public.chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  agent_id uuid NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  content text NOT NULL,
  tier text NOT NULL DEFAULT 'basic',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat" ON public.chat_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat" ON public.chat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all chat" ON public.chat_history
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 2. Employees table for payroll
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  full_name text NOT NULL,
  role_title text NOT NULL DEFAULT 'Team Member',
  daily_rate numeric NOT NULL DEFAULT 200,
  virtual_balance numeric NOT NULL DEFAULT 0,
  total_earned numeric NOT NULL DEFAULT 0,
  total_withdrawn numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  hired_at timestamptz NOT NULL DEFAULT now(),
  last_credit_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage employees" ON public.employees
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Employees can view own record" ON public.employees
  FOR SELECT USING (auth.uid() = user_id);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_history;
