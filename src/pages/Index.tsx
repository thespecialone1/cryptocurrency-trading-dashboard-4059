import { useState } from "react";
import MarketStats from "@/components/MarketStats";
import CryptoChart from "@/components/CryptoChart";
import PortfolioCard from "@/components/PortfolioCard";
import CryptoList from "@/components/CryptoList";
import CoinSelector from "@/components/CoinSelector";
import PortfolioInput from "@/components/PortfolioInput";
import AIChatInterface from "@/components/AIChatInterface";

interface PortfolioEntry {
  coin: string;
  amount: number;
  avgBuyPrice: number;
}

const Index = () => {
  const [selectedCoins, setSelectedCoins] = useState<string[]>(["bitcoin", "ethereum", "cardano"]);
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Crypto Portfolio Tracker</h1>
          <p className="text-muted-foreground">Track your investments and get AI-powered insights</p>
        </header>
        
        <MarketStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <CoinSelector 
            selectedCoins={selectedCoins}
            onCoinsChange={setSelectedCoins}
          />
          <PortfolioInput 
            portfolio={portfolio}
            onPortfolioChange={setPortfolio}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <CryptoChart />
          </div>
          <div>
            <PortfolioCard />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CryptoList selectedCoins={selectedCoins} />
          <AIChatInterface 
            portfolio={portfolio}
            selectedCoins={selectedCoins}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;