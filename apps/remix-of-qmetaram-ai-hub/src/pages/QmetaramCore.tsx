import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { getModuleById, modules } from "@/data/modules";
import { 
  Send, ArrowLeft, Upload, Image, Mic, MicOff, Sparkles, 
  FileText, Brain, User, X, Download, Loader2, Play, Pause,
  Volume2, VolumeX, Eye, Code, Music, Leaf, Wand2, Layers,
  Settings, Zap, Globe, Bot, Network, GitBranch, Lightbulb,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validateChatInput } from "@/lib/chatValidation";
import { getSupabaseFunctionHeaders } from "@/config/api";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Orchestration modes for advanced reasoning
type OrchestrationMode = 'single' | 'chain-of-thought' | 'multi-model-consensus' | 'sequential-refinement';

// Available AI models
const AI_MODELS = [
  { id: 'gemini-flash', name: 'Gemini Flash', description: 'Fast & balanced', tier: 'standard' },
  { id: 'gemini-pro', name: 'Gemini Pro', description: 'High capability', tier: 'premium' },
  { id: 'gemini-3-pro', name: 'Gemini 3 Pro', description: 'Next-gen reasoning', tier: 'premium' },
  { id: 'gpt-5', name: 'GPT-5', description: 'Powerful all-rounder', tier: 'premium' },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', description: 'Balanced performance', tier: 'standard' },
  { id: 'gemini-flash-lite', name: 'Gemini Flash Lite', description: 'Fastest option', tier: 'lite' },
  { id: 'gpt-5-nano', name: 'GPT-5 Nano', description: 'Speed optimized', tier: 'lite' },
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  images?: string[];
  audioUrl?: string;
  uploadedFile?: { name: string; type: string; preview?: string };
  routedTo?: string;
  orchestrationMode?: OrchestrationMode;
}

interface UploadedFile {
  file: File;
  preview?: string;
  base64?: string;
}

const QmetaramCore = () => {
  const module = getModuleById("qmetaram");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedFusionModules, setSelectedFusionModules] = useState<string[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  // Advanced orchestration state
  const [orchestrationMode, setOrchestrationMode] = useState<OrchestrationMode>('single');
  const [primaryModel, setPrimaryModel] = useState('gemini-flash');
  const [secondaryModels, setSecondaryModels] = useState<string[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  // Welcome message on mount
  useEffect(() => {
    if (module && messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: `# 🧠 Welcome to QMETARAM Core

**The Mother Neuron - Central AI Intelligence with Multi-Model Orchestration**

I am the central brain of the QMETARAM platform, coordinating all specialized modules and providing **advanced AI reasoning capabilities**.

## 🚀 Orchestration Modes:
- **Single Model** - Fast, direct responses from your chosen AI
- **Chain of Thought** - Step-by-step reasoning with analysis, solution, and verification
- **Multi-Model Consensus** - Query multiple AIs and synthesize the best answer
- **Sequential Refinement** - Iteratively improve responses through multiple models

## 🎯 Core Capabilities:
- 🧠 **Multi-Model Orchestration** - Combine AI models for superior results
- 📁 **File Analysis** - Upload and analyze any document
- 🔀 **Module Fusion** - Blend specialized AI expertise
- 🎙️ **Voice Interaction** - Speak naturally with STT/TTS

## Quick Commands:
- \`/image [description]\` - Generate an image
- \`/code [request]\` - Route to Matrix for coding
- \`/think [question]\` - Deep chain-of-thought reasoning
- \`/consensus [topic]\` - Multi-model perspective

*Select an orchestration mode in the sidebar for advanced reasoning, or just start typing!*`,
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

  const ensureConversation = async (firstMessage: string): Promise<string | null> => {
    if (conversationId) return conversationId;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const title = `Core: ${firstMessage.slice(0, 40)}...`;
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ title, module_id: "qmetaram", user_id: user.id })
      .select().single();
    if (error) throw error;
    setConversationId(data.id);
    return data.id;
  };

  const saveMessage = async (convId: string | null, role: string, content: string) => {
    if (!convId) return;
    try {
      await supabase.from("chat_messages").insert({
        conversation_id: convId, role, content, module: "qmetaram"
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

    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "File Too Large", description: "Maximum file size is 20MB", variant: "destructive" });
      return;
    }

    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'application/pdf', 'text/plain', 'text/javascript', 'text/typescript',
      'text/html', 'text/css', 'application/json', 'text/markdown'
    ];
    
    if (!allowedTypes.some(type => file.type.startsWith(type.split('/')[0]) || file.type === type)) {
      toast({ title: "Unsupported File", description: "Please upload an image, PDF, code, or text file", variant: "destructive" });
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      const preview = file.type.startsWith('image/') ? base64 : undefined;
      setUploadedFile({ file, preview, base64 });
      toast({ title: "File Ready", description: `${file.name} uploaded for analysis` });
    } catch (error) {
      console.error("File upload error:", error);
      toast({ title: "Upload Failed", variant: "destructive" });
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        // Convert to base64 and send to STT
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          await processVoiceInput(base64Audio);
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast({ title: "Recording...", description: "Speak now. Click again to stop." });
    } catch (error) {
      console.error("Recording error:", error);
      toast({ title: "Microphone Access Denied", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const processVoiceInput = async (base64Audio: string) => {
    setIsLoading(true);
    toast({ title: "Processing voice...", description: "Transcribing your speech" });
    
    // For now, simulate STT with a placeholder - real STT would use Whisper API
    setTimeout(() => {
      setInput("Voice input transcribed: [Voice feature in development]");
      setIsLoading(false);
    }, 1000);
  };

  // Detect routing and orchestration mode from input
  const detectRoute = (text: string): { module: string | null; cleanText: string; overrideMode?: OrchestrationMode } => {
    const lowerText = text.toLowerCase();
    
    // Check for orchestration commands
    if (lowerText.startsWith('/think ') || lowerText.startsWith('/reason ')) {
      return { module: null, cleanText: text.replace(/^\/(think|reason)\s*/i, ''), overrideMode: 'chain-of-thought' };
    }
    if (lowerText.startsWith('/consensus ') || lowerText.startsWith('/compare ')) {
      return { module: null, cleanText: text.replace(/^\/(consensus|compare)\s*/i, ''), overrideMode: 'multi-model-consensus' };
    }
    if (lowerText.startsWith('/refine ')) {
      return { module: null, cleanText: text.replace(/^\/refine\s*/i, ''), overrideMode: 'sequential-refinement' };
    }
    
    // Module routing
    if (lowerText.startsWith('/image ') || lowerText.includes('generate image') || lowerText.includes('create image')) {
      return { module: 'da-vinci', cleanText: text.replace(/^\/image\s*/i, '') };
    }
    if (lowerText.startsWith('/code ') || lowerText.includes('write code') || lowerText.includes('programming')) {
      return { module: 'matrix', cleanText: text.replace(/^\/code\s*/i, '') };
    }
    if (lowerText.startsWith('/music ') || lowerText.includes('compose music') || lowerText.includes('generate music')) {
      return { module: 'beethoven', cleanText: text.replace(/^\/music\s*/i, '') };
    }
    if (lowerText.startsWith('/health ') || lowerText.includes('health') || lowerText.includes('medicine')) {
      return { module: 'biruni', cleanText: text.replace(/^\/health\s*/i, '') };
    }
    
    return { module: null, cleanText: text };
  };

  // Toggle secondary model selection
  const toggleSecondaryModel = (modelId: string) => {
    setSecondaryModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : prev.length < 2 ? [...prev, modelId] : prev
    );
  };

  // Get orchestration mode icon and label
  const getOrchestrationInfo = (mode: OrchestrationMode) => {
    switch (mode) {
      case 'chain-of-thought':
        return { icon: <GitBranch className="w-4 h-4" />, label: 'Chain of Thought', color: '#f59e0b' };
      case 'multi-model-consensus':
        return { icon: <Network className="w-4 h-4" />, label: 'Multi-Model Consensus', color: '#8b5cf6' };
      case 'sequential-refinement':
        return { icon: <Lightbulb className="w-4 h-4" />, label: 'Sequential Refinement', color: '#10b981' };
      default:
        return { icon: <Bot className="w-4 h-4" />, label: 'Single Model', color: '#3b82f6' };
    }
  };

  const generateImage = async (prompt: string) => {
    setIsGeneratingImage(true);
    try {
      const response = await supabase.functions.invoke('generate-image', {
        body: { operation: 'generate', prompt }
      });

      if (response.error) throw new Error(response.error.message);
      return response.data;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const streamChat = async (userMessage: Message, routedModule?: string, modeOverride?: OrchestrationMode): Promise<string> => {
    const activeMode = modeOverride || orchestrationMode;
    const orchestrationUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/multi-model-orchestration`;
    
    const { data: { session } } = await supabase.auth.getSession();
    const headers = getSupabaseFunctionHeaders(session?.access_token);

    try {
      const messagesPayload = messages
        .filter(m => m.id !== "welcome")
        .map(m => ({ role: m.role, content: m.content }))
        .concat([{ role: "user", content: userMessage.content }]);

      // Add file context if present
      if (uploadedFile?.base64 && uploadedFile.file.type.startsWith('image/')) {
        messagesPayload[messagesPayload.length - 1] = {
          role: "user",
          content: `[User uploaded image: ${uploadedFile.file.name}]\n\n${userMessage.content}`
        };
      }

      const resp = await fetch(orchestrationUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: messagesPayload,
          mode: activeMode,
          primaryModel,
          secondaryModels: secondaryModels.length > 0 ? secondaryModels : undefined,
          module: routedModule || "qmetaram",
          fusion: selectedFusionModules,
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

      const orchestrationInfo = getOrchestrationInfo(activeMode);
      const assistantId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, {
        id: assistantId, 
        role: "assistant" as const, 
        content: "", 
        timestamp: new Date(),
        routedTo: routedModule || undefined,
        orchestrationMode: activeMode
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

      // TTS if enabled
      if (isTTSEnabled && assistantContent) {
        toast({ title: "TTS", description: "Text-to-speech feature coming soon!" });
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

    const { module: routedModule, cleanText, overrideMode } = detectRoute(validation.data!);

    const userMessage: Message = {
      id: Date.now().toString(), 
      role: "user", 
      content: validation.data!, 
      timestamp: new Date(),
      uploadedFile: uploadedFile ? { 
        name: uploadedFile.file.name, 
        type: uploadedFile.file.type,
        preview: uploadedFile.preview 
      } : undefined,
      routedTo: routedModule || undefined,
      orchestrationMode: overrideMode || orchestrationMode
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

      // Handle image generation command
      if (routedModule === 'da-vinci' && (input.toLowerCase().startsWith('/image ') || input.toLowerCase().includes('generate image'))) {
        const result = await generateImage(cleanText);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.text || "🎨 Here's your generated image!",
          timestamp: new Date(),
          images: result.images,
          routedTo: 'da-vinci'
        };
        setMessages((prev) => [...prev, assistantMessage]);
        await saveMessage(convId, "assistant", assistantMessage.content);
      } else {
        // Regular chat with orchestration mode
        const assistantContent = await streamChat(userMessage, routedModule || undefined, overrideMode);
        if (assistantContent) await saveMessage(convId, "assistant", assistantContent);
      }

      removeUploadedFile();
    } catch (error: any) {
      console.error("Error in chat:", error);
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const toggleFusionModule = (moduleId: string) => {
    setSelectedFusionModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : prev.length < 3 ? [...prev, moduleId] : prev
    );
  };

  const downloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `qmetaram-${Date.now()}-${index}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getModuleIcon = (moduleId: string) => {
    switch (moduleId) {
      case 'matrix': return <Code className="w-3 h-3" />;
      case 'da-vinci': return <Wand2 className="w-3 h-3" />;
      case 'beethoven': return <Music className="w-3 h-3" />;
      case 'biruni': return <Leaf className="w-3 h-3" />;
      case 'tesla': return <Zap className="w-3 h-3" />;
      case 'mowlana': return <Sparkles className="w-3 h-3" />;
      default: return <Brain className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <audio ref={audioRef} className="hidden" />
      
      <div className="flex-1 flex pt-16">
        {/* Sidebar - Fusion Mode & Tools */}
        <aside 
          className="w-72 border-r hidden lg:flex flex-col"
          style={{ borderColor: `${module.color}30`, background: `linear-gradient(to bottom, ${module.color}08, transparent)` }}
        >
          <div className="p-4 border-b" style={{ borderColor: `${module.color}20` }}>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${module.color}30, ${module.color}10)`, border: `2px solid ${module.color}40` }}
              >
                <img src={module.iconImage} alt={module.name} className="w-10 h-10 object-contain" />
              </div>
              <div>
                <h1 className="font-orbitron font-bold text-lg" style={{ color: module.color }}>QMETARAM Core</h1>
                <p className="text-xs text-muted-foreground">Mother Neuron • Central AI</p>
              </div>
            </div>
          </div>

          {/* Orchestration Mode Selection */}
          <div className="p-4 border-b" style={{ borderColor: `${module.color}20` }}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-2">
              <Network className="w-3 h-3" />
              Orchestration Mode
            </h3>
            <Select value={orchestrationMode} onValueChange={(v) => setOrchestrationMode(v as OrchestrationMode)}>
              <SelectTrigger className="w-full" style={{ borderColor: `${module.color}40` }}>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-500" />
                    <span>Single Model</span>
                  </div>
                </SelectItem>
                <SelectItem value="chain-of-thought">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-amber-500" />
                    <span>Chain of Thought</span>
                  </div>
                </SelectItem>
                <SelectItem value="multi-model-consensus">
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-purple-500" />
                    <span>Multi-Model Consensus</span>
                  </div>
                </SelectItem>
                <SelectItem value="sequential-refinement">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-green-500" />
                    <span>Sequential Refinement</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <Collapsible open={showAdvancedOptions} onOpenChange={setShowAdvancedOptions} className="mt-3">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <Settings className="w-3 h-3" />
                    Advanced Options
                  </span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-3">
                {/* Primary Model Selection */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Primary Model</label>
                  <Select value={primaryModel} onValueChange={setPrimaryModel}>
                    <SelectTrigger className="w-full h-8 text-xs" style={{ borderColor: `${module.color}30` }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${model.tier === 'premium' ? 'bg-amber-500' : model.tier === 'lite' ? 'bg-green-500' : 'bg-blue-500'}`} />
                            <span>{model.name}</span>
                            <span className="text-muted-foreground text-xs">({model.description})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Secondary Models (for consensus/refinement) */}
                {(orchestrationMode === 'multi-model-consensus' || orchestrationMode === 'sequential-refinement') && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Secondary Models (select up to 2)</label>
                    <div className="grid grid-cols-2 gap-1">
                      {AI_MODELS.filter(m => m.id !== primaryModel).slice(0, 4).map((model) => (
                        <Button
                          key={model.id}
                          variant={secondaryModels.includes(model.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleSecondaryModel(model.id)}
                          className="text-xs h-7 px-2"
                          style={secondaryModels.includes(model.id) ? { background: module.color } : { borderColor: `${module.color}30` }}
                        >
                          {model.name.split(' ')[0]}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Fusion Mode */}
          <div className="p-4 border-b" style={{ borderColor: `${module.color}20` }}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-2">
              <Layers className="w-3 h-3" />
              Module Fusion
            </h3>
            <p className="text-xs text-muted-foreground mb-3">Combine modules for enhanced capabilities</p>
            <div className="grid grid-cols-2 gap-2">
              {modules.filter(m => m.id !== 'qmetaram').slice(0, 6).map((mod) => (
                <Button
                  key={mod.id}
                  variant={selectedFusionModules.includes(mod.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleFusionModule(mod.id)}
                  className="text-xs gap-1 h-8"
                  style={selectedFusionModules.includes(mod.id) ? { background: mod.color } : { borderColor: `${mod.color}40` }}
                >
                  {getModuleIcon(mod.id)}
                  {mod.name}
                </Button>
              ))}
            </div>
            {selectedFusionModules.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {selectedFusionModules.map(id => {
                  const mod = modules.find(m => m.id === id);
                  return mod ? (
                    <Badge key={id} style={{ background: mod.color }} className="text-white text-xs">
                      {mod.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-4 space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Quick Actions</h3>
            
            <Button variant="ghost" className="w-full justify-start gap-2 text-sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4" style={{ color: module.color }} />
              Upload File
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2 text-sm" onClick={() => setInput('/image ')}>
              <Image className="w-4 h-4" style={{ color: module.color }} />
              Generate Image
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2 text-sm" onClick={() => setInput('/code ')}>
              <Code className="w-4 h-4" style={{ color: module.color }} />
              Write Code
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2 text-sm" onClick={() => setInput('/music ')}>
              <Music className="w-4 h-4" style={{ color: module.color }} />
              Compose Music
            </Button>
          </div>

          {/* Voice Controls */}
          <div className="p-4 mt-auto border-t space-y-2" style={{ borderColor: `${module.color}20` }}>
            <Button
              variant={isRecording ? "default" : "outline"}
              className="w-full gap-2"
              onClick={toggleRecording}
              style={isRecording ? { background: '#ef4444' } : { borderColor: `${module.color}40` }}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isRecording ? "Stop Recording" : "Voice Input"}
            </Button>
            <Button
              variant={isTTSEnabled ? "default" : "outline"}
              className="w-full gap-2"
              onClick={() => setIsTTSEnabled(!isTTSEnabled)}
              style={isTTSEnabled ? { background: module.color } : { borderColor: `${module.color}40` }}
            >
              {isTTSEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              {isTTSEnabled ? "TTS Enabled" : "Enable TTS"}
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
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Back</span>
              </Link>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5" style={{ color: module.color }} />
                <span className="font-orbitron font-bold" style={{ color: module.color }}>Core Intelligence</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {selectedFusionModules.length > 0 && (
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  Fusion: {selectedFusionModules.length}
                </Badge>
              )}
              <Badge variant="outline" className="text-green-500 border-green-500/30">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                Online
              </Badge>
            </div>
          </header>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="max-w-4xl mx-auto space-y-4">
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div 
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        message.role === "user" ? "bg-primary" : ""
                      }`}
                      style={message.role === "assistant" ? { background: `linear-gradient(135deg, ${module.color}30, ${module.color}10)` } : {}}
                    >
                      {message.role === "user" ? (
                        <User className="w-4 h-4 text-primary-foreground" />
                      ) : (
                        <Brain className="w-4 h-4" style={{ color: module.color }} />
                      )}
                    </div>
                    <div className={`flex-1 ${message.role === "user" ? "text-right" : ""}`}>
                      {message.routedTo && (
                        <Badge variant="outline" className="mb-2 text-xs gap-1">
                          {getModuleIcon(message.routedTo)}
                          Routed to {modules.find(m => m.id === message.routedTo)?.name || message.routedTo}
                        </Badge>
                      )}
                      
                      {message.uploadedFile?.preview && (
                        <div className="mb-2">
                          <img 
                            src={message.uploadedFile.preview} 
                            alt={message.uploadedFile.name}
                            className="max-w-xs rounded-lg border border-border"
                          />
                        </div>
                      )}
                      
                      <Card className={`inline-block max-w-[85%] ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                        <CardContent className="p-3">
                          <div className={`prose prose-sm max-w-none ${message.role === "user" ? "prose-invert" : "dark:prose-invert"}`}>
                            {message.content.split('\n').map((line, i) => (
                              <p key={i} className="mb-1 last:mb-0">
                                {line.startsWith('# ') ? (
                                  <span className="text-lg font-bold">{line.slice(2)}</span>
                                ) : line.startsWith('## ') ? (
                                  <span className="text-base font-semibold">{line.slice(3)}</span>
                                ) : line.startsWith('- ') ? (
                                  <span>• {line.slice(2)}</span>
                                ) : line.startsWith('`') && line.endsWith('`') ? (
                                  <code className="bg-muted px-1 rounded">{line.slice(1, -1)}</code>
                                ) : (
                                  line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => 
                                    part.startsWith('**') && part.endsWith('**') 
                                      ? <strong key={j}>{part.slice(2, -2)}</strong>
                                      : part
                                  )
                                )}
                              </p>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                      
                      {message.images && message.images.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {message.images.map((img, idx) => (
                            <div key={idx} className="relative group">
                              <img 
                                src={img} 
                                alt={`Generated ${idx + 1}`}
                                className="max-w-sm rounded-lg border border-border"
                              />
                              <Button
                                size="sm"
                                variant="secondary"
                                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => downloadImage(img, idx)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {(isLoading || isGeneratingImage) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${module.color}30, ${module.color}10)` }}
                  >
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: module.color }} />
                  </div>
                  <Card className="bg-card">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {isGeneratingImage ? "Generating image..." : "Thinking..."}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4" style={{ borderColor: `${module.color}20` }}>
            <div className="max-w-4xl mx-auto">
              {/* Upload Preview */}
              {uploadedFile && (
                <div className="mb-3 flex items-center gap-2 p-2 bg-muted rounded-lg">
                  {uploadedFile.preview ? (
                    <img src={uploadedFile.preview} alt="Preview" className="w-12 h-12 rounded object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded bg-muted-foreground/20 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                    <p className="text-xs text-muted-foreground">{(uploadedFile.file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={removeUploadedFile}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.txt,.js,.ts,.tsx,.jsx,.html,.css,.json,.md"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0"
                  style={{ borderColor: `${module.color}30` }}
                >
                  <Upload className="w-4 h-4" />
                </Button>
                
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="icon"
                  onClick={toggleRecording}
                  className="flex-shrink-0 lg:hidden"
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything or use /image, /code, /music commands..."
                  className="min-h-[44px] max-h-32 resize-none"
                  rows={1}
                  disabled={isLoading}
                />
                
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="flex-shrink-0"
                  style={{ background: module.color }}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
              
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Press Enter to send • Shift+Enter for new line</span>
                <span>Powered by QMETARAM Core v2.0</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default QmetaramCore;
