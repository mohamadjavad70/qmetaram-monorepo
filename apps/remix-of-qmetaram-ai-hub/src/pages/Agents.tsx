import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Bot, Plus, Trash2, Edit2, X, Save, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface Agent {
  id: string;
  name: string;
  prompt: string | null;
  module_type: string;
  status: string;
  created_at: string;
}

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [moduleType, setModuleType] = useState("biruni");
  const [loading, setLoading] = useState(false);
  const [agentLimit, setAgentLimit] = useState(3);
  const { toast } = useToast();

  const loadAgents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from("agents").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) setAgents(data);

    const { data: plan } = await supabase.from("user_plans").select("agent_limit").eq("user_id", user.id).single();
    if (plan) setAgentLimit(plan.agent_limit);
  };

  useEffect(() => { loadAgents(); }, []);

  const handleSubmit = async () => {
    if (!name.trim()) { toast({ title: "خطا", description: "نام ایجنت الزامی است", variant: "destructive" }); return; }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingId) {
      const { error } = await supabase.from("agents").update({ name: name.trim(), prompt: prompt.trim() || null, module_type: moduleType }).eq("id", editingId);
      if (error) { toast({ title: "خطا", description: error.message, variant: "destructive" }); }
      else { toast({ title: "موفق", description: "ایجنت بروزرسانی شد" }); }
    } else {
      const { error } = await supabase.from("agents").insert({ name: name.trim(), prompt: prompt.trim() || null, module_type: moduleType, user_id: user.id });
      if (error) { toast({ title: "خطا", description: error.message.includes("Agent limit") ? "به سقف ایجنت رسیده‌اید. لطفاً پلن خود را ارتقاء دهید." : error.message, variant: "destructive" }); }
      else { toast({ title: "موفق", description: "ایجنت جدید ساخته شد" }); }
    }

    setName(""); setPrompt(""); setModuleType("biruni"); setShowForm(false); setEditingId(null);
    setLoading(false);
    loadAgents();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("agents").delete().eq("id", id);
    if (error) toast({ title: "خطا", description: error.message, variant: "destructive" });
    else { toast({ title: "حذف شد" }); loadAgents(); }
  };

  const startEdit = (a: Agent) => {
    setEditingId(a.id); setName(a.name); setPrompt(a.prompt ?? ""); setModuleType(a.module_type); setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Link to="/dashboard"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />داشبورد</Button></Link>
              <h1 className="font-orbitron text-xl font-bold">ایجنت‌ها ({agents.length}/{agentLimit})</h1>
            </div>
            {!showForm && agents.length < agentLimit && (
              <Button onClick={() => { setShowForm(true); setEditingId(null); setName(""); setPrompt(""); }} size="sm">
                <Plus className="w-4 h-4 mr-1" />ایجنت جدید
              </Button>
            )}
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <Card className="glass-strong p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold">{editingId ? "ویرایش ایجنت" : "ایجنت جدید"}</h3>
                    <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setEditingId(null); }}><X className="w-4 h-4" /></Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>نام</Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="نام ایجنت" maxLength={100} className="mt-1" />
                    </div>
                    <div>
                      <Label>پرامپت سیستم</Label>
                      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="دستورالعمل اختیاری..." maxLength={2000}
                        className="mt-1 w-full rounded-lg border border-border bg-input p-3 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                      <Label>ماژول</Label>
                      <Select value={moduleType} onValueChange={setModuleType}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="biruni">🔭 بیرونی</SelectItem>
                          <SelectItem value="beethoven">🎵 بتهوون</SelectItem>
                          <SelectItem value="da-vinci">🎨 دا وینچی</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleSubmit} disabled={loading} className="w-full">
                      <Save className="w-4 h-4 mr-2" />{editingId ? "بروزرسانی" : "ساخت"}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            {agents.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bot className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-bold">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.module_type} • {new Date(a.created_at).toLocaleDateString("fa-IR")}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(a)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </Card>
              </motion.div>
            ))}
            {agents.length === 0 && !showForm && (
              <div className="text-center py-12 text-muted-foreground">
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>هنوز ایجنتی نساخته‌اید</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
