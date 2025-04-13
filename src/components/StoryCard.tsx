
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Globe, Lock, MapPin, Tag } from 'lucide-react';
import { StoryType } from '@/types';

interface StoryCardProps {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
  isPublic: boolean;
  recordCount: number;
  storyType?: StoryType;
  location?: { city?: string; state?: string; country?: string };
  thumbnailUrl?: string;
  authorName?: string;
  authorAvatar?: string;
}

const storyTypeLabels: Record<StoryType, string> = {
  'objeto': 'Objeto',
  'pessoa': 'Pessoa', 
  'espaço': 'Espaço',
  'evento': 'Evento',
  'outro': 'Outro'
};

const StoryCard: React.FC<StoryCardProps> = ({
  id,
  name,
  description,
  lastUpdated,
  isPublic,
  recordCount,
  storyType = 'objeto',
  location,
  thumbnailUrl,
  authorName,
  authorAvatar
}) => {
  return (
    <Link to={`/story/${id}`}>
      <Card className="h-full hover:shadow-md transition-shadow overflow-hidden">
        {thumbnailUrl && (
          <div className="h-32 overflow-hidden">
            <img 
              src={thumbnailUrl} 
              alt={name} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardContent className={`${thumbnailUrl ? 'pt-4' : 'pt-6'}`}>
          {authorName && (
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="h-6 w-6">
                <AvatarImage src={authorAvatar} />
                <AvatarFallback className="text-xs bg-connectos-100 text-connectos-700">
                  {authorName[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground truncate">{authorName}</span>
            </div>
          )}
          
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
            {isPublic ? (
              <Badge variant="outline" className="flex items-center gap-1">
                <Globe size={12} />
                <span>Público</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1">
                <Lock size={12} />
                <span>Privado</span>
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-2">{description}</p>
          
          <div className="flex flex-wrap gap-2 mt-2 mb-2">
            {storyType && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Tag size={10} />
                <span>{storyTypeLabels[storyType] || storyType}</span>
              </Badge>
            )}
            
            {location && (location.city || location.state || location.country) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin size={10} />
                <span className="truncate max-w-[140px]">
                  {[location.city, location.state, location.country].filter(Boolean).join(', ')}
                </span>
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between text-xs text-muted-foreground">
          <span>Último registro: {lastUpdated}</span>
          <span>{recordCount} registros</span>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default StoryCard;
