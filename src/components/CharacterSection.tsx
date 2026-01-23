import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Character {
  character: {
    mal_id: number;
    name: string;
    images: {
      jpg: {
        image_url: string;
      };
    };
  };
  role: string;
  voice_actors?: {
    person: {
      name: string;
    };
    language: string;
  }[];
}

interface CharacterSectionProps {
  animeId: number;
}

const JIKAN_API = 'https://api.jikan.moe/v4';

const CharacterSection = ({ animeId }: CharacterSectionProps) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const fetchCharacters = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
        const response = await fetch(`${JIKAN_API}/anime/${animeId}/characters`);
        const json = await response.json();
        setCharacters(json.data?.slice(0, 20) || []);
      } catch (error) {
        console.error('Error fetching characters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacters();
  }, [animeId]);

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('characters-container');
    if (!container) return;
    
    const scrollAmount = direction === 'left' ? -300 : 300;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setScrollPosition(container.scrollLeft + scrollAmount);
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 border border-white/5"
      >
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          Characters
        </h2>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-32 h-48 rounded-xl bg-muted animate-pulse"
            />
          ))}
        </div>
      </motion.div>
    );
  }

  if (characters.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-2xl p-6 border border-white/5"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          Characters
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            className="rounded-full border-white/10 hover:bg-white/5"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            className="rounded-full border-white/10 hover:bg-white/5"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        id="characters-container"
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {characters.map((char, index) => {
          const japaneseVA = char.voice_actors?.find(va => va.language === 'Japanese');
          
          return (
            <motion.div
              key={char.character.mal_id}
              className="flex-shrink-0 w-32 group cursor-pointer"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-2">
                <img
                  src={char.character.images.jpg.image_url}
                  alt={char.character.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Role Badge */}
                <Badge 
                  className={`absolute top-2 right-2 text-[10px] ${
                    char.role === 'Main' 
                      ? 'bg-primary/80' 
                      : 'bg-secondary/80'
                  }`}
                >
                  {char.role}
                </Badge>

                {/* Hover Overlay */}
                <motion.div 
                  className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ opacity: 0 }}
                />
              </div>
              
              <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {char.character.name}
              </p>
              {japaneseVA && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  CV: {japaneseVA.person.name}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default CharacterSection;
