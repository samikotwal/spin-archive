import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Star, Calendar, Clock, Film, Tv, Users, 
  Heart, Play, Share2, BookOpen, Award, TrendingUp,
  ChevronDown, ChevronUp, ExternalLink, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FloatingParticles from '@/components/FloatingParticles';
import RelatedAnime from '@/components/RelatedAnime';
import { useLenis } from '@/hooks/useLenis';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { toast } from 'sonner';

interface AnimeDetail {
  mal_id: number;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  images: {
    jpg: {
      large_image_url: string;
    };
  };
  trailer?: {
    youtube_id?: string;
    embed_url?: string;
  };
  synopsis: string;
  background: string | null;
  score: number;
  scored_by: number;
  rank: number;
  popularity: number;
  members: number;
  favorites: number;
  type: string;
  episodes: number | null;
  status: string;
  duration: string;
  rating: string;
  source: string;
  season: string | null;
  year: number | null;
  studios: { name: string }[];
  genres: { name: string }[];
  themes: { name: string }[];
  demographics: { name: string }[];
  aired: {
    from: string;
    to: string | null;
    string: string;
  };
}

const JIKAN_API = 'https://api.jikan.moe/v4';

const AnimeDetail = () => {
  useLenis();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  const isInFavorites = anime ? isFavorite(anime.mal_id) : false;

  useEffect(() => {
    const fetchAnimeDetail = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`${JIKAN_API}/anime/${id}/full`);
        const json = await response.json();
        setAnime(json.data);
      } catch (error) {
        console.error('Error fetching anime details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnimeDetail();
  }, [id]);

  const handleFavoriteClick = async () => {
    if (!user) {
      toast.error('Please login to add favorites');
      return;
    }
    if (!anime) return;

    await toggleFavorite({
      mal_id: anime.mal_id,
      title: anime.title,
      image_url: anime.images.jpg.large_image_url,
      score: anime.score,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-muted-foreground">Loading anime details...</p>
        </motion.div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-muted-foreground mb-4">Anime not found</p>
          <Button onClick={() => navigate('/explore')}>Go Back</Button>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <FloatingParticles />

      {/* Hero Section with Background */}
      <div className="relative min-h-[60vh] md:min-h-[70vh]">
        {/* Background Image with Parallax Effect */}
        <motion.div 
          className="absolute inset-0 z-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        >
          <img
            src={anime.images.jpg.large_image_url}
            alt={anime.title}
            className="w-full h-full object-cover blur-sm opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/50" />
        </motion.div>

        {/* Header */}
        <motion.div 
          className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="container mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="bg-background/50 backdrop-blur-md hover:bg-background/70 rounded-full w-12 h-12"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-bold text-foreground">NERO<span className="text-primary">FINDER</span></span>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-4 pt-20 pb-8">
          <motion.div 
            className="flex flex-col md:flex-row gap-8 items-start"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Poster */}
            <motion.div 
              className="flex-shrink-0 mx-auto md:mx-0"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative group">
                <motion.div
                  className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                  style={{
                    background: 'linear-gradient(135deg, hsl(262 83% 58% / 0.5), hsl(338 90% 56% / 0.5))',
                  }}
                />
                <img
                  src={anime.images.jpg.large_image_url}
                  alt={anime.title}
                  className="relative w-64 md:w-80 rounded-2xl shadow-2xl ring-1 ring-white/10"
                />
                
                {/* Play Button Overlay */}
                {anime.trailer?.youtube_id && (
                  <motion.a
                    href={`https://www.youtube.com/watch?v=${anime.trailer.youtube_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center glow-primary">
                      <Play className="w-10 h-10 text-white ml-1" fill="white" />
                    </div>
                  </motion.a>
                )}
              </div>
            </motion.div>

            {/* Info Section */}
            <motion.div className="flex-1 space-y-6" variants={itemVariants}>
              {/* Title */}
              <div>
                <motion.h1 
                  className="text-3xl md:text-5xl font-black text-foreground mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {anime.title}
                </motion.h1>
                {anime.title_english && anime.title_english !== anime.title && (
                  <motion.p 
                    className="text-xl text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {anime.title_english}
                  </motion.p>
                )}
                {anime.title_japanese && (
                  <motion.p 
                    className="text-lg text-muted-foreground/60 mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    {anime.title_japanese}
                  </motion.p>
                )}
              </div>

              {/* Genres */}
              <motion.div 
                className="flex flex-wrap gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {anime.genres.map((genre, index) => (
                  <motion.div
                    key={genre.name}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                  >
                    <Badge 
                      variant="secondary" 
                      className="px-4 py-1.5 text-sm bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 transition-colors cursor-pointer"
                    >
                      {genre.name}
                    </Badge>
                  </motion.div>
                ))}
              </motion.div>

              {/* Stats Row */}
              <motion.div 
                className="flex flex-wrap gap-6 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {anime.score && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
                    <span className="font-bold text-foreground text-lg">{anime.score}</span>
                    <span className="text-muted-foreground">({anime.scored_by?.toLocaleString()} votes)</span>
                  </div>
                )}
                {anime.rank && (
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="font-bold text-foreground">#{anime.rank}</span>
                    <span className="text-muted-foreground">Ranked</span>
                  </div>
                )}
                {anime.popularity && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    <span className="font-bold text-foreground">#{anime.popularity}</span>
                    <span className="text-muted-foreground">Popularity</span>
                  </div>
                )}
              </motion.div>

              {/* Quick Info */}
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="glass rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    {anime.type === 'Movie' ? <Film className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
                    <span className="text-xs">Type</span>
                  </div>
                  <p className="font-bold text-foreground">{anime.type}</p>
                </div>
                <div className="glass rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs">Episodes</span>
                  </div>
                  <p className="font-bold text-foreground">{anime.episodes || 'N/A'}</p>
                </div>
                <div className="glass rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Duration</span>
                  </div>
                  <p className="font-bold text-foreground">{anime.duration || 'N/A'}</p>
                </div>
                <div className="glass rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">Aired</span>
                  </div>
                  <p className="font-bold text-foreground text-sm">{anime.year || 'N/A'}</p>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                className="flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Button 
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-full px-8 py-6 text-lg font-bold group"
                >
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="white" />
                  Watch Now
                </Button>
                <Button 
                  variant="outline" 
                  className={`rounded-full px-6 py-6 border-white/10 ${isInFavorites ? 'bg-red-500/20 border-red-500/50 text-red-400' : ''}`}
                  onClick={handleFavoriteClick}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isInFavorites ? 'fill-red-400' : ''}`} />
                  {isInFavorites ? 'In Favorites' : 'Add to Favorites'}
                </Button>
                <Button variant="outline" className="rounded-full px-6 py-6 border-white/10">
                  <Share2 className="w-5 h-5" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Details Section */}
      <motion.div 
        className="container mx-auto px-4 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Synopsis */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              className="glass rounded-2xl p-6 border border-white/5"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                Synopsis
              </h2>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={showFullSynopsis ? 'full' : 'short'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-muted-foreground leading-relaxed"
                >
                  {showFullSynopsis 
                    ? anime.synopsis 
                    : anime.synopsis?.slice(0, 500) + (anime.synopsis?.length > 500 ? '...' : '')
                  }
                </motion.p>
              </AnimatePresence>
              {anime.synopsis?.length > 500 && (
                <Button 
                  variant="ghost" 
                  onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                  className="mt-4 text-primary hover:text-primary/80"
                >
                  {showFullSynopsis ? (
                    <>Show Less <ChevronUp className="w-4 h-4 ml-1" /></>
                  ) : (
                    <>Read More <ChevronDown className="w-4 h-4 ml-1" /></>
                  )}
                </Button>
              )}
            </motion.div>

            {/* Background */}
            {anime.background && (
              <motion.div 
                className="glass rounded-2xl p-6 border border-white/5"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold text-foreground mb-4">Background</h2>
                <p className="text-muted-foreground leading-relaxed">{anime.background}</p>
              </motion.div>
            )}

            {/* Trailer */}
            {anime.trailer?.embed_url && (
              <motion.div 
                className="glass rounded-2xl p-6 border border-white/5"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Play className="w-6 h-6 text-primary" />
                  Trailer
                </h2>
                <div className="aspect-video rounded-xl overflow-hidden">
                  <iframe
                    src={anime.trailer.embed_url}
                    className="w-full h-full"
                    allowFullScreen
                    title={`${anime.title} Trailer`}
                  />
                </div>
              </motion.div>
            )}

            {/* Related Anime */}
            <RelatedAnime animeId={anime.mal_id} genres={anime.genres} />
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div 
              className="glass rounded-2xl p-6 border border-white/5"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-bold text-foreground mb-4">Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" /> Members
                  </span>
                  <span className="font-bold text-foreground">{anime.members?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Heart className="w-4 h-4" /> Favorites
                  </span>
                  <span className="font-bold text-foreground">{anime.favorites?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="border-green-500/50 text-green-400">
                    {anime.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Source</span>
                  <span className="text-foreground">{anime.source}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="text-foreground text-sm">{anime.rating || 'N/A'}</span>
                </div>
              </div>
            </motion.div>

            {/* Studios */}
            {anime.studios.length > 0 && (
              <motion.div 
                className="glass rounded-2xl p-6 border border-white/5"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-lg font-bold text-foreground mb-4">Studios</h3>
                <div className="flex flex-wrap gap-2">
                  {anime.studios.map((studio) => (
                    <Badge 
                      key={studio.name}
                      variant="secondary" 
                      className="bg-secondary/50"
                    >
                      {studio.name}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Themes */}
            {anime.themes.length > 0 && (
              <motion.div 
                className="glass rounded-2xl p-6 border border-white/5"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-lg font-bold text-foreground mb-4">Themes</h3>
                <div className="flex flex-wrap gap-2">
                  {anime.themes.map((theme) => (
                    <Badge 
                      key={theme.name}
                      variant="outline" 
                      className="border-accent/50 text-accent"
                    >
                      {theme.name}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {/* External Links */}
            <motion.div 
              className="glass rounded-2xl p-6 border border-white/5"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-bold text-foreground mb-4">External Links</h3>
              <div className="space-y-2">
                <a 
                  href={`https://myanimelist.net/anime/${anime.mal_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  MyAnimeList
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-bold text-foreground text-sm">NERO FINDER</span>
          </div>
          <p className="text-sm">© 2026 NERO FINDER. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AnimeDetail;
