
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Lock } from 'lucide-react';

interface ObjectCardProps {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
  isPublic: boolean;
  recordCount: number;
}

const ObjectCard: React.FC<ObjectCardProps> = ({
  id,
  name,
  description,
  lastUpdated,
  isPublic,
  recordCount
}) => {
  return (
    <Link to={`/object/${id}`}>
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
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
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between text-xs text-muted-foreground">
          <span>Último registro: {lastUpdated}</span>
          <span>{recordCount} registros</span>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ObjectCard;
