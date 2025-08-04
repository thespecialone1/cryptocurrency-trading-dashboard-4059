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
    },
    ripple: {
      name: "XRP",
      marketCap: "$32.8B",
      marketCapChange: 1.8,
      volume: "$2.1B",
      volumeChange: -3.2,
      dominance: "1.4%",
      dominanceChange: 0.1
    },
    binancecoin: {
      name: "BNB",
      marketCap: "$96.4B",
      marketCapChange: 4.2,
      volume: "$1.8B",
      volumeChange: 8.7,
      dominance: "4.1%",
      dominanceChange: 0.3
    },
    dogecoin: {
      name: "Dogecoin",
      marketCap: "$18.5B",
      marketCapChange: 12.3,
      volume: "$1.2B",
      volumeChange: 15.6,
      dominance: "0.8%",
      dominanceChange: 0.7
    },
    polygon: {
      name: "Polygon",
      marketCap: "$8.2B",
      marketCapChange: -2.1,
      volume: "$450M",
      volumeChange: 3.4,
      dominance: "0.4%",
      dominanceChange: -0.1
    },
    chainlink: {
      name: "Chainlink",
      marketCap: "$9.8B",
      marketCapChange: 6.5,
      volume: "$380M",
      volumeChange: 11.2,
      dominance: "0.4%",
      dominanceChange: 0.2
    },
    litecoin: {
      name: "Litecoin",
      marketCap: "$7.1B",
      marketCapChange: 0.9,
      volume: "$420M",
      volumeChange: -1.8,
      dominance: "0.3%",
      dominanceChange: 0.0
    },
    polkadot: {
      name: "Polkadot",
      marketCap: "$11.2B",
      marketCapChange: 3.7,
      volume: "$320M",
      volumeChange: 9.1,
      dominance: "0.5%",
      dominanceChange: 0.1
    },
    avalanche: {
      name: "Avalanche",
      marketCap: "$15.3B",
      marketCapChange: 7.8,
      volume: "$680M",
      volumeChange: 14.5,
      dominance: "0.7%",
      dominanceChange: 0.4
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
                  <SelectItem value="ripple">XRP (XRP)</SelectItem>
                  <SelectItem value="binancecoin">BNB (BNB)</SelectItem>
                  <SelectItem value="dogecoin">Dogecoin (DOGE)</SelectItem>
                  <SelectItem value="polygon">Polygon (MATIC)</SelectItem>
                  <SelectItem value="chainlink">Chainlink (LINK)</SelectItem>
                  <SelectItem value="litecoin">Litecoin (LTC)</SelectItem>
                  <SelectItem value="polkadot">Polkadot (DOT)</SelectItem>
                  <SelectItem value="avalanche">Avalanche (AVAX)</SelectItem>
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