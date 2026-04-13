import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, TrendingUp, Wallet, ArrowLeftRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type MessageRole = 'user' | 'assistant';

interface Message {
  role: MessageRole;
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/samir-chat`;

const quickActions = [
  { icon: Wallet, label: 'Check Balance', query: 'How can I check my wallet balance?' },
  { icon: ArrowLeftRight, label: 'Market Update', query: 'Give me a quick crypto market update for today' },
  { icon: TrendingUp, label: 'BTC Analysis', query: 'What is the current Bitcoin market outlook?' },
];

const initialMessages: Message[] = [
  {
    role: 'assistant',
    content: "سلام! 👋 من دستیار هوشمند Samir هستم. می‌تونم در مورد بازار کریپتو، تحلیل تکنیکال، مدیریت ریسک و استراتژی‌های سرمایه‌گذاری بهتون کمک کنم. چطور می‌تونم کمکتون کنم؟",
  },
];

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) { onError("Please sign in to chat with Noor."); return; }

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ messages }),
    });

    if (resp.status === 429) { onError("Too many requests. Please wait a moment."); return; }
    if (resp.status === 402) { onError("Service temporarily unavailable."); return; }
    if (!resp.ok || !resp.body) { onError("Failed to connect to AI."); return; }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") { onDone(); return; }
        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch { /* partial */ }
      }
    }
    onDone();
  } catch {
    onError("Connection error. Please try again.");
  }
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;

    const userMsg: Message = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let assistantSoFar = "";
    const allMessages = [...messages, userMsg];

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && prev.length > allMessages.length) {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev.slice(0, -1 * (prev.length > allMessages.length ? 1 : 0)), ...( prev.length <= allMessages.length ? [{ role: 'assistant' as const, content: assistantSoFar }] : [])];
      });
    };

    await streamChat({
      messages: allMessages,
      onDelta: (chunk) => {
        assistantSoFar += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
          }
          return [...prev, { role: 'assistant', content: assistantSoFar }];
        });
      },
      onDone: () => setIsLoading(false),
      onError: (err) => {
        toast.error(err);
        setIsLoading(false);
      },
    });
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/40',
          isOpen && 'scale-0 opacity-0'
        )}
      >
        <Bot className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
          <Sparkles className="h-2.5 w-2.5 text-success-foreground" />
        </span>
      </button>

      {/* Chat Panel */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-50 w-96 h-[600px] max-h-[calc(100vh-3rem)] rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl flex flex-col transition-all duration-300 origin-bottom-right shadow-2xl',
          isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-glow-sm">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Samir AI</h3>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                Online — Real AI
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={cn('flex gap-3 animate-fade-in', msg.role === 'user' ? 'flex-row-reverse' : '')}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
              <div className={cn(
                'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-secondary/80 text-secondary-foreground rounded-bl-md'
              )}>
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
              </div>
              <div className="bg-secondary/80 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-muted-foreground">
                Thinking...
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="space-y-2 pt-2">
              <p className="text-xs text-muted-foreground">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleSend(action.query)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 hover:bg-secondary hover:border-primary/30 transition-all text-xs font-medium"
                  >
                    <action.icon className="h-3.5 w-3.5 text-primary" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border/50">
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="bg-secondary/50 border-transparent focus:border-primary/30"
              disabled={isLoading}
            />
            <Button size="icon" onClick={() => handleSend()} disabled={!input.trim() || isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            ⚠️ Educational only — not financial advice
          </p>
        </div>
      </div>
    </>
  );
}
