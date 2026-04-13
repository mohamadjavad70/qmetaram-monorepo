import { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  Send, 
  TrendingUp, 
  TrendingDown, 
  BarChart2,
  Activity,
  AlertTriangle,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  analysis?: MarketAnalysis;
}

interface MarketAnalysis {
  symbol: string;
  recommendation: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  indicators: {
    rsi: number;
    macd: { value: number; signal: number; histogram: number };
    sma: { sma20: number; sma50: number; sma200: number };
    fibonacci: { level382: number; level500: number; level618: number };
  };
  summary: string;
}

const analyzeMarket = (symbol: string): MarketAnalysis => {
  // Simulated analysis based on technical indicators
  const rsi = Math.random() * 100;
  const macdValue = (Math.random() - 0.5) * 200;
  
  let recommendation: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (rsi < 30) recommendation = 'bullish';
  else if (rsi > 70) recommendation = 'bearish';
  else if (macdValue > 50) recommendation = 'bullish';
  else if (macdValue < -50) recommendation = 'bearish';

  return {
    symbol: symbol.toUpperCase(),
    recommendation,
    confidence: 60 + Math.random() * 30,
    indicators: {
      rsi: parseFloat(rsi.toFixed(2)),
      macd: {
        value: parseFloat(macdValue.toFixed(2)),
        signal: parseFloat((macdValue * 0.9).toFixed(2)),
        histogram: parseFloat((macdValue * 0.1).toFixed(2)),
      },
      sma: {
        sma20: 42500 + Math.random() * 1000,
        sma50: 41800 + Math.random() * 1000,
        sma200: 38500 + Math.random() * 1000,
      },
      fibonacci: {
        level382: 41200,
        level500: 40500,
        level618: 39800,
      },
    },
    summary: recommendation === 'bullish' 
      ? 'Technical indicators suggest bullish momentum. RSI shows oversold conditions and MACD is showing positive divergence.'
      : recommendation === 'bearish'
      ? 'Technical indicators suggest bearish pressure. RSI is in overbought territory and MACD shows negative momentum.'
      : 'Market is consolidating. Wait for clearer signals before taking positions.',
  };
};

const generateResponse = (input: string): { content: string; analysis?: MarketAnalysis } => {
  const lowerInput = input.toLowerCase();
  
  // Check for market/crypto mentions
  const cryptoPatterns = ['btc', 'bitcoin', 'eth', 'ethereum', 'sol', 'solana', 'bnb', 'xrp'];
  const foundCrypto = cryptoPatterns.find(c => lowerInput.includes(c));
  
  if (foundCrypto || lowerInput.includes('analyz') || lowerInput.includes('تحلیل') || lowerInput.includes('market')) {
    const symbol = foundCrypto || 'BTC';
    const analysis = analyzeMarket(symbol);
    
    return {
      content: `📊 **${analysis.symbol} Market Analysis**\n\n${analysis.summary}\n\n⚠️ *This is informational only and not financial advice. Always do your own research.*`,
      analysis,
    };
  }
  
  if (lowerInput.includes('deposit') || lowerInput.includes('واریز')) {
    return { content: 'To deposit funds:\n1. Go to Wallet section\n2. Select your currency\n3. Click "Deposit"\n4. Use the provided address or bank details\n\nWould you like me to help you with a specific currency?' };
  }
  
  if (lowerInput.includes('withdraw') || lowerInput.includes('برداشت')) {
    return { content: 'To withdraw funds:\n1. Navigate to Wallet\n2. Choose your wallet\n3. Click "Withdraw"\n4. Enter amount and destination\n\nNote: Large withdrawals may require additional verification.' };
  }
  
  if (lowerInput.includes('referral') || lowerInput.includes('معرفی')) {
    return { content: 'Our referral program offers:\n- **10%** commission on Level 1 referrals\n- **5%** on Level 2\n- **2%** on Level 3\n\nFind your referral link in the Referrals section!' };
  }
  
  if (lowerInput.includes('help') || lowerInput.includes('کمک')) {
    return { content: 'I can help you with:\n- 📈 Market analysis (ask about BTC, ETH, etc.)\n- 💰 Deposit & withdrawal guidance\n- 🔄 Exchange operations\n- 👥 Referral program info\n- 🔐 Security recommendations\n\nWhat would you like to know?' };
  }
  
  return { content: 'Hello! I\'m Samir AI Assistant. I can help you with market analysis, trading guidance, and platform navigation. Try asking me to "analyze BTC" or "help with deposits"!' };
};

export default function AIAssistant() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to Samir AI Assistant! 🤖\n\nI can help you with:\n- Market analysis with technical indicators\n- Navigation and platform guidance\n- Trading insights and recommendations\n\nHow can I assist you today?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1500));

    const response = generateResponse(input);
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      analysis: response.analysis,
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const quickActions = [
    { label: 'Analyze BTC', query: 'Analyze Bitcoin market' },
    { label: 'Analyze ETH', query: 'Analyze Ethereum market' },
    { label: 'Deposit Help', query: 'How to deposit?' },
    { label: 'Referral Info', query: 'Tell me about referral program' },
  ];

  return (
    <MainLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold gradient-text">{t('aiAssistant')}</h1>
          <p className="text-muted-foreground mt-1">Get market analysis and platform assistance</p>
        </div>

        <div className="flex-1 grid lg:grid-cols-4 gap-6 min-h-0">
          {/* Chat */}
          <Card className="lg:col-span-3 glass-panel flex flex-col">
            <CardContent className="flex-1 flex flex-col p-4 min-h-0">
              {/* Messages */}
              <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : ''}`}>
                        <div className={`p-4 rounded-2xl ${
                          msg.role === 'user' 
                            ? 'bg-primary text-primary-foreground rounded-br-md' 
                            : 'bg-secondary/50 rounded-bl-md'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        
                        {/* Analysis Card */}
                        {msg.analysis && (
                          <Card className="mt-3 bg-background/50 border-primary/20">
                            <CardContent className="p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="font-bold">{msg.analysis.symbol} Analysis</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  msg.analysis.recommendation === 'bullish' ? 'bg-success/20 text-success' :
                                  msg.analysis.recommendation === 'bearish' ? 'bg-destructive/20 text-destructive' :
                                  'bg-warning/20 text-warning'
                                }`}>
                                  {msg.analysis.recommendation === 'bullish' && <TrendingUp className="inline h-4 w-4 mr-1" />}
                                  {msg.analysis.recommendation === 'bearish' && <TrendingDown className="inline h-4 w-4 mr-1" />}
                                  {msg.analysis.recommendation.toUpperCase()}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="p-2 rounded bg-secondary/30">
                                  <span className="text-muted-foreground">RSI</span>
                                  <p className="font-mono font-bold">{msg.analysis.indicators.rsi}</p>
                                </div>
                                <div className="p-2 rounded bg-secondary/30">
                                  <span className="text-muted-foreground">MACD</span>
                                  <p className="font-mono font-bold">{msg.analysis.indicators.macd.value}</p>
                                </div>
                                <div className="p-2 rounded bg-secondary/30">
                                  <span className="text-muted-foreground">Confidence</span>
                                  <p className="font-mono font-bold">{msg.analysis.confidence.toFixed(1)}%</p>
                                </div>
                                <div className="p-2 rounded bg-secondary/30">
                                  <span className="text-muted-foreground">SMA 20</span>
                                  <p className="font-mono font-bold">${msg.analysis.indicators.sma.sma20.toFixed(0)}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs text-warning">
                                <AlertTriangle className="h-4 w-4" />
                                <span>Not financial advice - for informational purposes only</span>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        
                        <p className="text-xs text-muted-foreground mt-1 px-2">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>AI is analyzing...</span>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="pt-4 border-t border-border mt-4">
                <div className="flex gap-2 mb-3">
                  {quickActions.map((action) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      size="sm"
                      onClick={() => { setInput(action.query); }}
                      className="text-xs"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about markets, deposits, or get help..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1"
                  />
                  <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="glass-panel">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  {t('technicalIndicators')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RSI</span>
                  <span>Momentum oscillator (0-100)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MACD</span>
                  <span>Trend indicator</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SMA</span>
                  <span>Moving averages</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fibonacci</span>
                  <span>Retracement levels</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel bg-warning/5 border-warning/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-warning">Disclaimer</p>
                    <p className="text-muted-foreground mt-1">
                      AI analysis is for informational purposes only and does not constitute financial advice.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
