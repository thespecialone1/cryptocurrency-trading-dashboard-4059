import { useState, useEffect } from "react";
import { LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import MarketStats from "@/components/MarketStats";
import CryptoChart from "@/components/CryptoChart";
import PortfolioCard from "@/components/PortfolioCard";
import CryptoList from "@/components/CryptoList";
import CoinSearchInput from "@/components/CoinSearchInput";
import EnhancedPortfolioInput from "@/components/EnhancedPortfolioInput";
import AIChatInterface from "@/components/AIChatInterface";
import AuthPage from "@/components/AuthPage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface PortfolioEntry {
  id: string;
  coin_id: string;
  coin_name: string;
  amount: number;
  avg_buy_price: number;
  buy_date: string;
}

interface TrackedCoin {
  coin_id: string;
  coin_name: string;
}

const Index = () => {
  const [trackedCoins, setTrackedCoins] = useState<TrackedCoin[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([]);
  const [marketStatsCoin, setMarketStatsCoin] = useState<string>("bitcoin");
  const [showAuth, setShowAuth] = useState(false);
  const { user, loading, signOut } = useAuth();

  // Load user's tracked coins
  useEffect(() => {
    if (user) {
      loadTrackedCoins();
    } else {
      // Default coins for non-authenticated users
      setTrackedCoins([
        { coin_id: "bitcoin", coin_name: "Bitcoin" },
        { coin_id: "ethereum", coin_name: "Ethereum" },
        { coin_id: "cardano", coin_name: "Cardano" },
      ]);
    }
  }, [user]);

  const loadTrackedCoins = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tracked_coins')
        .select('coin_id, coin_name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setTrackedCoins(data);
      } else {
        // Add default coins if user has none
        const defaultCoins = [
          { coin_id: "bitcoin", coin_name: "Bitcoin" },
          { coin_id: "ethereum", coin_name: "Ethereum" },
          { coin_id: "cardano", coin_name: "Cardano" },
        ];
        
        for (const coin of defaultCoins) {
          await supabase
            .from('tracked_coins')
            .insert({
              user_id: user.id,
              coin_id: coin.coin_id,
              coin_name: coin.coin_name,
            });
        }
        
        setTrackedCoins(defaultCoins);
      }
    } catch (error) {
      console.error('Error loading tracked coins:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setPortfolio([]);
    setTrackedCoins([
      { coin_id: "bitcoin", coin_name: "Bitcoin" },
      { coin_id: "ethereum", coin_name: "Ethereum" },
      { coin_id: "cardano", coin_name: "Cardano" },
    ]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (showAuth) {
    return <AuthPage onBack={() => setShowAuth(false)} />;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Crypto Portfolio Tracker</h1>
            <p className="text-muted-foreground">Track your investments and get AI-powered insights</p>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  {user.email}
                </div>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowAuth(true)}>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </header>
        
        <MarketStats selectedCoin={marketStatsCoin} onCoinChange={setMarketStatsCoin} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <CoinSearchInput 
            trackedCoins={trackedCoins}
            onCoinsChange={loadTrackedCoins}
          />
          <EnhancedPortfolioInput 
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
        
        <div className="grid grid-cols-1 gap-8">
          <CryptoList selectedCoins={trackedCoins.map(coin => coin.coin_id)} />
        </div>
        
        {/* Enhanced AI Chat with user data */}
        <AIChatInterface 
          portfolio={portfolio}
          selectedCoins={trackedCoins.map(coin => coin.coin_id)}
        />
      </div>
    </div>
  );
};

export default Index;