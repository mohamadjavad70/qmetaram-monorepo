import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { modules, Module, aiMarketplaceData } from "@/data/modules";
import { Send, Sparkles, X, Check, Bot, User, Globe, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getChatUrl, getSupabaseFunctionHeaders } from "@/config/api";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { supabase } from "@/integrations/supabase/client";
import { validateChatInput } from "@/lib/chatValidation";

const ALL_FUSION_MODULES = ["tesla", "mowlana", "biruni", "matrix", "da-vinci", "beethoven", "quantum-pulse"] as const;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  module: string;
  timestamp: Date;
}

const Chat = () => {
  const [selectedModule, setSelectedModule] = useState<Module>(modules[7]);
  const [selectedExternalModel, setSelectedExternalModel] = useState<number | null>(null);
  const [fusionModules, setFusionModules] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showConversationSidebar, setShowConversationSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const getModuleMeta = (moduleId: string) => {
    const mod = modules.find((m) => m.id === moduleId);
    if (mod) {
      return {
        name: mod.namePersian || mod.name,
        color: mod.color,
        iconImage: mod.iconImage,
        emoji: mod.emoji,
        title: mod.title,
        isExternal: false,
      };
    }
    if (moduleId.startsWith("external-")) {
      return { name: "External Model", color: "#3b82f6", iconImage: "", emoji: "🌐", title: "External Model", isExternal: true };
    }
    return { name: "Q Core", color: "#ff6347", iconImage: "", emoji: "🧠", title: "Q Core", isExternal: true };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation messages when a conversation is selected
  const loadConversation = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const loadedMessages: Message[] = (data || []).map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        module: msg.module || selectedModule.id,
        timestamp: new Date(msg.created_at),
      }));

      setMessages(loadedMessages);
      setCurrentConversationId(conversationId);
    } catch (error) {
      console.error("Error loading conversation:", error);
      toast({
        title: "Error",
        description: "Failed to load conversation.",
        variant: "destructive",
      });
    }
  };

  const handleSelectConversation = (id: string | null) => {
    if (id) {
      loadConversation(id);
    } else {
      handleNewConversation();
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
  };

  // Save message to database
  const saveMessage = async (conversationId: string, role: string, content: string, module: string) => {
    try {
      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        role,
        content,
        module,
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  // Create or update conversation for authenticated users; guests can still chat without persistence.
  const ensureConversation = async (firstMessage: string): Promise<string | null> => {
    if (currentConversationId) {
      await supabase
        .from("chat_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", currentConversationId);
      return currentConversationId;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({
        title,
        module_id: selectedExternalModel ? `external-${selectedExternalModel}` : selectedModule.id,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    setCurrentConversationId(data.id);
    return data.id;
  };

  const toggleFusion = (moduleId: string) => {
    if (moduleId === selectedModule.id) return;
    setFusionModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : prev.length < 3
        ? [...prev, moduleId]
        : prev
    );
  };

  const streamChat = async (userMessage: Message, moduleOverride?: string): Promise<string> => {
    const externalModel = selectedExternalModel ? aiMarketplaceData.find(m => m.rank === selectedExternalModel) : null;
    
    const chatUrl = getChatUrl();

    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = getSupabaseFunctionHeaders(session?.access_token);
    
    try {
      const resp = await fetch(chatUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: messages.filter(m => m.role === "user" || m.role === "assistant").map(m => ({
            role: m.role,
            content: m.content,
          })).concat([{ role: "user", content: userMessage.content }]),
          model: externalModel?.name || undefined,
          module: selectedExternalModel ? undefined : (moduleOverride || selectedModule.id),
          fusion: selectedExternalModel || moduleOverride ? undefined : fusionModules,
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
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let assistantContent = "";
      let streamDone = false;

      // Create initial assistant message
      const assistantId = (Date.now() + 1).toString();
      const moduleId = moduleOverride || (externalModel ? `external-${externalModel.rank}` : selectedModule.id);
      setMessages((prev) => [...prev, {
        id: assistantId,
        role: "assistant" as const,
        content: "",
        module: moduleId,
        timestamp: new Date(),
      }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (let line of lines) {
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data:")) continue;

          const jsonStr = line.replace(/^data:\s*/, "").trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            continue;
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

      // Final flush for a trailing incomplete line.
      if (buffer.trim() && buffer.startsWith("data:")) {
        const jsonStr = buffer.replace(/^data:\s*/, "").trim();
        if (jsonStr && jsonStr !== "[DONE]") {
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
            // Ignore incomplete trailing chunk.
          }
        }
      }

      if (!assistantContent.trim()) {
        const fallbackText = "پاسخی دریافت شد اما قابل نمایش نبود. لطفا یک بار دیگر تلاش کنید.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: fallbackText } : m
          )
        );
        return fallbackText;
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

  const runConsensusForModules = async (opinionModules: string[]) => {
    if (!input.trim() || isLoading || selectedExternalModel) return;
    const validation = validateChatInput(input);
    if (!validation.success) {
      toast({
        title: "Invalid Input",
        description: validation.error || "Please check your message and try again.",
        variant: "destructive",
      });
      return;
    }

    const sanitizedContent = validation.data!;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: sanitizedContent,
      module: selectedModule.id,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationId = await ensureConversation(userMessage.content);
      if (conversationId) {
        await saveMessage(conversationId, "user", userMessage.content, userMessage.module);
      }

      const opinions: Array<{ moduleId: string; content: string }> = [];

      for (const moduleId of opinionModules) {
        const opinion = await streamChat(userMessage, moduleId);
        if (opinion) {
          opinions.push({ moduleId, content: opinion });
          if (conversationId) {
            await saveMessage(conversationId, "assistant", opinion, moduleId);
          }
        }
      }

      if (opinions.length > 1) {
        const synthesisPrompt = [
          "Question:",
          sanitizedContent,
          "",
          "Module opinions:",
          ...opinions.map((o) => {
            const meta = getModuleMeta(o.moduleId);
            return `- ${meta.name}: ${o.content}`;
          }),
          "",
          "Now provide one final integrated answer that combines these perspectives and clearly states practical next steps.",
        ].join("\n");

        const synthesisUserMessage: Message = {
          id: `${Date.now()}-synthesis-user`,
          role: "user",
          content: synthesisPrompt,
          module: "qmetaram",
          timestamp: new Date(),
        };

        const finalAnswer = await streamChat(synthesisUserMessage, "qmetaram");
        if (finalAnswer && conversationId) {
          await saveMessage(conversationId, "assistant", finalAnswer, "qmetaram");
        }
      }
    } catch (error: unknown) {
      console.error("Fusion error:", error);
      toast({
        title: "Fusion Error",
        description: "Could not complete module fusion. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleFusionConsensus = async () => {
    if (fusionModules.length === 0) return;
    await runConsensusForModules([selectedModule.id, ...fusionModules]);
  };

  const handleAllModulesConsensus = async () => {
    await runConsensusForModules([...ALL_FUSION_MODULES]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Validate and sanitize input before processing
    const validation = validateChatInput(input);
    if (!validation.success) {
      toast({
        title: "Invalid Input",
        description: validation.error || "Please check your message and try again.",
        variant: "destructive",
      });
      return;
    }

    const sanitizedContent = validation.data!;
    const externalModel = selectedExternalModel ? aiMarketplaceData.find(m => m.rank === selectedExternalModel) : null;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: sanitizedContent,
      module: externalModel ? `external-${externalModel.rank}` : selectedModule.id,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Authenticated users get saved conversations; guests still receive real-time responses.
      const conversationId = await ensureConversation(userMessage.content);
      if (conversationId) {
        await saveMessage(conversationId, "user", userMessage.content, userMessage.module);
      } else {
        toast({
          title: "Guest mode",
          description: "Chat history will not be saved unless you sign in.",
        });
      }

      const assistantContent = await streamChat(userMessage);

      if (assistantContent && conversationId) {
        await saveMessage(conversationId, "assistant", assistantContent, userMessage.module);
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

  const getCurrentModelInfo = () => {
    if (selectedExternalModel) {
      const model = aiMarketplaceData.find(m => m.rank === selectedExternalModel);
      return model ? { name: model.name, color: "#3b82f6", icon: <Globe className="w-5 h-5" /> } : null;
    }
    return { name: selectedModule.name, color: selectedModule.color, icon: null };
  };

  const currentModel = getCurrentModelInfo();

  return (
    <div className="min-h-screen-safe bg-background">
      <Navbar />
      
      <div className="pt-14 sm:pt-16 h-screen-safe flex flex-col md:flex-row">
        {/* Mobile Module Selector - Horizontal Scroll */}
        <div className="md:hidden border-b border-border/50 bg-card/30 overflow-x-auto pb-safe">
          <div className="flex items-center gap-2 p-3 min-w-max">
            {modules.map((module) => {
              const isSelected = selectedModule.id === module.id && !selectedExternalModel;
              return (
                <motion.button
                  key={module.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedModule(module);
                    setSelectedExternalModel(null);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap transition-all touch-target ${
                    isSelected ? "glass border-2" : "bg-muted/30"
                  }`}
                  style={{
                    borderColor: isSelected ? module.color : "transparent",
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${module.color}30, ${module.color}10)`,
                      border: `1px solid ${module.color}40`,
                    }}
                  >
                    <img src={module.iconImage} alt={module.name} className="w-5 h-5 object-contain" />
                  </div>
                  <span 
                    className="font-medium text-xs"
                    style={{ color: isSelected ? module.color : undefined }}
                  >
                    {module.namePersian}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Left Sidebar - Conversation History (Desktop) */}
        <aside className={`w-64 lg:w-72 border-r border-border/50 bg-card/30 hidden md:flex flex-col flex-shrink-0 transition-all ${
          showConversationSidebar ? "" : "md:hidden"
        }`}>
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Menu className="w-5 h-5 text-primary" />
              <h2 className="font-orbitron font-bold text-lg text-foreground">Chat History</h2>
            </div>
          </div>
          <ConversationSidebar
            selectedConversationId={currentConversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
          />
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col">
          {/* Chat Header */}
          <header className="h-16 border-b border-border/50 bg-card/30 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              {selectedExternalModel ? (
                <>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border border-primary/40">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="font-orbitron font-bold text-primary">
                      {aiMarketplaceData.find(m => m.rank === selectedExternalModel)?.name || "External AI"}
                    </h1>
                    <p className="text-xs text-muted-foreground">
                      {aiMarketplaceData.find(m => m.rank === selectedExternalModel)?.provider}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${selectedModule.color}30, ${selectedModule.color}10)`,
                      border: `1px solid ${selectedModule.color}40`,
                    }}
                  >
                    <img src={selectedModule.iconImage} alt={selectedModule.name} className="w-8 h-8 object-contain" />
                  </div>
                  <div>
                    <h1 className="font-orbitron font-bold" style={{ color: selectedModule.color }}>
                      {selectedModule.name}
                    </h1>
                    <p className="text-xs text-muted-foreground">{selectedModule.specialty}</p>
                  </div>
                </>
              )}
            </div>
            
            {fusionModules.length > 0 && !selectedExternalModel && (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Fusion Mode</span>
                <div className="flex -space-x-2">
                  {fusionModules.map((id) => {
                    const mod = modules.find((m) => m.id === id);
                    if (!mod) return null;
                    return (
                      <div
                        key={id}
                        className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-background overflow-hidden"
                        style={{ backgroundColor: mod.color }}
                      >
                        <img src={mod.iconImage} alt={mod.name} className="w-4 h-4 object-contain" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </header>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-20">
                  {selectedExternalModel ? (
                    <>
                      <div className="w-24 h-24 rounded-2xl mx-auto mb-6 flex items-center justify-center animate-pulse bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/40">
                        <Globe className="w-12 h-12 text-primary" />
                      </div>
                      <h2 className="font-orbitron text-xl font-bold mb-2 text-primary">
                        {aiMarketplaceData.find(m => m.rank === selectedExternalModel)?.name}
                      </h2>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Start a conversation with {aiMarketplaceData.find(m => m.rank === selectedExternalModel)?.name} powered by the Lovable AI Gateway.
                      </p>
                    </>
                  ) : (
                    <>
                      <div
                        className="w-24 h-24 rounded-2xl mx-auto mb-6 flex items-center justify-center animate-pulse overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${selectedModule.color}30, ${selectedModule.color}10)`,
                          border: `1px solid ${selectedModule.color}40`,
                        }}
                      >
                        <img src={selectedModule.iconImage} alt={selectedModule.name} className="w-16 h-16 object-contain" />
                      </div>
                      <h2 className="font-orbitron text-xl font-bold mb-2" style={{ color: selectedModule.color }}>
                        {selectedModule.name}
                      </h2>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        {selectedModule.description}
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 mt-6">
                        {selectedModule.capabilities.map((cap) => (
                          <span
                            key={cap}
                            className="text-xs px-3 py-1 rounded-full"
                            style={{
                              backgroundColor: `${selectedModule.color}20`,
                              color: selectedModule.color,
                            }}
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              <AnimatePresence>
                  {messages.map((message) => {
                    const mod = modules.find((m) => m.id === message.module) || selectedModule;
                    const isExternal = typeof message.module === 'string' && message.module.startsWith('external-');
                    return (
                      <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: isExternal ? "linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--accent) / 0.1))" : `linear-gradient(135deg, ${mod.color}30, ${mod.color}10)`,
                            border: isExternal ? "1px solid hsl(var(--primary) / 0.4)" : `1px solid ${mod.color}40`,
                          }}
                        >
                          {isExternal ? (
                            <Globe className="w-4 h-4 text-primary" />
                          ) : (
                            <Bot className="w-4 h-4" style={{ color: mod.color }} />
                          )}
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "glass rounded-bl-sm"
                        }`}
                      >
                        {message.role === "assistant" && (() => {
                          const meta = getModuleMeta(message.module);
                          return (
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs"
                              style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                            >
                              {!meta.isExternal && meta.iconImage ? (
                                <img src={meta.iconImage} alt={meta.name} className="w-3.5 h-3.5 object-contain" />
                              ) : (
                                <Globe className="w-3.5 h-3.5" />
                              )}
                              <span className="font-semibold">{meta.emoji ? `${meta.emoji} ` : ""}{meta.title || meta.name}</span>
                            </div>
                          );
                        })()}
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <span className="text-xs opacity-50 mt-2 block">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      {message.role === "user" && (
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: selectedExternalModel 
                        ? "linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--accent) / 0.1))" 
                        : `linear-gradient(135deg, ${selectedModule.color}30, ${selectedModule.color}10)`,
                      border: selectedExternalModel 
                        ? "1px solid hsl(var(--primary) / 0.4)" 
                        : `1px solid ${selectedModule.color}40`,
                    }}
                  >
                    {selectedExternalModel ? (
                      <Globe className="w-4 h-4 text-primary" />
                    ) : (
                      <Bot className="w-4 h-4" style={{ color: selectedModule.color }} />
                    )}
                  </div>
                  <div className="glass rounded-2xl rounded-bl-sm p-4">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          className="w-2 h-2 rounded-full bg-primary"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border/50 bg-card/30 p-3 sm:p-4 pb-safe">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-2 sm:gap-3">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={selectedExternalModel 
                    ? `Ask ${aiMarketplaceData.find(m => m.rank === selectedExternalModel)?.name} anything...`
                    : `Ask ${selectedModule.name} anything...`
                  }
                  className="min-h-[48px] sm:min-h-[50px] max-h-[150px] resize-none bg-muted/50 border-border/50 focus:border-primary/50 text-sm sm:text-base rounded-xl"
                  rows={1}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="h-[48px] sm:h-auto w-[48px] sm:w-auto px-3 sm:px-4 rounded-xl flex-shrink-0"
                  style={{
                    background: selectedExternalModel 
                      ? "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))"
                      : `linear-gradient(135deg, ${selectedModule.color}, ${selectedModule.color}cc)`,
                  }}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              {!selectedExternalModel && fusionModules.length > 0 && (
                <div className="mt-2 flex flex-wrap justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFusionConsensus}
                    disabled={!input.trim() || isLoading}
                    className="border-primary/40 text-primary hover:bg-primary/10"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    دریافت نظر همه ماژول ها + جمع بندی نهایی
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAllModulesConsensus}
                    disabled={!input.trim() || isLoading}
                    className="border-primary/40 text-primary hover:bg-primary/10"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    دریافت نظر از همه ماژول ها (کامل)
                  </Button>
                </div>
              )}
              {!selectedExternalModel && fusionModules.length === 0 && (
                <div className="mt-2 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAllModulesConsensus}
                    disabled={!input.trim() || isLoading}
                    className="border-primary/40 text-primary hover:bg-primary/10"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    دریافت نظر از همه ماژول ها (کامل)
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar - Fusion */}
        {!selectedExternalModel && (
          <aside className="w-64 lg:w-72 border-l border-border/50 bg-card/30 hidden lg:flex flex-col">
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="font-orbitron font-bold text-lg text-foreground">Module Fusion</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Combine up to 3 additional modules</p>
            </div>

            <ScrollArea className="flex-1 p-3">
              <div className="space-y-2">
                {modules
                  .filter((m) => m.id !== selectedModule.id)
                  .map((module) => {
                    const isFused = fusionModules.includes(module.id);
                    return (
                      <motion.button
                        key={module.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleFusion(module.id)}
                        className={`w-full p-3 rounded-xl text-left transition-all ${
                          isFused ? "glass" : "hover:bg-muted/50"
                        }`}
                        style={{
                          borderColor: isFused ? module.color : "transparent",
                          borderWidth: isFused ? 2 : 0,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden"
                              style={{
                                background: `linear-gradient(135deg, ${module.color}30, ${module.color}10)`,
                                border: `1px solid ${module.color}40`,
                              }}
                            >
                              <img src={module.iconImage} alt={module.name} className="w-6 h-6 object-contain" />
                            </div>
                            <span className="font-medium text-sm">{module.name}</span>
                          </div>
                          {isFused ? (
                            <Check className="w-4 h-4" style={{ color: module.color }} />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
              </div>
            </ScrollArea>

            {fusionModules.length > 0 && (
              <div className="p-4 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFusionModules([])}
                  className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Fusion
                </Button>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};

export default Chat;
