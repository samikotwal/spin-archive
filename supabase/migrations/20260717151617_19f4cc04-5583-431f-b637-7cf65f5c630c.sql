-- Dedupe anime_cache: keep newest row per category
DELETE FROM public.anime_cache a
USING public.anime_cache b
WHERE a.category = b.category
  AND a.fetched_at < b.fetched_at;

-- Also drop exact fetched_at ties (keep max id)
DELETE FROM public.anime_cache a
USING public.anime_cache b
WHERE a.category = b.category
  AND a.fetched_at = b.fetched_at
  AND a.id < b.id;

-- Enforce uniqueness so future writes upsert cleanly
ALTER TABLE public.anime_cache
  ADD CONSTRAINT anime_cache_category_unique UNIQUE (category);