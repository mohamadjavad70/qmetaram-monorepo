import { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { getModuleById, modules, Module } from "@/data/modules";
import { Send, ArrowLeft, Bot, User, Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { API_CONFIG, getChatUrl, getSupabaseFunctionHeaders } from "@/config/api";
import { supabase } from "@/integrations/supabase/client";
import { validateChatInput } from "@/lib/chatValidation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const ModuleChat = () => {
  const { id } = useParams<{ id: string }>();
  const module = getModuleById(id || "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Add welcome message on mount
  useEffect(() => {
    if (module?.welcomeMessage && messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: module.welcomeMessage,
        timestamp: new Date()
      }]);
    }
  }, [module]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!module) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-orbitron text-2xl font-bold mb-4">Module Not Found</h1>
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const ensureConversation = async (firstMessage: string): Promise<string | null> => {
    if (conversationId) return conversationId;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const title = `${module.name}: ${firstMessage.slice(0, 40)}...`;
    
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({
        title,
        module_id: module.id,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    setConversationId(data.id);
    return data.id;
  };

  const saveMessage = async (convId: string, role: string, content: string) => {
    try {
      await supabase.from("chat_messages").insert({
        conversation_id: convId,
        role,
        content,
        module: module.id,
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
          messages: messages.filter(m => m.id !== "welcome").map(m => ({
            role: m.role,
            content: m.content,
          })).concat([{ role: "user", content: userMessage.content }]),
          module: module.id,
          systemPrompt: module.systemPrompt,
        }),
      });

      if (resp.status === 429) {
        toast({
          title: "Rate Limit Exceeded",
          description: "Please wait a moment and try again.",
          variant: "destructive",
        });
        return "";
      }

      if (resp.status === 402) {
        toast({
          title: "Usage Limit Reached",
          description: "Please add credits to continue using AI features.",
          variant: "destructive",
        });
        return "";
      }

      if (!resp.ok || !resp.body) {
        throw new Error("Failed to start stream");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";
      let streamDone = false;

      const assistantId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, {
        id: assistantId,
        role: "assistant" as const,
        content: "",
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
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                )
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
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
      return "";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const validation = validateChatInput(input);
    if (!validation.success) {
      toast({
        title: "Invalid Input",
        description: validation.error || "Please check your message.",
        variant: "destructive",
      });
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
      if (convId) {
        await saveMessage(convId, "user", userMessage.content);
      } else {
        toast({
          title: "Guest mode",
          description: "Chat history will not be saved unless you sign in.",
        });
      }
      const assistantContent = await streamChat(userMessage);
      if (assistantContent && convId) {
        await saveMessage(convId, "assistant", assistantContent);
      }
    } catch (error: unknown) {
      console.error("Error in chat:", error);
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col pt-16">
        {/* Module Header */}
        <header 
          className="h-16 border-b flex items-center justify-between px-4"
          style={{ 
            borderColor: `${module.color}30`,
            background: `linear-gradient(to right, ${module.color}10, transparent)`
          }}
        >
          <div className="flex items-center gap-4">
            <Link 
              to={`/modules/${module.id}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to {module.name}</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${module.color}30, ${module.color}10)`,
                  border: `1px solid ${module.color}40`,
                }}
              >
                <img src={module.iconImage} alt={module.name} className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h1 className="font-orbitron font-bold" style={{ color: module.color }}>
                  {module.name}
                </h1>
                <p className="text-xs text-muted-foreground">{module.specialty}</p>
              </div>
            </div>
          </div>

          {module.features && (
            <div className="hidden md:flex items-center gap-2">
              {module.features.slice(0, 3).map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                  style={{
                    backgroundColor: `${module.color}15`,
                    color: module.color,
                  }}
                >
                  <feature.icon className="w-3 h-3" />
                  <span>{feature.title}</span>
                </div>
              ))}
            </div>
          )}
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: message.role === "assistant"
                        ? `linear-gradient(135deg, ${module.color}30, ${module.color}10)`
                        : "linear-gradient(135deg, hsl(var(--primary)/0.3), hsl(var(--primary)/0.1))",
                      border: `1px solid ${message.role === "assistant" ? module.color : "hsl(var(--primary))"}40`,
                    }}
                  >
                    {message.role === "assistant" ? (
                      <img src={module.iconImage} alt={module.name} className="w-6 h-6 object-contain" />
                    ) : (
                      <User className="w-5 h-5 text-primary" />
                    )}
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "glass"
                    }`}
                    style={{
                      borderColor: message.role === "assistant" ? `${module.color}30` : undefined,
                    }}
                  >
                    {message.role === "assistant" && (
                      <div
                        className="mb-2 inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-semibold"
                        style={{ backgroundColor: `${module.color}20`, color: module.color }}
                      >
                        <span>{module.emoji ? `${module.emoji} ` : ""}{module.title || module.name}</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    {message.content === "" && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-current animate-bounce delay-100" />
                        <div className="w-2 h-2 rounded-full bg-current animate-bounce delay-200" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div 
          className="border-t p-4"
          style={{ borderColor: `${module.color}20` }}
        >
          <div className="max-w-3xl mx-auto">
            <div 
              className="glass rounded-2xl p-3"
              style={{ borderColor: `${module.color}30` }}
            >
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${module.name} anything...`}
                className="min-h-[60px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 p-0"
                disabled={isLoading}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="w-3 h-3" />
                  <span>Press Enter to send, Shift+Enter for new line</span>
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="sm"
                  style={{
                    background: `linear-gradient(135deg, ${module.color}, ${module.color}cc)`,
                  }}
                  className="text-white"
                >
                  <Send className="w-4 h-4 mr-1" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleChat;