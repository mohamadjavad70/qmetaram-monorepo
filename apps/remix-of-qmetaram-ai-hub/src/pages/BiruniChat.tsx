import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { getModuleById } from "@/data/modules";
import { Send, ArrowLeft, Terminal, Leaf, Activity, Shield, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getChatUrl, getSupabaseFunctionHeaders } from "@/config/api";
import { supabase } from "@/integrations/supabase/client";
import { validateChatInput } from "@/lib/chatValidation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const BiruniChat = () => {
  const module = getModuleById("biruni");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const terminalPrefix = "BIRUNI://TRADITIONAL_MEDICINE_SYSTEM";
  const systemVersion = "v2.5.0-quantum";

  // Boot sequence on mount
  useEffect(() => {
    const bootMessages: Message[] = [
      {
        id: "boot-1",
        role: "assistant",
        content: `[SYSTEM] Initializing ${terminalPrefix}...`,
        timestamp: new Date()
      },
      {
        id: "boot-2",
        role: "assistant", 
        content: `[SYSTEM] Loading traditional medicine database...
[SYSTEM] Connecting to holistic diagnosis modules...
[SYSTEM] Herbal remedy index loaded: 4,892 entries
[SYSTEM] Ancient wisdom protocols: ACTIVE`,
        timestamp: new Date()
      },
      {
        id: "boot-3",
        role: "assistant",
        content: `╔══════════════════════════════════════════════════════════════╗
║                    BIRUNI TERMINAL ${systemVersion}                    ║
║              Traditional Medicine & Holistic Health             ║
╠══════════════════════════════════════════════════════════════╣
║  STATUS: ONLINE                                                ║
║  DIAGNOSIS MODULES: READY                                       ║
║  HERBAL DATABASE: SYNCHRONIZED                                  ║
╚══════════════════════════════════════════════════════════════╝

Peace be upon you, seeker of wellness.

I am Biruni, guardian of traditional Persian medicine wisdom.
Enter your health inquiry or symptoms for holistic analysis.

> Type your query below and press ENTER to submit.
> All consultations are for informational purposes only.
> Always consult a healthcare professional for medical advice.`,
        timestamp: new Date()
      }
    ];
    setMessages(bootMessages);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!module) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center font-mono text-green-500">
          <h1 className="text-xl mb-4">[ERROR] Module Not Found</h1>
          <Link to="/">
            <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500/10">
              RETURN_HOME
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const ensureConversation = async (firstMessage: string): Promise<string | null> => {
    if (conversationId) return conversationId;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const title = `BIRUNI: ${firstMessage.slice(0, 40)}...`;
    
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({
        title,
        module_id: "biruni",
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    setConversationId(data.id);
    return data.id;
  };

  const saveMessage = async (convId: string | null, role: string, content: string) => {
    if (!convId) return;
    try {
      await supabase.from("chat_messages").insert({
        conversation_id: convId,
        role,
        content,
        module: "biruni",
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const streamChat = async (userMessage: Message): Promise<string> => {
    const chatUrl = getChatUrl();
    const { data: { session } } = await supabase.auth.getSession();
    const headers = getSupabaseFunctionHeaders(session?.access_token);

    try {
      const resp = await fetch(chatUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: messages.filter(m => !m.id.startsWith("boot-")).map(m => ({
            role: m.role,
            content: m.content,
          })).concat([{ role: "user", content: userMessage.content }]),
          module: "biruni",
          systemPrompt: `You are Biruni, the Traditional Medicine Terminal System. You respond in a clinical, structured format like a terminal system while maintaining warmth and wisdom.

Format your responses with:
- [DIAGNOSIS] for health assessments
- [REMEDY] for treatment suggestions
- [CAUTION] for warnings
- [WISDOM] for ancient teachings
- Use bullet points and structured blocks
- End responses with a relevant proverb or wisdom quote

Always recommend consulting healthcare professionals for serious conditions.`,
        }),
      });

      if (resp.status === 429) {
        toast({ title: "Rate Limit", description: "Please wait and try again.", variant: "destructive" });
        return "";
      }

      if (resp.status === 402) {
        toast({ title: "Usage Limit", description: "Please add credits to continue.", variant: "destructive" });
        return "";
      }

      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";
      let streamDone = false;

      const assistantId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, {
        id: assistantId,
        role: "assistant" as const,
        content: "[PROCESSING]...",
        timestamp: new Date(),
      }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) =>
                prev.map((m) => m.id === assistantId ? { ...m, content: assistantContent } : m)
              );
            }
          } catch {
            continue;
          }
        }
      }

      return assistantContent;
    } catch (error) {
      console.error("Chat error:", error);
      toast({ title: "Error", description: "Failed to get response.", variant: "destructive" });
      return "";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const validation = validateChatInput(input);
    if (!validation.success) {
      toast({ title: "Invalid Input", description: validation.error, variant: "destructive" });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: validation.data!,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const convId = await ensureConversation(userMessage.content);
      if (!convId) {
        toast({
          title: "Guest Mode",
          description: "Chat works without sign-in, but history will not be saved.",
        });
      }
      await saveMessage(convId, "user", userMessage.content);
      const assistantContent = await streamChat(userMessage);
      if (assistantContent) {
        await saveMessage(convId, "assistant", assistantContent);
      }
    } catch (error: any) {
      console.error("Error in chat:", error);
      toast({ title: "Error", description: "Failed to get response.", variant: "destructive" });
    }

    setIsLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatContent = (content: string) => {
    // Add terminal-style formatting
    return content
      .replace(/\[DIAGNOSIS\]/g, '\n╔═ DIAGNOSIS ═══════════════════════════════════════╗\n')
      .replace(/\[REMEDY\]/g, '\n╔═ REMEDY ══════════════════════════════════════════╗\n')
      .replace(/\[CAUTION\]/g, '\n⚠️  CAUTION: ')
      .replace(/\[WISDOM\]/g, '\n✦ WISDOM: ');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col font-mono">
      <Navbar />
      
      <div className="flex-1 flex flex-col pt-16">
        {/* Terminal Header */}
        <header className="h-12 border-b border-[#8b4513]/50 bg-black/80 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to="/modules/biruni" className="flex items-center gap-2 text-[#8b4513] hover:text-[#cd853f] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs">EXIT_TERMINAL</span>
            </Link>
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#8b4513]" />
              <span className="text-[#8b4513] text-sm">{terminalPrefix}</span>
              <span className="text-[#cd853f]/60 text-xs">{systemVersion}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1 text-green-500">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>ONLINE</span>
            </div>
            <div className="flex items-center gap-2 text-[#8b4513]/60">
              <Leaf className="w-3 h-3" />
              <span>HERBAL_DB</span>
              <Activity className="w-3 h-3 ml-2" />
              <span>DIAGNOSIS</span>
              <Shield className="w-3 h-3 ml-2" />
              <span>SECURE</span>
            </div>
          </div>
        </header>

        {/* Terminal Output */}
        <div className="flex-1 overflow-auto p-4 bg-gradient-to-b from-black to-[#0a0604]">
          <div className="max-w-4xl mx-auto space-y-2">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`${message.role === "user" ? "text-cyan-400" : "text-[#cd853f]"}`}
                >
                  {message.role === "user" ? (
                    <div className="flex items-start gap-2">
                      <span className="text-green-500 select-none">{">"}</span>
                      <span className="text-cyan-400">{message.content}</span>
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap text-[#cd853f] leading-relaxed text-sm">
                      {formatContent(message.content)}
                    </pre>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[#8b4513]"
              >
                <span className="animate-pulse">▊</span>
                <span className="ml-2 text-xs">PROCESSING QUERY...</span>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Terminal Input */}
        <div className="border-t border-[#8b4513]/30 bg-black/90 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 bg-[#0a0604] border border-[#8b4513]/40 rounded px-4 py-3">
              <span className="text-green-500 select-none font-bold">$</span>
              <span className="text-[#8b4513]/60 select-none">biruni@qmetaram:~</span>
              <span className="text-[#8b4513] select-none">#</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your health inquiry..."
                className="flex-1 bg-transparent border-0 text-cyan-400 placeholder:text-[#8b4513]/40 focus:outline-none text-sm"
                disabled={isLoading}
                autoFocus
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="sm"
                className="bg-[#8b4513] hover:bg-[#cd853f] text-black font-mono text-xs"
              >
                EXECUTE
              </Button>
            </div>
            <div className="mt-2 flex items-center justify-between text-[#8b4513]/40 text-xs">
              <span>Press ENTER to submit query</span>
              <span>© QMETARAM Traditional Medicine System</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiruniChat;