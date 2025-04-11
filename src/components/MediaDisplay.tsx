
import React from 'react';
import { File, FileAudio, FileVideo, Image as ImageIcon } from 'lucide-react';

interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'audio' | 'video';
  name: string;
}

interface MediaDisplayProps {
  media: MediaFile[];
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({ media }) => {
  if (!media || media.length === 0) return null;
  
  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {media.map((item) => (
          <div key={item.id} className="border rounded overflow-hidden">
            {item.type === 'image' && (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="block h-32">
                <img 
                  src={item.url} 
                  alt={item.name} 
                  className="w-full h-full object-cover" 
                />
              </a>
            )}
            
            {item.type === 'audio' && (
              <div className="p-2">
                <div className="flex items-center justify-center h-20 mb-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <FileAudio className="h-8 w-8 text-connectos-400" />
                </div>
                <audio controls className="w-full h-8">
                  <source src={item.url} type="audio/mpeg" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            )}
            
            {item.type === 'video' && (
              <div className="p-2">
                <video controls className="w-full h-full">
                  <source src={item.url} type="video/mp4" />
                  Seu navegador não suporta o elemento de vídeo.
                </video>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaDisplay;
