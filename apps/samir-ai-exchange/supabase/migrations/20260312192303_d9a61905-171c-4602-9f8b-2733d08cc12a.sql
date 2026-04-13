CREATE OR REPLACE FUNCTION public.execute_safe_transfer(p_agent_id uuid, p_amount numeric, p_direction text, p_admin_id uuid DEFAULT NULL)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_reserve RECORD;
  v_agent RECORD;
  v_result jsonb;
  v_admin_id uuid;
BEGIN
  -- SECURITY FIX: Always use auth.uid() instead of caller-supplied p_admin_id
  v_admin_id := auth.uid();
  
  IF NOT public.has_role(v_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Lock rows to prevent race conditions
  SELECT * INTO v_reserve FROM public.system_reserves WHERE label = 'Master Node' FOR UPDATE;
  SELECT * INTO v_agent FROM public.ai_agents WHERE id = p_agent_id FOR UPDATE;

  IF v_reserve IS NULL THEN RAISE EXCEPTION 'Master Node reserve not found'; END IF;
  IF v_agent IS NULL THEN RAISE EXCEPTION 'Agent not found'; END IF;

  IF p_direction = 'to_agent' THEN
    IF v_reserve.balance < p_amount THEN
      RAISE EXCEPTION 'Insufficient Master Node balance: % < %', v_reserve.balance, p_amount;
    END IF;
    UPDATE public.system_reserves SET balance = balance - p_amount, updated_at = now() WHERE id = v_reserve.id;
    UPDATE public.ai_agents SET current_balance = current_balance + p_amount, updated_at = now() WHERE id = p_agent_id;
  ELSIF p_direction = 'to_master' THEN
    IF v_agent.current_balance < p_amount THEN
      RAISE EXCEPTION 'Insufficient agent balance: % < %', v_agent.current_balance, p_amount;
    END IF;
    UPDATE public.system_reserves SET balance = balance + p_amount, updated_at = now() WHERE id = v_reserve.id;
    UPDATE public.ai_agents SET current_balance = current_balance - p_amount, updated_at = now() WHERE id = p_agent_id;
  ELSE
    RAISE EXCEPTION 'Invalid direction: %', p_direction;
  END IF;

  -- Audit log uses auth.uid() not caller-supplied value
  INSERT INTO public.balance_transfers_audit (from_entity, from_id, to_entity, to_id, amount, admin_id, metadata)
  VALUES (
    CASE WHEN p_direction = 'to_agent' THEN 'system_reserves' ELSE 'ai_agents' END,
    CASE WHEN p_direction = 'to_agent' THEN v_reserve.id ELSE p_agent_id END,
    CASE WHEN p_direction = 'to_agent' THEN 'ai_agents' ELSE 'system_reserves' END,
    CASE WHEN p_direction = 'to_agent' THEN p_agent_id ELSE v_reserve.id END,
    p_amount,
    v_admin_id,
    jsonb_build_object(
      'reserve_before', v_reserve.balance,
      'agent_before', v_agent.current_balance,
      'agent_name', v_agent.name
    )
  );

  v_result := jsonb_build_object('success', true, 'transferred', p_amount, 'direction', p_direction);
  RETURN v_result;
END;
$function$;