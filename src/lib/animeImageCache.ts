export interface AnimeInfo {
  image: string | null;
  title: string | null;
}

const imageCache: Record<string, AnimeInfo> = {};

export const getImageCache = () => imageCache;

export const fetchAnimeImage = async (name: string): Promise<AnimeInfo> => {
  const key = name.toLowerCase().trim();
  if (key in imageCache) return imageCache[key];
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(name)}&limit=3&sfw=true`);
    if (!res.ok) { imageCache[key] = { image: null, title: null }; return { image: null, title: null }; }
    const json = await res.json();
    const results = json?.data || [];
    const match = results.find((r: any) => {
      const t = (r.title || '').toLowerCase();
      const tEn = (r.title_english || '').toLowerCase();
      return t.includes(key) || key.includes(t.split(' ')[0]) || tEn.includes(key) || key.includes(tEn.split(' ')[0]);
    }) || results[0];
    
    if (match && results.length > 0) {
      const img = match.images?.jpg?.small_image_url || match.images?.jpg?.image_url || null;
      const result = { image: img, title: match.title_english || match.title || null };
      imageCache[key] = result;
      return result;
    }
    imageCache[key] = { image: null, title: null };
    return { image: null, title: null };
  } catch {
    imageCache[key] = { image: null, title: null };
    return { image: null, title: null };
  }
};
