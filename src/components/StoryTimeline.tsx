import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Lock, Globe, MapPin } from 'lucide-react';
import MediaDisplay from './MediaDisplay';
import { MediaFile, Location } from '@/types';

interface TimelineRecord {
  id: string;
  date: string;
  title: string;
  description: string;
  isPublic: boolean;
  location?: Location;
  mediaFiles?: MediaFile[];
}

interface StoryTimelineProps {
  records: TimelineRecord[];
  onAddRecord: () => void;
}

const StoryTimeline: React.FC<StoryTimelineProps> = ({ records, onAddRecord }) => {
  return (
    <div className="container max-w-4xl py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Timeline</h2>
        <Button onClick={onAddRecord} className="bg-connectos-400 hover:bg-connectos-500">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar registro
        </Button>
      </div>
      
      <div className="relative pl-4">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
        
        {records.length > 0 ? (
          records.map((record) => (
            <div key={record.id} className="mb-8 relative">
              <div className="absolute left-0 top-3 w-3 h-3 bg-connectos-400 rounded-full -translate-x-1.5"></div>
              <Card className="ml-6 p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{record.title}</h3>
                  {record.isPublic ? (
                    <Globe size={16} className="text-gray-400" />
                  ) : (
                    <Lock size={16} className="text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{record.date}</p>
                
                {record.location && (
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <MapPin size={14} className="mr-1" />
                    <span>
                      {[
                        record.location.city, 
                        record.location.state, 
                        record.location.country
                      ].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                
                <p className="text-gray-700 dark:text-gray-300">{record.description}</p>
                
                {record.mediaFiles && record.mediaFiles.length > 0 && (
                  <MediaDisplay media={record.mediaFiles} />
                )}
              </Card>
            </div>
          ))
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Nenhum registro encontrado para esta história.</p>
            <Button onClick={onAddRecord} className="bg-connectos-400 hover:bg-connectos-500">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar o primeiro registro
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StoryTimeline;
