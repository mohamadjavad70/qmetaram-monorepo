import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const resolveAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        navigate("/dashboard", { replace: true });
        return;
      }
      navigate("/auth", { replace: true });
    };

    resolveAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen-safe flex items-center justify-center p-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Redirecting...</span>
      </div>
    </div>
  );
}