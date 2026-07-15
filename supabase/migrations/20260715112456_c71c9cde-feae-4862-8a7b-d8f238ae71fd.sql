
-- anime_cache stores only public Jikan API data (no user info). Allow anon read/write.
GRANT SELECT, INSERT, UPDATE ON public.anime_cache TO anon;
GRANT SELECT, INSERT, UPDATE ON public.anime_cache TO authenticated;
GRANT ALL ON public.anime_cache TO service_role;

DROP POLICY IF EXISTS "Anyone can read anime cache" ON public.anime_cache;
DROP POLICY IF EXISTS "Anyone can insert anime cache" ON public.anime_cache;
DROP POLICY IF EXISTS "Anyone can update anime cache" ON public.anime_cache;

CREATE POLICY "Public read anime cache" ON public.anime_cache FOR SELECT USING (true);
CREATE POLICY "Public insert anime cache" ON public.anime_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update anime cache" ON public.anime_cache FOR UPDATE USING (true) WITH CHECK (true);
