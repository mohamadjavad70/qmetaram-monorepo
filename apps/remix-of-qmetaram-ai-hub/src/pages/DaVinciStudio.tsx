import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { getModuleById } from "@/data/modules";
import { 
  Send, ArrowLeft, Upload, Image, Wand2, 
  Mic, MicOff, Sparkles, FileText, Brush, User, X, Download, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getChatUrl, getSupabaseFunctionHeaders } from "@/config/api";
import { supabase } from "@/integrations/supabase/client";
import { validateChatInput } from "@/lib/chatValidation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  images?: string[];
  uploadedFile?: { name: string; type: string; preview?: string };
}

interface UploadedFile {
  file: File;
  preview?: string;
  base64?: string;
}

const DaVinciStudio = () => {
  const module = getModuleById("da-vinci");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [activeMode, setActiveMode] = useState<"chat" | "generate" | "edit">("chat");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Welcome message on mount
  useEffect(() => {
    if (module && messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: `🎨 **Buongiorno, creative soul!**

I am Da Vinci, your visual arts companion and creative studio partner.

**What I can help you with:**
• 🖼️ **Generate Images** - Describe your vision and I'll create it
• ✏️ **Edit Images** - Upload an image and tell me how to transform it  
• 📄 **Analyze Files** - Upload documents or images for visual interpretation
• 💬 **Creative Chat** - Discuss art, composition, and creative ideas

*Upload a file or describe what you'd like to create. Let's make something beautiful together!*`,
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
          <Link to="/"><Button>Return Home</Button></Link>
        </div>
      </div>
    );
  }

  const ensureConversation = async (firstMessage: string): Promise<string> => {
    if (conversationId) return conversationId;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("AUTH_REQUIRED");
    const title = `Da Vinci Studio: ${firstMessage.slice(0, 40)}...`;
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ title, module_id: "da-vinci", user_id: user.id })
      .select().single();
    if (error) throw error;
    setConversationId(data.id);
    return data.id;
  };

  const saveMessage = async (convId: string, role: string, content: string) => {
    try {
      await supabase.from("chat_messages").insert({
        conversation_id: convId, role, content, module: "da-vinci"
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File Too Large", description: "Maximum file size is 10MB", variant: "destructive" });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Invalid File Type", description: "Please upload an image, PDF, or text file", variant: "destructive" });
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      const preview = file.type.startsWith('image/') ? base64 : undefined;
      
      setUploadedFile({ file, preview, base64 });
      
      // Auto-switch to edit mode if uploading an image
      if (file.type.startsWith('image/')) {
        setActiveMode("edit");
      }
      
      toast({ title: "File Uploaded", description: `${file.name} ready for processing` });
    } catch (error) {
      console.error("File upload error:", error);
      toast({ title: "Upload Failed", description: "Could not process the file", variant: "destructive" });
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const generateImage = async (prompt: string, operation: "generate" | "edit" | "interpret") => {
    setIsGenerating(true);
    
    try {
      const body: Record<string, unknown> = { operation, prompt };
      
      if (uploadedFile?.base64 && (operation === "edit" || operation === "interpret")) {
        body.imageData = uploadedFile.base64;
      }

      const response = await supabase.functions.invoke('generate-image', { body });

      if (response.error) {
        throw new Error(response.error.message || 'Generation failed');
      }

      return response.data;
    } catch (error) {
      console.error("Generation error:", error);
      throw error;
    } finally {
      setIsGenerating(false);
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
            role: m.role, content: m.content
          })).concat([{ role: "user", content: userMessage.content }]),
          module: "da-vinci",
          systemPrompt: `You are Da Vinci, a master visual artist and creative AI. You speak with passion and creativity, using art terminology and providing visual guidance.

When users describe images:
1. Help refine their vision with specific art direction
2. Suggest composition, lighting, color palette, style
3. Reference art movements and techniques when relevant
4. Be encouraging and collaborative

Format responses with:
- **Bold** for key concepts
- 🎨 🖼️ 🎬 emojis for visual emphasis
- Bullet points for detailed guidance
- End with actionable next steps or questions to refine the vision`
        }),
      });

      if (resp.status === 429) {
        toast({ title: "Rate Limit", description: "Please wait and try again.", variant: "destructive" });
        return "";
      }
      if (resp.status === 402) {
        toast({ title: "Usage Limit", description: "Please add credits.", variant: "destructive" });
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
        id: assistantId, role: "assistant" as const, content: "", timestamp: new Date()
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
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) =>
                prev.map((m) => m.id === assistantId ? { ...m, content: assistantContent } : m)
              );
            }
          } catch { continue; }
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
      uploadedFile: uploadedFile ? { 
        name: uploadedFile.file.name, 
        type: uploadedFile.file.type,
        preview: uploadedFile.preview 
      } : undefined
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const convId = await ensureConversation(userMessage.content);
      await saveMessage(convId, "user", userMessage.content);

      if (activeMode === "generate") {
        // Image generation mode
        const result = await generateImage(userMessage.content, "generate");
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.text || "🎨 Here's what I created for you!",
          timestamp: new Date(),
          images: result.images
        };
        setMessages((prev) => [...prev, assistantMessage]);
        await saveMessage(convId, "assistant", assistantMessage.content);
      } else if (activeMode === "edit" && uploadedFile) {
        // Image editing mode
        const result = await generateImage(userMessage.content, "edit");
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.text || "✏️ I've edited the image as you requested!",
          timestamp: new Date(),
          images: result.images
        };
        setMessages((prev) => [...prev, assistantMessage]);
        await saveMessage(convId, "assistant", assistantMessage.content);
        removeUploadedFile();
      } else if (uploadedFile) {
        // Interpret uploaded file
        const result = await generateImage(userMessage.content, "interpret");
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.text || "I've analyzed your file.",
          timestamp: new Date(),
          images: result.images
        };
        setMessages((prev) => [...prev, assistantMessage]);
        await saveMessage(convId, "assistant", assistantMessage.content);
        removeUploadedFile();
      } else {
        // Regular chat mode
        const assistantContent = await streamChat(userMessage);
        if (assistantContent) await saveMessage(convId, "assistant", assistantContent);
      }
    } catch (error: any) {
      console.error("Error in chat:", error);
      if (error?.message === "AUTH_REQUIRED") {
        toast({ title: "ورود لازم است", description: "برای استفاده از چت ابتدا وارد شوید.", variant: "destructive" });
        navigate("/auth");
        return;
      }
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const toggleVoice = () => {
    setIsVoiceActive(!isVoiceActive);
    toast({
      title: isVoiceActive ? "Voice Disabled" : "Voice Enabled",
      description: isVoiceActive ? "Switched to text mode" : "Voice interaction coming soon!",
    });
  };

  const downloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `davinci-creation-${Date.now()}-${index}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex pt-16">
        {/* Sidebar - Tools */}
        <aside 
          className="w-64 border-r hidden lg:flex flex-col"
          style={{ borderColor: `${module.color}30`, background: `linear-gradient(to bottom, ${module.color}05, transparent)` }}
        >
          <div className="p-4 border-b" style={{ borderColor: `${module.color}20` }}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${module.color}30, ${module.color}10)`, border: `1px solid ${module.color}40` }}
              >
                <img src={module.iconImage} alt={module.name} className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h1 className="font-orbitron font-bold" style={{ color: module.color }}>Da Vinci</h1>
                <p className="text-xs text-muted-foreground">Creative Studio</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Mode</h3>
            
            <Button 
              variant={activeMode === "chat" ? "default" : "ghost"} 
              className="w-full justify-start gap-2 text-sm" 
              onClick={() => setActiveMode("chat")}
              style={activeMode === "chat" ? { background: module.color } : {}}
            >
              <Sparkles className="w-4 h-4" />
              Creative Chat
            </Button>
            <Button 
              variant={activeMode === "generate" ? "default" : "ghost"} 
              className="w-full justify-start gap-2 text-sm" 
              onClick={() => setActiveMode("generate")}
              style={activeMode === "generate" ? { background: module.color } : {}}
            >
              <Image className="w-4 h-4" />
              Generate Image
            </Button>
            <Button 
              variant={activeMode === "edit" ? "default" : "ghost"} 
              className="w-full justify-start gap-2 text-sm" 
              onClick={() => setActiveMode("edit")}
              style={activeMode === "edit" ? { background: module.color } : {}}
            >
              <Brush className="w-4 h-4" />
              Edit Image
            </Button>
          </div>

          <div className="p-4 space-y-2 border-t" style={{ borderColor: `${module.color}20` }}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Quick Actions</h3>
            
            <Button variant="ghost" className="w-full justify-start gap-2 text-sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4" style={{ color: module.color }} />
              Upload File
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2 text-sm" onClick={() => fileInputRef.current?.click()}>
              <FileText className="w-4 h-4" style={{ color: module.color }} />
              Analyze Document
            </Button>
          </div>

          <div className="p-4 mt-auto border-t" style={{ borderColor: `${module.color}20` }}>
            <Button
              variant={isVoiceActive ? "default" : "outline"}
              className="w-full gap-2"
              onClick={toggleVoice}
              style={isVoiceActive ? { background: module.color } : { borderColor: `${module.color}40` }}
            >
              {isVoiceActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              {isVoiceActive ? "Voice Active" : "Enable Voice"}
            </Button>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header 
            className="h-14 border-b flex items-center justify-between px-4"
            style={{ borderColor: `${module.color}20`, background: `linear-gradient(to right, ${module.color}08, transparent)` }}
          >
            <Link to="/modules/da-vinci" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Da Vinci</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs" style={{ background: `${module.color}15`, color: module.color }}>
                {activeMode === "chat" && <><Sparkles className="w-3 h-3" /> Chat</>}
                {activeMode === "generate" && <><Image className="w-3 h-3" /> Generate</>}
                {activeMode === "edit" && <><Brush className="w-3 h-3" /> Edit</>}
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-4">
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
                        message.role === "user" ? "bg-primary text-primary-foreground" : "glass"
                      }`}
                      style={{ borderColor: message.role === "assistant" ? `${module.color}30` : undefined }}
                    >
                      {/* Show uploaded file preview for user messages */}
                      {message.uploadedFile?.preview && (
                        <div className="mb-2">
                          <img 
                            src={message.uploadedFile.preview} 
                            alt="Uploaded" 
                            className="max-w-[200px] rounded-lg"
                          />
                          <p className="text-xs mt-1 opacity-70">{message.uploadedFile.name}</p>
                        </div>
                      )}
                      
                      <div className="text-sm leading-relaxed whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
                        {message.content.split('\n').map((line, i) => (
                          <p key={i} className="mb-1 last:mb-0">{line}</p>
                        ))}
                      </div>
                      
                      {/* Generated images */}
                      {message.images && message.images.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.images.map((img, idx) => (
                            <div key={idx} className="relative group">
                              <img 
                                src={img} 
                                alt={`Generated ${idx + 1}`} 
                                className="rounded-lg max-w-full shadow-lg"
                              />
                              <Button
                                size="sm"
                                variant="secondary"
                                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => downloadImage(img, idx)}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Save
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {(isLoading || isGenerating) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${module.color}30, ${module.color}10)`, border: `1px solid ${module.color}40` }}
                  >
                    <img src={module.iconImage} alt={module.name} className="w-6 h-6 object-contain" />
                  </div>
                  <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2" style={{ borderColor: `${module.color}30` }}>
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: module.color }} />
                    <span className="text-sm text-muted-foreground">
                      {isGenerating ? "Creating your masterpiece..." : "Thinking..."}
                    </span>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Uploaded File Preview */}
          {uploadedFile && (
            <div className="border-t px-4 py-2" style={{ borderColor: `${module.color}20` }}>
              <div className="max-w-3xl mx-auto flex items-center gap-3 p-2 rounded-lg" style={{ background: `${module.color}10` }}>
                {uploadedFile.preview ? (
                  <img src={uploadedFile.preview} alt="Upload preview" className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 rounded flex items-center justify-center" style={{ background: `${module.color}20` }}>
                    <FileText className="w-6 h-6" style={{ color: module.color }} />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{uploadedFile.file.name}</p>
                  <p className="text-xs text-muted-foreground">{(uploadedFile.file.size / 1024).toFixed(1)} KB</p>
                </div>
                <Button size="sm" variant="ghost" onClick={removeUploadedFile}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t p-4" style={{ borderColor: `${module.color}20` }}>
            <div className="max-w-3xl mx-auto">
              <div className="glass rounded-2xl p-3" style={{ borderColor: `${module.color}30` }}>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    activeMode === "generate" ? "Describe the image you want to create..." :
                    activeMode === "edit" ? "Describe how to edit the uploaded image..." :
                    "Describe your creative vision..."
                  }
                  className="min-h-[60px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 p-0"
                  disabled={isLoading || isGenerating}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileSelect} 
                      accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain" 
                    />
                    <Button size="sm" variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={isLoading || isGenerating}>
                      <Upload className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={toggleVoice} disabled={isLoading || isGenerating}>
                      {isVoiceActive ? <Mic className="w-4 h-4 text-green-500" /> : <MicOff className="w-4 h-4" />}
                    </Button>
                    
                    {/* Mobile mode switcher */}
                    <div className="lg:hidden flex items-center gap-1 ml-2">
                      <Button 
                        size="sm" 
                        variant={activeMode === "chat" ? "default" : "ghost"}
                        onClick={() => setActiveMode("chat")}
                        className="h-7 px-2"
                      >
                        <Sparkles className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant={activeMode === "generate" ? "default" : "ghost"}
                        onClick={() => setActiveMode("generate")}
                        className="h-7 px-2"
                      >
                        <Image className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant={activeMode === "edit" ? "default" : "ghost"}
                        onClick={() => setActiveMode("edit")}
                        className="h-7 px-2"
                      >
                        <Brush className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading || isGenerating}
                    size="sm"
                    style={{ background: `linear-gradient(135deg, ${module.color}, ${module.color}cc)` }}
                    className="text-black font-medium"
                  >
                    {isGenerating ? (
                      <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Creating</>
                    ) : (
                      <><Wand2 className="w-4 h-4 mr-1" /> {activeMode === "generate" ? "Generate" : activeMode === "edit" ? "Edit" : "Create"}</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DaVinciStudio;
