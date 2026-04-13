import { supabase } from "@/integrations/supabase/client";

export async function checkModuleAccess(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Get user's plan limits
  const { data: plan } = await supabase
    .from("user_plans")
    .select("agent_limit")
    .eq("user_id", user.id)
    .single();

  const agentLimit = plan?.agent_limit ?? 3;

  // Get current agent count
  const { count } = await supabase
    .from("agents")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (count ?? 0) < agentLimit;
}
