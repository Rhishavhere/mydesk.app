import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Send, 
  Bot, 
  User, 
  Camera,
  Loader2,
  Cpu,
  MemoryStick,
  Clock,
  Battery
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIChatProps {
  device: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  systemSummary?: {
    cpu_usage: number;
    memory_usage: number;
    uptime: string;
    battery_percent?: number;
  };
}

export const AIChat = ({ device }: AIChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: `Hello! I'm RhishDesk AI, your intelligent system administrator. I have real-time access to your ${device === 'desktop' ? 'Win11-Desktop' : 'Fedora-Laptop'} and can help you with system monitoring, performance analysis, troubleshooting, and more. What would you like to know about your system?`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [includeScreenshot, setIncludeScreenshot] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch(`https://myspace.rhishav.com/${device}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: inputValue,
          include_screenshot: includeScreenshot
        })
      });

      const data = await response.json();

      if (response.ok) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: data.ai_response,
          timestamp: new Date(),
          systemSummary: data.system_summary
        };
        setMessages(prev => [...prev, aiMessage]);
        
        toast({
          title: "Response Received",
          description: "AI analysis complete",
          variant: "default",
        });
      } else {
        toast({
          title: "AI Error",
          description: data.error || "Failed to get AI response",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to communicate with AI service",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="glass-card p-6 h-[600px] flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <Bot className="h-6 w-6 text-primary animate-pulse" />
        <h2 className="text-xl font-semibold">RhishDesk AI</h2>
        <Badge variant="outline" className="text-xs">
          {device === 'desktop' ? 'Win11-Desktop' : 'Fedora-Laptop'}
        </Badge>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 mb-4" ref={scrollAreaRef}>
        <div className="space-y-4 pr-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-gradient-primary text-white'
                }`}>
                  {message.type === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                {/* Message Content */}
                <div className={`space-y-2 ${message.type === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-gradient-card border border-border/50'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* System Summary for AI messages */}
                  {message.type === 'ai' && message.systemSummary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      <div className="flex items-center gap-1 text-xs bg-muted/50 rounded px-2 py-1">
                        <Cpu className="h-3 w-3 text-primary" />
                        <span>CPU: {message.systemSummary.cpu_usage}%</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs bg-muted/50 rounded px-2 py-1">
                        <MemoryStick className="h-3 w-3 text-success" />
                        <span>RAM: {message.systemSummary.memory_usage}%</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs bg-muted/50 rounded px-2 py-1">
                        <Clock className="h-3 w-3 text-warning" />
                        <span>{message.systemSummary.uptime}</span>
                      </div>
                      {message.systemSummary.battery_percent && (
                        <div className="flex items-center gap-1 text-xs bg-muted/50 rounded px-2 py-1">
                          <Battery className="h-3 w-3 text-accent" />
                          <span>{message.systemSummary.battery_percent}%</span>
                        </div>
                      )}
                    </div>
                  )}

                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-primary text-white flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-gradient-card border border-border/50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">AI is analyzing your system...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="space-y-3">
        {/* Options */}
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-center space-x-2">
            <Switch
              id="screenshot"
              checked={includeScreenshot}
              onCheckedChange={setIncludeScreenshot}
            />
            <Label htmlFor="screenshot" className="text-sm flex items-center gap-1">
              <Camera className="h-3 w-3" />
              Include Screenshot
            </Label>
          </div>
          <span className="text-xs text-muted-foreground">
            Include current screen in AI analysis
          </span>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask me about system performance, troubleshooting, or any technical questions..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!inputValue.trim() || loading}
            className="px-4"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Suggestions */}
        <div className="flex flex-wrap gap-2">
          {[
            "What's my system's current performance?",
            "Why is my CPU usage high?",
            "Check memory usage trends",
            "Show me top processes"
          ].map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => setInputValue(suggestion)}
              disabled={loading}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};