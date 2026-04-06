
-- Wheels table (multiple wheels per user)
CREATE TABLE public.wheels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'My Wheel',
  is_public BOOLEAN NOT NULL DEFAULT false,
  share_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(4), 'hex'),
  theme TEXT NOT NULL DEFAULT 'neon',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.wheels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wheels" ON public.wheels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view public wheels" ON public.wheels FOR SELECT USING (is_public = true);
CREATE POLICY "Users can create wheels" ON public.wheels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their wheels" ON public.wheels FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their wheels" ON public.wheels FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_wheels_updated_at BEFORE UPDATE ON public.wheels
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Entries table (items on a wheel with weight)
CREATE TABLE public.entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wheel_id UUID NOT NULL REFERENCES public.wheels(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  weight NUMERIC NOT NULL DEFAULT 1,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view entries of their wheels" ON public.entries FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.wheels WHERE id = wheel_id AND (user_id = auth.uid() OR is_public = true)));
CREATE POLICY "Users can insert entries to their wheels" ON public.entries FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.wheels WHERE id = wheel_id AND user_id = auth.uid()));
CREATE POLICY "Users can update entries on their wheels" ON public.entries FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.wheels WHERE id = wheel_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete entries from their wheels" ON public.entries FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.wheels WHERE id = wheel_id AND user_id = auth.uid()));

-- Spins table (history)
CREATE TABLE public.spins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wheel_id UUID NOT NULL REFERENCES public.wheels(id) ON DELETE CASCADE,
  winner_value TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.spins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their spins" ON public.spins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create spins" ON public.spins FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Rooms table (multiplayer)
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE DEFAULT upper(encode(gen_random_bytes(3), 'hex')),
  host_id UUID NOT NULL,
  wheel_id UUID REFERENCES public.wheels(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active rooms" ON public.rooms FOR SELECT USING (is_active = true);
CREATE POLICY "Host can create rooms" ON public.rooms FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Host can update rooms" ON public.rooms FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "Host can delete rooms" ON public.rooms FOR DELETE USING (auth.uid() = host_id);

-- Participants table
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view room members" ON public.participants FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.rooms WHERE id = room_id AND is_active = true));
CREATE POLICY "Users can join rooms" ON public.participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave rooms" ON public.participants FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for rooms and participants
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
