import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const POPULAR_COINS = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH" },
  { id: "cardano", name: "Cardano", symbol: "ADA" },
  { id: "solana", name: "Solana", symbol: "SOL" },
  { id: "polkadot", name: "Polkadot", symbol: "DOT" },
  { id: "chainlink", name: "Chainlink", symbol: "LINK" },
];

interface CoinSelectorProps {
  selectedCoins: string[];
  onCoinsChange: (coins: string[]) => void;
}

const CoinSelector = ({ selectedCoins, onCoinsChange }: CoinSelectorProps) => {
  const [customCoin, setCustomCoin] = useState("");

  const toggleCoin = (coinId: string) => {
    const newSelection = selectedCoins.includes(coinId)
      ? selectedCoins.filter(id => id !== coinId)
      : [...selectedCoins, coinId];
    onCoinsChange(newSelection);
  };

  const addCustomCoin = () => {
    if (customCoin && !selectedCoins.includes(customCoin.toLowerCase())) {
      onCoinsChange([...selectedCoins, customCoin.toLowerCase()]);
      setCustomCoin("");
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Select Coins to Track</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {POPULAR_COINS.map((coin) => (
            <Button
              key={coin.id}
              variant={selectedCoins.includes(coin.id) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleCoin(coin.id)}
              className="justify-start gap-2"
            >
              {selectedCoins.includes(coin.id) && <Check className="w-4 h-4" />}
              {coin.symbol}
            </Button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Add custom coin (e.g., dogecoin)"
            value={customCoin}
            onChange={(e) => setCustomCoin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustomCoin()}
          />
          <Button onClick={addCustomCoin} size="icon" variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {selectedCoins.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Selected coins:</p>
            <div className="flex flex-wrap gap-2">
              {selectedCoins.map((coinId) => (
                <Badge
                  key={coinId}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => toggleCoin(coinId)}
                >
                  {coinId.toUpperCase()} ×
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CoinSelector;