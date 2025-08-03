-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  investment_horizon TEXT CHECK (investment_horizon IN ('short_term', 'long_term')),
  risk_tolerance TEXT CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create portfolio_entries table to store user investments
CREATE TABLE public.portfolio_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_id TEXT NOT NULL,
  coin_name TEXT NOT NULL,
  amount DECIMAL(20, 8) NOT NULL CHECK (amount > 0),
  avg_buy_price DECIMAL(20, 8) NOT NULL CHECK (avg_buy_price > 0),
  buy_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversation_history table to store AI chat history
CREATE TABLE public.conversation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  context JSONB, -- Store additional context like portfolio state at time of message
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tracked_coins table for user's selected coins
CREATE TABLE public.tracked_coins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_id TEXT NOT NULL,
  coin_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, coin_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracked_coins ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for portfolio_entries
CREATE POLICY "Users can view their own portfolio entries" 
ON public.portfolio_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolio entries" 
ON public.portfolio_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio entries" 
ON public.portfolio_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio entries" 
ON public.portfolio_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for conversation_history
CREATE POLICY "Users can view their own conversation history" 
ON public.conversation_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversation history" 
ON public.conversation_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for tracked_coins
CREATE POLICY "Users can view their own tracked coins" 
ON public.tracked_coins 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tracked coins" 
ON public.tracked_coins 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracked coins" 
ON public.tracked_coins 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_entries_updated_at
  BEFORE UPDATE ON public.portfolio_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();