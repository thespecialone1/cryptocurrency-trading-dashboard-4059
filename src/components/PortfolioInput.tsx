import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Your Portfolio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <Input
            placeholder="Coin (e.g., bitcoin)"
            value={newEntry.coin}
            onChange={(e) => setNewEntry({...newEntry, coin: e.target.value})}
          />
          <Input
            type="number"
            placeholder="Amount"
            value={newEntry.amount}
            onChange={(e) => setNewEntry({...newEntry, amount: e.target.value})}
          />
          <Input
            type="number"
            placeholder="Avg Buy Price ($)"
            value={newEntry.avgBuyPrice}
            onChange={(e) => setNewEntry({...newEntry, avgBuyPrice: e.target.value})}
          />
          <Button onClick={addEntry} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        {portfolio.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Portfolio entries:</p>
              <Badge variant="outline">
                Total invested: ${getTotalValue().toFixed(2)}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {portfolio.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{entry.coin.toUpperCase()}</div>
                    <div className="text-sm text-muted-foreground">
                      {entry.amount} @ ${entry.avgBuyPrice}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      ${(entry.amount * entry.avgBuyPrice).toFixed(2)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEntry(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioInput;