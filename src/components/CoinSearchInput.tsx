import { useState } from "react";
import { Search, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CoinSearchInputProps {
  trackedCoins: Array<{ coin_id: string; coin_name: string }>;
  onCoinsChange: () => void;
}

// Popular cryptocurrencies with their CoinGecko IDs
const POPULAR_COINS = [
  { id: "bitcoin", name: "Bitcoin" },
  { id: "ethereum", name: "Ethereum" },
  { id: "cardano", name: "Cardano" },
  { id: "ripple", name: "XRP" },
  { id: "binancecoin", name: "BNB" },
  { id: "solana", name: "Solana" },
  { id: "polkadot", name: "Polkadot" },
  { id: "dogecoin", name: "Dogecoin" },
  { id: "avalanche-2", name: "Avalanche" },
  { id: "chainlink", name: "Chainlink" },
  { id: "polygon", name: "Polygon" },
  { id: "shiba-inu", name: "Shiba Inu" },
  { id: "litecoin", name: "Litecoin" },
  { id: "ethereum-classic", name: "Ethereum Classic" },
  { id: "stellar", name: "Stellar" },
  { id: "cosmos", name: "Cosmos" },
  { id: "algorand", name: "Algorand" },
  { id: "tron", name: "TRON" },
  { id: "near", name: "NEAR Protocol" },
  { id: "uniswap", name: "Uniswap" },
];

const CoinSearchInput = ({ trackedCoins, onCoinsChange }: CoinSearchInputProps) => {
  const [searchInput, setSearchInput] = useState("");
  const [coinIdInput, setCoinIdInput] = useState("");
  const [coinNameInput, setCoinNameInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const filteredCoins = POPULAR_COINS.filter(coin =>
    coin.name.toLowerCase().includes(searchInput.toLowerCase()) ||
    coin.id.toLowerCase().includes(searchInput.toLowerCase())
  ).filter(coin => 
    !trackedCoins.some(tracked => tracked.coin_id === coin.id)
  );

  const addCoin = async (coinId: string, coinName: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to track coins.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('tracked_coins')
        .insert({
          user_id: user.id,
          coin_id: coinId,
          coin_name: coinName,
        });

      if (error) throw error;

      toast({
        title: "Coin Added",
        description: `${coinName} is now being tracked.`,
      });

      onCoinsChange();
      setSearchInput("");
      setCoinIdInput("");
      setCoinNameInput("");
      setShowCustomInput(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeCoin = async (coinId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tracked_coins')
        .delete()
        .eq('user_id', user.id)
        .eq('coin_id', coinId);

      if (error) throw error;

      toast({
        title: "Coin Removed",
        description: "Coin removed from tracking.",
      });

      onCoinsChange();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCustomCoinAdd = () => {
    if (!coinIdInput.trim() || !coinNameInput.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both coin ID and name.",
        variant: "destructive",
      });
      return;
    }

    addCoin(coinIdInput.trim().toLowerCase(), coinNameInput.trim());
  };

  return (
    <Card className="p-6 glass-card border border-border/50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Track Cryptocurrencies</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomInput(!showCustomInput)}
          >
            {showCustomInput ? "Popular" : "Custom"}
          </Button>
        </div>

        {showCustomInput ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add custom coins using their CoinGecko ID. Find IDs at coingecko.com.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Coin ID (e.g., ripple)"
                value={coinIdInput}
                onChange={(e) => setCoinIdInput(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Display Name (e.g., XRP)"
                value={coinNameInput}
                onChange={(e) => setCoinNameInput(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleCustomCoinAdd} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search popular cryptocurrencies..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {filteredCoins.map((coin) => (
                <Button
                  key={coin.id}
                  variant="outline"
                  onClick={() => addCoin(coin.id, coin.name)}
                  className="justify-start text-left h-auto p-3"
                >
                  <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{coin.name}</div>
                    <div className="text-xs text-muted-foreground">{coin.id}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {trackedCoins.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Currently Tracking:</h4>
            <div className="flex flex-wrap gap-2">
              {trackedCoins.map((coin) => (
                <Badge
                  key={coin.coin_id}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  {coin.coin_name}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeCoin(coin.coin_id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CoinSearchInput;