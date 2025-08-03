import { useState, useEffect } from "react";
import { Plus, Trash2, TrendingUp, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PortfolioEntry {
  id: string;
  coin_id: string;
  coin_name: string;
  amount: number;
  avg_buy_price: number;
  buy_date: string;
}

interface EnhancedPortfolioInputProps {
  onPortfolioChange: (portfolio: PortfolioEntry[]) => void;
}

const EnhancedPortfolioInput = ({ onPortfolioChange }: EnhancedPortfolioInputProps) => {
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([]);
  const [newEntry, setNewEntry] = useState({
    coin_id: "",
    coin_name: "",
    amount: "",
    avg_buy_price: "",
  });
  const { toast } = useToast();
  const { user } = useAuth();

  // Load user's portfolio on mount
  useEffect(() => {
    if (user) {
      loadPortfolio();
    }
  }, [user]);

  const loadPortfolio = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('portfolio_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPortfolio(data || []);
      onPortfolioChange(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load portfolio: " + error.message,
        variant: "destructive",
      });
    }
  };

  const addEntry = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage your portfolio.",
        variant: "destructive",
      });
      return;
    }

    if (!newEntry.coin_id || !newEntry.coin_name || !newEntry.amount || !newEntry.avg_buy_price) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(newEntry.amount);
    const avgBuyPrice = parseFloat(newEntry.avg_buy_price);

    if (isNaN(amount) || isNaN(avgBuyPrice) || amount <= 0 || avgBuyPrice <= 0) {
      toast({
        title: "Invalid Input",
        description: "Amount and price must be positive numbers.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('portfolio_entries')
        .insert({
          user_id: user.id,
          coin_id: newEntry.coin_id.toLowerCase(),
          coin_name: newEntry.coin_name,
          amount,
          avg_buy_price: avgBuyPrice,
        })
        .select()
        .single();

      if (error) throw error;

      const updatedPortfolio = [...portfolio, data];
      setPortfolio(updatedPortfolio);
      onPortfolioChange(updatedPortfolio);

      setNewEntry({
        coin_id: "",
        coin_name: "",
        amount: "",
        avg_buy_price: "",
      });

      toast({
        title: "Investment Added",
        description: `${newEntry.coin_name} has been added to your portfolio.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add investment: " + error.message,
        variant: "destructive",
      });
    }
  };

  const removeEntry = async (entryId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('portfolio_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user.id);

      if (error) throw error;

      const updatedPortfolio = portfolio.filter(entry => entry.id !== entryId);
      setPortfolio(updatedPortfolio);
      onPortfolioChange(updatedPortfolio);

      toast({
        title: "Investment Removed",
        description: "Investment has been removed from your portfolio.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove investment: " + error.message,
        variant: "destructive",
      });
    }
  };

  const getTotalValue = () => {
    return portfolio.reduce((total, entry) => {
      return total + (entry.amount * entry.avg_buy_price);
    }, 0);
  };

  if (!user) {
    return (
      <Card className="glass-card border border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Calculator className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Portfolio Tracking</h3>
          <p className="text-muted-foreground mb-4">
            Sign in to track your cryptocurrency investments and get personalized AI insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Your Portfolio
          {portfolio.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              Total: ${getTotalValue().toFixed(2)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new investment form */}
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Coin ID (e.g., bitcoin)"
            value={newEntry.coin_id}
            onChange={(e) => setNewEntry(prev => ({ ...prev, coin_id: e.target.value }))}
          />
          <Input
            placeholder="Coin Name (e.g., Bitcoin)"
            value={newEntry.coin_name}
            onChange={(e) => setNewEntry(prev => ({ ...prev, coin_name: e.target.value }))}
          />
          <Input
            placeholder="Amount"
            type="number"
            step="any"
            value={newEntry.amount}
            onChange={(e) => setNewEntry(prev => ({ ...prev, amount: e.target.value }))}
          />
          <Input
            placeholder="Avg Buy Price ($)"
            type="number"
            step="any"
            value={newEntry.avg_buy_price}
            onChange={(e) => setNewEntry(prev => ({ ...prev, avg_buy_price: e.target.value }))}
          />
        </div>
        
        <Button onClick={addEntry} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add to Portfolio
        </Button>

        {/* Portfolio entries */}
        {portfolio.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calculator className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No investments added yet.</p>
            <p className="text-sm">Add your crypto holdings to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {portfolio.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
              >
                <div className="flex-1">
                  <div className="font-medium">{entry.coin_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {entry.amount} @ ${entry.avg_buy_price}
                  </div>
                </div>
                <div className="text-right mr-3">
                  <div className="font-medium">
                    ${(entry.amount * entry.avg_buy_price).toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(entry.buy_date).toLocaleDateString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEntry(entry.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedPortfolioInput;