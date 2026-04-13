
-- Create memorial_trees table for the tree planting memorial feature
CREATE TABLE public.memorial_trees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  victim_name TEXT NOT NULL,
  victim_city TEXT,
  victim_year TEXT,
  sapling_type TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  location_description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  memorial_hash TEXT NOT NULL,
  planted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.memorial_trees ENABLE ROW LEVEL SECURITY;

-- Users can view all memorial trees (public memorial wall)
CREATE POLICY "Anyone can view memorial trees"
  ON public.memorial_trees FOR SELECT
  USING (true);

-- Users can insert their own tree requests
CREATE POLICY "Users can create tree requests"
  ON public.memorial_trees FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending requests
CREATE POLICY "Users can update own pending trees"
  ON public.memorial_trees FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Admins can manage all
CREATE POLICY "Admins can manage all memorial trees"
  ON public.memorial_trees FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_memorial_trees_updated_at
  BEFORE UPDATE ON public.memorial_trees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live memorial wall
ALTER PUBLICATION supabase_realtime ADD TABLE public.memorial_trees;
