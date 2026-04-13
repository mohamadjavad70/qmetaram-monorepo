import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { getModuleById } from "@/data/modules";
import { 
  Send, ArrowLeft, Code, Terminal, Cpu, GitBranch, Package,
  FileCode, Folder, Download, Copy, Check, Loader2, 
  Play, ChevronRight, Layers, Database, Server, Globe,
  Zap, FileJson, FolderTree
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getChatUrl, getSupabaseFunctionHeaders } from "@/config/api";
import { supabase } from "@/integrations/supabase/client";
import { validateChatInput } from "@/lib/chatValidation";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  codeBlocks?: { language: string; code: string; filename?: string }[];
  projectStructure?: ProjectFile[];
}

interface ProjectFile {
  name: string;
  type: "file" | "folder";
  content?: string;
  language?: string;
  children?: ProjectFile[];
}

interface GeneratedProject {
  id: string;
  name: string;
  description: string;
  platform: string;
  files: ProjectFile[];
  createdAt: Date;
}

const PLATFORMS = [
  { id: "web", name: "Web Application", icon: Globe, desc: "React, Vue, or vanilla JS" },
  { id: "mobile", name: "Mobile App", icon: Cpu, desc: "React Native or Flutter" },
  { id: "saas", name: "SaaS Platform", icon: Server, desc: "Full-stack with backend" },
  { id: "api", name: "API Backend", icon: Database, desc: "REST or GraphQL API" },
];

const MatrixStudio = () => {
  const module = getModuleById("matrix");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string>("web");
  const [projectName, setProjectName] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "project" | "output">("chat");
  const [generatedProject, setGeneratedProject] = useState<GeneratedProject | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Welcome message
  useEffect(() => {
    if (module && messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: `# 🔮 Welcome to Matrix Code Generator

**Transform Ideas into Deployable Applications**

I am Matrix, your AI coding partner capable of generating complete, production-ready applications from a single prompt.

## My Capabilities:
- 📱 **Full Applications** - Web, Mobile, or SaaS platforms
- 🏗️ **System Architecture** - Database schemas, API design
- 💻 **Production Code** - Frontend, Backend, and DevOps
- 📦 **Deployment Ready** - Docker, GitHub, CI/CD configs

## How to Use:
1. Select your target platform (Web, Mobile, SaaS, API)
2. Describe your application idea
3. I'll generate the complete codebase

*Start by selecting a platform and describing your project idea.*`,
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-mono">
        <div className="text-center text-[#00ff41]">
          <h1 className="text-xl mb-4">[ERROR] Module_Not_Found</h1>
          <Link to="/"><Button className="bg-[#00ff41] text-black hover:bg-[#00cc33]">RETURN_HOME</Button></Link>
        </div>
      </div>
    );
  }

  const ensureConversation = async (firstMessage: string): Promise<string | null> => {
    if (conversationId) return conversationId;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const title = `Matrix: ${firstMessage.slice(0, 40)}...`;
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ title, module_id: "matrix", user_id: user.id })
      .select().single();
    if (error) throw error;
    setConversationId(data.id);
    return data.id;
  };

  const saveMessage = async (convId: string | null, role: string, content: string) => {
    if (!convId) return;
    try {
      await supabase.from("chat_messages").insert({
        conversation_id: convId, role, content, module: "matrix"
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const parseCodeBlocks = (content: string): { language: string; code: string; filename?: string }[] => {
    const codeBlockRegex = /```(\w+)?(?:\s+(\S+))?\n([\s\S]*?)```/g;
    const blocks: { language: string; code: string; filename?: string }[] = [];
    let match;
    while ((match = codeBlockRegex.exec(content)) !== null) {
      blocks.push({
        language: match[1] || "plaintext",
        filename: match[2],
        code: match[3].trim()
      });
    }
    return blocks;
  };

  const streamChat = async (userMessage: Message): Promise<string> => {
    const chatUrl = getChatUrl();
    const { data: { session } } = await supabase.auth.getSession();
    const headers = getSupabaseFunctionHeaders(session?.access_token);

    const systemPrompt = `You are Matrix, an expert AI code generator and software architect. You generate complete, production-ready applications.

Current Project Context:
- Platform: ${platform}
- Project Name: ${projectName || "Untitled Project"}

When generating code:
1. Always provide complete, working code - not snippets
2. Use proper file structure with clear filenames
3. Include all necessary configurations (package.json, tsconfig, etc.)
4. Add helpful comments for complex logic
5. Follow best practices for the chosen platform

Format code blocks with language and optional filename:
\`\`\`typescript src/App.tsx
// code here
\`\`\`

For project generation, provide:
- Complete file structure
- All source code files
- Configuration files
- README with setup instructions
- Docker configuration (if applicable)

Be thorough, professional, and generate deployable code.`;

    try {
      const resp = await fetch(chatUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: messages.filter(m => m.id !== "welcome").map(m => ({
            role: m.role, content: m.content
          })).concat([{ role: "user", content: userMessage.content }]),
          module: "matrix",
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
              const codeBlocks = parseCodeBlocks(assistantContent);
              setMessages((prev) =>
                prev.map((m) => m.id === assistantId ? { ...m, content: assistantContent, codeBlocks } : m)
              );
            }
          } catch { continue; }
        }
      }

      // Check if we generated a project
      if (assistantContent.includes("```") && platform) {
        const codeBlocks = parseCodeBlocks(assistantContent);
        if (codeBlocks.length >= 3) {
          const project: GeneratedProject = {
            id: Date.now().toString(),
            name: projectName || "Generated Project",
            description: input,
            platform,
            files: codeBlocks.map(block => ({
              name: block.filename || `file.${block.language}`,
              type: "file" as const,
              content: block.code,
              language: block.language
            })),
            createdAt: new Date()
          };
          setGeneratedProject(project);
          setActiveTab("output");
          toast({ title: "Project Generated!", description: `Created ${codeBlocks.length} files` });
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

    const fullPrompt = projectName 
      ? `Project: ${projectName}\nPlatform: ${platform}\n\n${validation.data}`
      : validation.data!;

    const userMessage: Message = {
      id: Date.now().toString(), 
      role: "user", 
      content: fullPrompt, 
      timestamp: new Date()
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
      if (assistantContent) await saveMessage(convId, "assistant", assistantContent);
    } catch (error: any) {
      console.error("Error in chat:", error);
      toast({ title: "Error", description: "Failed to get response.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const copyCode = async (code: string, filename?: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(filename || code.slice(0, 20));
    toast({ title: "Copied!", description: filename ? `${filename} copied to clipboard` : "Code copied to clipboard" });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const downloadProject = () => {
    if (!generatedProject) return;
    
    const content = generatedProject.files.map(f => 
      `// ============ ${f.name} ============\n\n${f.content}\n\n`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedProject.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Downloaded!", description: "Project files downloaded" });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-mono">
      <Navbar />
      
      <div className="flex-1 flex pt-16">
        {/* Sidebar */}
        <aside className="w-72 border-r border-[#00ff41]/20 hidden lg:flex flex-col bg-[#0d0d0d]">
          <div className="p-4 border-b border-[#00ff41]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#00ff41]/10 border border-[#00ff41]/30">
                <img src={module.iconImage} alt={module.name} className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h1 className="font-orbitron font-bold text-[#00ff41]">Matrix</h1>
                <p className="text-xs text-[#00ff41]/60">Code Generator</p>
              </div>
            </div>
          </div>

          {/* Project Configuration */}
          <div className="p-4 border-b border-[#00ff41]/20 space-y-4">
            <h3 className="text-xs font-semibold text-[#00ff41]/60 uppercase flex items-center gap-2">
              <Folder className="w-3 h-3" />
              Project Setup
            </h3>
            
            <div className="space-y-2">
              <label className="text-xs text-[#00ff41]/80">Project Name</label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="my-awesome-app"
                className="bg-black border-[#00ff41]/30 text-[#00ff41] placeholder:text-[#00ff41]/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#00ff41]/80">Platform</label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="bg-black border-[#00ff41]/30 text-[#00ff41]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-[#00ff41]/30">
                  {PLATFORMS.map(p => (
                    <SelectItem key={p.id} value={p.id} className="text-[#00ff41]">
                      <div className="flex items-center gap-2">
                        <p.icon className="w-4 h-4" />
                        {p.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-[#00ff41]/40">
                {PLATFORMS.find(p => p.id === platform)?.desc}
              </p>
            </div>
          </div>

          {/* Quick Templates */}
          <div className="p-4 space-y-2">
            <h3 className="text-xs font-semibold text-[#00ff41]/60 uppercase mb-3">Quick Prompts</h3>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 text-xs text-[#00ff41] hover:bg-[#00ff41]/10"
              onClick={() => setInput("Create a complete CRUD application with user authentication, database models, and REST API endpoints")}
            >
              <Database className="w-4 h-4" />
              CRUD App + Auth
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 text-xs text-[#00ff41] hover:bg-[#00ff41]/10"
              onClick={() => setInput("Build a real-time dashboard with charts, data visualization, and WebSocket updates")}
            >
              <Layers className="w-4 h-4" />
              Dashboard + Charts
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 text-xs text-[#00ff41] hover:bg-[#00ff41]/10"
              onClick={() => setInput("Generate a REST API with Express/FastAPI including authentication, rate limiting, and documentation")}
            >
              <Server className="w-4 h-4" />
              REST API + Docs
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 text-xs text-[#00ff41] hover:bg-[#00ff41]/10"
              onClick={() => setInput("Create a landing page with hero section, features, pricing, and contact form")}
            >
              <Globe className="w-4 h-4" />
              Landing Page
            </Button>
          </div>

          {/* Generated Project */}
          {generatedProject && (
            <div className="p-4 mt-auto border-t border-[#00ff41]/20">
              <h3 className="text-xs font-semibold text-[#00ff41]/60 uppercase mb-3">Generated Project</h3>
              <Card className="bg-black border-[#00ff41]/30">
                <CardContent className="p-3 space-y-2">
                  <p className="text-sm text-[#00ff41] font-bold">{generatedProject.name}</p>
                  <p className="text-xs text-[#00ff41]/60">{generatedProject.files.length} files</p>
                  <Button 
                    size="sm" 
                    className="w-full bg-[#00ff41] text-black hover:bg-[#00cc33]"
                    onClick={downloadProject}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </aside>

        {/* Main Area */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-12 border-b border-[#00ff41]/20 bg-[#0d0d0d] flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Link to="/modules/matrix" className="flex items-center gap-2 text-[#00ff41]/60 hover:text-[#00ff41] transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-xs">EXIT</span>
              </Link>
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#00ff41]" />
                <span className="text-[#00ff41] text-sm">MATRIX://CODE_GENERATOR</span>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="bg-black border border-[#00ff41]/20">
                <TabsTrigger value="chat" className="data-[state=active]:bg-[#00ff41] data-[state=active]:text-black text-[#00ff41]">
                  Chat
                </TabsTrigger>
                <TabsTrigger value="output" className="data-[state=active]:bg-[#00ff41] data-[state=active]:text-black text-[#00ff41]">
                  Output
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "chat" ? (
              <div className="h-full flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  <div className="max-w-4xl mx-auto space-y-4">
                    <AnimatePresence mode="popLayout">
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`${message.role === "user" ? "text-cyan-400" : "text-[#00ff41]"}`}
                        >
                          {message.role === "user" ? (
                            <div className="flex items-start gap-2">
                              <span className="text-cyan-500 select-none">{">"}</span>
                              <pre className="whitespace-pre-wrap">{message.content}</pre>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <pre className="whitespace-pre-wrap text-[#00ff41] text-sm leading-relaxed">
                                {message.content.replace(/```[\s\S]*?```/g, '[CODE_BLOCK]')}
                              </pre>
                              
                              {message.codeBlocks && message.codeBlocks.length > 0 && (
                                <div className="space-y-3">
                                  {message.codeBlocks.map((block, idx) => (
                                    <Card key={idx} className="bg-black border-[#00ff41]/30 overflow-hidden">
                                      <CardHeader className="py-2 px-3 bg-[#00ff41]/10 flex flex-row items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <FileCode className="w-4 h-4 text-[#00ff41]" />
                                          <span className="text-xs text-[#00ff41]">
                                            {block.filename || `${block.language} code`}
                                          </span>
                                          <Badge variant="outline" className="text-[#00ff41] border-[#00ff41]/30 text-xs">
                                            {block.language}
                                          </Badge>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 text-[#00ff41] hover:bg-[#00ff41]/20"
                                          onClick={() => copyCode(block.code, block.filename)}
                                        >
                                          {copiedCode === (block.filename || block.code.slice(0, 20)) ? (
                                            <Check className="w-3 h-3" />
                                          ) : (
                                            <Copy className="w-3 h-3" />
                                          )}
                                        </Button>
                                      </CardHeader>
                                      <CardContent className="p-3">
                                        <pre className="text-xs text-[#00ff41]/80 overflow-x-auto">
                                          <code>{block.code}</code>
                                        </pre>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {isLoading && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#00ff41]">
                        <span className="animate-pulse">▊</span>
                        <span className="ml-2 text-xs">GENERATING CODE...</span>
                      </motion.div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="border-t border-[#00ff41]/20 p-4 bg-[#0d0d0d]">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex gap-2">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe the application you want to build..."
                        className="min-h-[60px] bg-black border-[#00ff41]/30 text-[#00ff41] placeholder:text-[#00ff41]/40 resize-none"
                        disabled={isLoading}
                      />
                      <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="bg-[#00ff41] text-black hover:bg-[#00cc33] px-6"
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full p-4 overflow-auto">
                <div className="max-w-4xl mx-auto">
                  {generatedProject ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-[#00ff41]">{generatedProject.name}</h2>
                          <p className="text-sm text-[#00ff41]/60">{generatedProject.files.length} files generated</p>
                        </div>
                        <Button onClick={downloadProject} className="bg-[#00ff41] text-black hover:bg-[#00cc33]">
                          <Download className="w-4 h-4 mr-2" />
                          Download Project
                        </Button>
                      </div>
                      
                      <div className="grid gap-4">
                        {generatedProject.files.map((file, idx) => (
                          <Card key={idx} className="bg-black border-[#00ff41]/30">
                            <CardHeader className="py-2 px-3 bg-[#00ff41]/10 flex flex-row items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileCode className="w-4 h-4 text-[#00ff41]" />
                                <span className="text-sm text-[#00ff41] font-medium">{file.name}</span>
                                <Badge variant="outline" className="text-[#00ff41]/60 border-[#00ff41]/30 text-xs">
                                  {file.language}
                                </Badge>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-[#00ff41] hover:bg-[#00ff41]/20"
                                onClick={() => copyCode(file.content || "", file.name)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </CardHeader>
                            <CardContent className="p-3">
                              <pre className="text-xs text-[#00ff41]/80 overflow-x-auto max-h-96">
                                <code>{file.content}</code>
                              </pre>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FolderTree className="w-16 h-16 text-[#00ff41]/30 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-[#00ff41]/60">No Project Generated Yet</h3>
                      <p className="text-sm text-[#00ff41]/40 mt-2">
                        Describe your application in the chat to generate code
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MatrixStudio;
