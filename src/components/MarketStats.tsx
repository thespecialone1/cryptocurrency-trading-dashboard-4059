import { useState } from "react";
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface MarketStatsProps {
  selectedCoin?: string;
  onCoinChange?: (coin: string) => void;
}

const MarketStats = ({ selectedCoin = "bitcoin", onCoinChange }: MarketStatsProps) => {
  const [isCustomizing, setIsCustomizing] = useState(false);
  
  // Sample data - in real app this would come from API
  const coinData: Record<string, any> = {
    bitcoin: {
      name: "Bitcoin",
      marketCap: "$1.2T",
      marketCapChange: 2.4,
      volume: "$28.5B",
      volumeChange: 5.1,
      dominance: "42.1%",
      dominanceChange: -0.8
    },
    ethereum: {
      name: "Ethereum", 
      marketCap: "$421.8B",
      marketCapChange: 3.2,
      volume: "$15.2B",
      volumeChange: 7.3,
      dominance: "18.2%",
      dominanceChange: 0.5
    },
    solana: {
      name: "Solana",
      marketCap: "$58.9B", 
      marketCapChange: 8.7,
      volume: "$3.1B",
      volumeChange: 12.4,
      dominance: "2.8%",
      dominanceChange: 1.2
    },
    cardano: {
      name: "Cardano",
      marketCap: "$22.1B",
      marketCapChange: -1.3,
      volume: "$1.8B", 
      volumeChange: 4.2,
      dominance: "1.1%",
      dominanceChange: -0.2
    }
  };

  const data = coinData[selectedCoin] || coinData.bitcoin;

  return (
    <div className="space-y-4 mb-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Market Statistics - {data.name}</h2>
        <div className="flex items-center gap-2">
          {!isCustomizing ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsCustomizing(true)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Customize
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Select value={selectedCoin} onValueChange={onCoinChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select cryptocurrency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                  <SelectItem value="solana">Solana (SOL)</SelectItem>
                  <SelectItem value="cardano">Cardano (ADA)</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => setIsCustomizing(false)}>
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Market Cap</h3>
            <TrendingUpIcon className={`w-4 h-4 ${data.marketCapChange > 0 ? 'text-success' : 'text-warning'}`} />
          </div>
          <p className="text-2xl font-semibold mt-2">{data.marketCap}</p>
          <span className={`text-sm flex items-center gap-1 ${data.marketCapChange > 0 ? 'text-success' : 'text-warning'}`}>
            {data.marketCapChange > 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
            {Math.abs(data.marketCapChange)}%
          </span>
        </Card>
        
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">24h Volume</h3>
            <TrendingUpIcon className={`w-4 h-4 ${data.volumeChange > 0 ? 'text-success' : 'text-warning'}`} />
          </div>
          <p className="text-2xl font-semibold mt-2">{data.volume}</p>
          <span className={`text-sm flex items-center gap-1 ${data.volumeChange > 0 ? 'text-success' : 'text-warning'}`}>
            {data.volumeChange > 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
            {Math.abs(data.volumeChange)}%
          </span>
        </Card>
        
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Market Dominance</h3>
            <TrendingUpIcon className={`w-4 h-4 ${data.dominanceChange > 0 ? 'text-success' : 'text-warning'}`} />
          </div>
          <p className="text-2xl font-semibold mt-2">{data.dominance}</p>
          <span className={`text-sm flex items-center gap-1 ${data.dominanceChange > 0 ? 'text-success' : 'text-warning'}`}>
            {data.dominanceChange > 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
            {Math.abs(data.dominanceChange)}%
          </span>
        </Card>
      </div>
    </div>
  );
};

export default MarketStats;