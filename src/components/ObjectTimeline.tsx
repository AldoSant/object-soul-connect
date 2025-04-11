import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Lock, Globe } from 'lucide-react';
import MediaDisplay from './MediaDisplay';
import { MediaFile } from './MediaUpload';

interface TimelineRecord {
  id: string;
  date: string;
  title: string;
  description: string;
  isPublic: boolean;
  mediaFiles?: MediaFile[];
}

interface ObjectTimelineProps {
  records: TimelineRecord[];
  onAddRecord: () => void;
}

const ObjectTimeline: React.FC<ObjectTimelineProps> = ({ records, onAddRecord }) => {
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
        <div className="timeline-line"></div>
        
        {records.length > 0 ? (
          records.map((record) => (
            <div key={record.id} className="timeline-card">
              <div className="timeline-dot"></div>
              <div className="record-card">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{record.title}</h3>
                  {record.isPublic ? (
                    <Globe size={16} className="text-gray-400" />
                  ) : (
                    <Lock size={16} className="text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{record.date}</p>
                <p className="text-gray-700 dark:text-gray-300">{record.description}</p>
                
                {record.mediaFiles && record.mediaFiles.length > 0 && (
                  <MediaDisplay media={record.mediaFiles} />
                )}
              </div>
            </div>
          ))
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Nenhum registro encontrado para este objeto.</p>
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

export default ObjectTimeline;
