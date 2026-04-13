import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { checkModuleAccess } from "@/lib/checkAccess";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface Message { role: "user" | "assistant" | "system"; content: string }

export default function BiruniModule() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "بیرونی@qmetaram:~$ سیستم آماده است. دستور خود را وارد کنید..." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkModuleAccess().then((ok) => {
      if (!ok) navigate("/pricing?upgrade=true", { replace: true });
      else setAccessChecked(true);
    });
  }, [navigate]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { message: userMsg.content, module: "biruni" },
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      if (error) throw error;
      setMessages((m) => [...m, { role: "assistant", content: data?.reply || "خطا در پردازش" }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "❌ خطا در ارتباط با سرور" }]);
    } finally { setLoading(false); }
  };

  if (!accessChecked) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-4 flex flex-col">
        <div className="container mx-auto px-4 flex-1 flex flex-col max-w-3xl">
          <h2 className="font-orbitron text-lg font-bold text-biruni mb-4">🔭 بیرونی — ترمینال هوشمند</h2>
          {/* Terminal */}
          <div className="flex-1 rounded-lg border border-biruni/30 bg-[hsl(230,25%,5%)] p-4 font-mono text-sm overflow-y-auto scrollbar-thin min-h-[300px]">
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-2">
                {m.role === "system" && <span className="text-biruni">{m.content}</span>}
                {m.role === "user" && <span><span className="text-green-400">user@qmetaram:~$</span> {m.content}</span>}
                {m.role === "assistant" && <span className="text-muted-foreground whitespace-pre-wrap">{m.content}</span>}
              </motion.div>
            ))}
            {loading && <span className="text-biruni animate-pulse">▌ در حال پردازش...</span>}
            <div ref={endRef} />
          </div>
          {/* Input */}
          <div className="flex gap-2 mt-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="دستور خود را وارد کنید..."
              maxLength={2000}
              className="flex-1 rounded-lg border border-border bg-input px-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-biruni/50"
            />
            <Button onClick={handleSend} disabled={loading} size="icon" className="bg-biruni hover:bg-biruni/80"><Send className="w-4 h-4" /></Button>
          </div>
        </div>
      </main>
    </div>
  );
}
