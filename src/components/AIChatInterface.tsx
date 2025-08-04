import { useState, useEffect } from "react";
import { Send, Bot, User, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface AIChatInterfaceProps {
  portfolio: Array<{
    id: string;
    coin_id: string;
    coin_name: string;
    amount: number;
    avg_buy_price: number;
    buy_date: string;
  }>;
  selectedCoins: string[];
}

const AIChatInterface = ({ portfolio, selectedCoins }: AIChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load conversation history when user logs in
  useEffect(() => {
    if (user && isOpen) {
      loadConversationHistory();
    }
  }, [user, isOpen]);

  const loadConversationHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversation_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(20); // Load last 20 messages

      if (error) throw error;

      if (data) {
        const formattedMessages: Message[] = data.map(msg => ({
          id: msg.id,
          content: msg.message,
          role: msg.role as "user" | "assistant",
          timestamp: new Date(msg.created_at),
        }));
        
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const saveMessageToHistory = async (message: string, role: "user" | "assistant") => {
    if (!user) return;

    try {
      await supabase
        .from('conversation_history')
        .insert({
          user_id: user.id,
          message,
          role,
          context: {
            portfolio_count: portfolio.length,
            tracked_coins_count: selectedCoins.length,
            timestamp: new Date().toISOString(),
          },
        });
    } catch (error) {
      console.error('Error saving message to history:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to chat with the AI assistant.",
        variant: "destructive",
      });
      return;
    }

    // Check if portfolio is empty and remind user
    if (portfolio.length === 0) {
      toast({
        title: "Add Your Portfolio",
        description: "Please add some cryptocurrency investments to your portfolio first so I can provide personalized insights and predictions.",
        variant: "default",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Save user message to history
    await saveMessageToHistory(input, "user");

    try {
      // Call Supabase Edge Function to interact with Gemini
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: input,
          portfolio,
          selectedCoins,
          chatHistory: messages.slice(-10) // Send last 10 messages for context
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error('Failed to get AI response');
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: "assistant",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Save AI response to history
      await saveMessageToHistory(data.response, "assistant");
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating AI Toggle Button */}
      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50"
          size="icon"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Floating AI Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] z-50 animate-slide-up">
          <Card className="glass-card h-full flex flex-col border border-border/50 shadow-2xl">
            <CardHeader className="pb-3 flex-shrink-0 border-b border-border/30">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  AI Assistant
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-3 overflow-hidden">
              <ScrollArea className="flex-1 h-full">
                <div className="space-y-3 pr-3 pb-2">
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-6">
                      <Bot className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Ask me about your portfolio!</p>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-2 text-xs leading-relaxed ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.role === "assistant" && <Bot className="w-3 h-3 mt-0.5 flex-shrink-0" />}
                          {message.role === "user" && <User className="w-3 h-3 mt-0.5 flex-shrink-0" />}
                          <div className="text-xs whitespace-pre-wrap break-words overflow-wrap-anywhere">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-2 justify-start">
                      <div className="bg-muted rounded-lg p-2 max-w-[85%]">
                        <div className="flex items-center gap-2">
                          <Bot className="w-3 h-3" />
                          <div className="text-xs">Analyzing...</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="flex gap-2 mt-3 pt-2 border-t border-border/30 flex-shrink-0">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your portfolio..."
                  disabled={isLoading}
                  className="text-xs h-8"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-8 w-8"
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default AIChatInterface;