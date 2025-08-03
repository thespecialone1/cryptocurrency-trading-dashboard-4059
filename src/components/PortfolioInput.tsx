import { useState } from "react";
import { Plus, Trash2, HelpCircle, DollarSign, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PortfolioEntry {
  coin: string;
  amount: number;
  avgBuyPrice: number;
}

interface PortfolioInputProps {
  portfolio: PortfolioEntry[];
  onPortfolioChange: (portfolio: PortfolioEntry[]) => void;
}

const PortfolioInput = ({ portfolio, onPortfolioChange }: PortfolioInputProps) => {
  const [newEntry, setNewEntry] = useState({
    coin: "",
    amount: "",
    avgBuyPrice: ""
  });

  const addEntry = () => {
    if (newEntry.coin && newEntry.amount && newEntry.avgBuyPrice) {
      const entry: PortfolioEntry = {
        coin: newEntry.coin.toLowerCase(),
        amount: parseFloat(newEntry.amount),
        avgBuyPrice: parseFloat(newEntry.avgBuyPrice)
      };
      
      onPortfolioChange([...portfolio, entry]);
      setNewEntry({ coin: "", amount: "", avgBuyPrice: "" });
    }
  };

  const removeEntry = (index: number) => {
    const newPortfolio = portfolio.filter((_, i) => i !== index);
    onPortfolioChange(newPortfolio);
  };

  const getTotalValue = () => {
    return portfolio.reduce((total, entry) => {
      return total + (entry.amount * entry.avgBuyPrice);
    }, 0);
  };

  return (
    <TooltipProvider>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Your Portfolio
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Track your crypto investments by adding coins with their amounts and purchase prices</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Add New Investment</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Cryptocurrency</label>
                <Input
                  placeholder="e.g., bitcoin, ethereum"
                  value={newEntry.coin}
                  onChange={(e) => setNewEntry({...newEntry, coin: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Amount Owned</label>
                <Input
                  type="number"
                  placeholder="0.5"
                  value={newEntry.amount}
                  onChange={(e) => setNewEntry({...newEntry, amount: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Average Buy Price</label>
                <Input
                  type="number"
                  placeholder="45000"
                  value={newEntry.avgBuyPrice}
                  onChange={(e) => setNewEntry({...newEntry, avgBuyPrice: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground opacity-0">Action</label>
                <Button onClick={addEntry} className="w-full h-10 text-sm px-2">
                  <Plus className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">Add</span>
                </Button>
              </div>
            </div>
          </div>

          {portfolio.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Your Holdings ({portfolio.length} {portfolio.length === 1 ? 'asset' : 'assets'})
                </h4>
                <Badge variant="outline" className="text-primary">
                  Total invested: ${getTotalValue().toLocaleString()}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {portfolio.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{entry.coin.toUpperCase()}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-4">
                        <span>Amount: {entry.amount.toLocaleString()}</span>
                        <span>•</span>
                        <span>Avg Price: ${entry.avgBuyPrice.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Badge variant="secondary" className="text-base px-3 py-1">
                          ${(entry.amount * entry.avgBuyPrice).toLocaleString()}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">Investment Value</div>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeEntry(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Remove from portfolio</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {portfolio.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Coins className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium mb-1">No investments yet</p>
              <p className="text-sm">Add your first cryptocurrency investment above</p>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default PortfolioInput;