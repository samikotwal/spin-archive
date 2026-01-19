-- Create wheel_items table
CREATE TABLE public.wheel_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- Create lists table
CREATE TABLE public.lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deleted_items table (items saved to lists)
CREATE TABLE public.deleted_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT NOT NULL,
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  deleted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create anime_cache table for caching API responses
CREATE TABLE public.anime_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  data JSONB NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.wheel_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deleted_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anime_cache ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth required for this app)
CREATE POLICY "Anyone can view wheel items" ON public.wheel_items FOR SELECT USING (true);
CREATE POLICY "Anyone can create wheel items" ON public.wheel_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update wheel items" ON public.wheel_items FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete wheel items" ON public.wheel_items FOR DELETE USING (true);

CREATE POLICY "Anyone can view lists" ON public.lists FOR SELECT USING (true);
CREATE POLICY "Anyone can create lists" ON public.lists FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update lists" ON public.lists FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete lists" ON public.lists FOR DELETE USING (true);

CREATE POLICY "Anyone can view deleted items" ON public.deleted_items FOR SELECT USING (true);
CREATE POLICY "Anyone can create deleted items" ON public.deleted_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete deleted items" ON public.deleted_items FOR DELETE USING (true);

CREATE POLICY "Anyone can view anime cache" ON public.anime_cache FOR SELECT USING (true);
CREATE POLICY "Anyone can create anime cache" ON public.anime_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update anime cache" ON public.anime_cache FOR UPDATE USING (true);

-- Create index for anime cache lookups
CREATE INDEX idx_anime_cache_category ON public.anime_cache(category);