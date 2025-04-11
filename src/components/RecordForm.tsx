
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { X } from 'lucide-react';
import MediaUpload from './MediaUpload';

interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'audio' | 'video';
  name: string;
  file?: File;
  preview?: string;
  uploading?: boolean;
  uploaded?: boolean;
}

interface RecordFormProps {
  onSubmit: (record: { 
    title: string; 
    description: string; 
    isPublic: boolean;
    mediaFiles: MediaFile[];
  }) => void;
  onCancel: () => void;
}

const RecordForm: React.FC<RecordFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if all files are uploaded
    if (mediaFiles.some(file => file.uploaded === false && file.file)) {
      alert("Por favor, envie todos os arquivos antes de salvar o registro.");
      return;
    }
    
    setIsSubmitting(true);
    
    // Clean up media files to only include necessary data
    const cleanMediaFiles = mediaFiles.map(({ id, url, type, name }) => ({
      id, url, type, name
    }));
    
    onSubmit({ 
      title, 
      description, 
      isPublic,
      mediaFiles: cleanMediaFiles
    });
    
    setIsSubmitting(false);
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Adicionar novo registro</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              placeholder="Título do registro"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              required 
              placeholder="Escreva os detalhes do registro..." 
              rows={4}
            />
          </div>
          
          <MediaUpload
            mediaFiles={mediaFiles}
            onChange={setMediaFiles}
          />
          
          <div className="flex items-center justify-between">
            <Label htmlFor="isPublic" className="cursor-pointer">Visibilidade pública</Label>
            <Switch 
              id="isPublic" 
              checked={isPublic} 
              onCheckedChange={setIsPublic}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button 
              type="submit" 
              className="bg-connectos-400 hover:bg-connectos-500"
              disabled={isSubmitting || !title}
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default RecordForm;
