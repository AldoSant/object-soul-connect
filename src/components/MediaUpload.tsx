
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Image, Paperclip, X, FileAudio, FileVideo } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'audio' | 'video';
  file?: File;
  name: string;
  preview?: string;
  uploading?: boolean;
  uploaded?: boolean;
}

interface MediaUploadProps {
  mediaFiles: MediaFile[];
  onChange: (files: MediaFile[]) => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ mediaFiles, onChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newFiles: MediaFile[] = [];
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const type = file.type.startsWith('image/') 
        ? 'image' 
        : file.type.startsWith('audio/') 
          ? 'audio' 
          : file.type.startsWith('video/') 
            ? 'video' 
            : null;
            
      if (!type) continue;
      
      const id = uuidv4();
      let preview: string | undefined;
      
      if (type === 'image') {
        preview = URL.createObjectURL(file);
      }
      
      newFiles.push({
        id,
        url: '', // Will be set after upload
        type,
        file,
        name: file.name,
        preview,
        uploading: false,
        uploaded: false
      });
    }
    
    onChange([...mediaFiles, ...newFiles]);
    e.target.value = '';
  };
  
  const handleRemoveFile = (id: string) => {
    onChange(mediaFiles.filter(file => file.id !== id));
  };
  
  const uploadFiles = async () => {
    const filesToUpload = mediaFiles.filter(f => f.file && !f.uploaded);
    if (filesToUpload.length === 0) return;
    
    setIsUploading(true);
    
    const updatedFiles = [...mediaFiles];
    
    for (const fileIndex in filesToUpload) {
      const file = filesToUpload[fileIndex];
      const index = mediaFiles.findIndex(f => f.id === file.id);
      
      if (index !== -1) {
        // Mark as uploading
        updatedFiles[index].uploading = true;
        onChange(updatedFiles);
        
        // Upload to Supabase Storage
        const actualFile = file.file;
        if (!actualFile) continue;
        
        const fileExt = actualFile.name.split('.').pop();
        const filePath = `${file.id}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('media')
          .upload(filePath, actualFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error('Error uploading file:', error);
          continue;
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);
        
        // Update file in state
        updatedFiles[index].url = publicUrl;
        updatedFiles[index].uploading = false;
        updatedFiles[index].uploaded = true;
        
        // Remove the file object to save memory
        delete updatedFiles[index].file;
        if (updatedFiles[index].preview) {
          URL.revokeObjectURL(updatedFiles[index].preview);
          delete updatedFiles[index].preview;
        }
        
        onChange(updatedFiles);
      }
    }
    
    setIsUploading(false);
  };
  
  return (
    <div className="space-y-4">
      <Label className="block">Adicionar mídia</Label>
      
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center"
          onClick={() => document.getElementById('image-upload')?.click()}
        >
          <Image className="mr-2 h-4 w-4" />
          Imagem
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center"
          onClick={() => document.getElementById('audio-upload')?.click()}
        >
          <FileAudio className="mr-2 h-4 w-4" />
          Áudio
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center"
          onClick={() => document.getElementById('video-upload')?.click()}
        >
          <FileVideo className="mr-2 h-4 w-4" />
          Vídeo
        </Button>
        
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          multiple
        />
        
        <input
          id="audio-upload"
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleFileChange}
          multiple
        />
        
        <input
          id="video-upload"
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileChange}
          multiple
        />
      </div>
      
      {mediaFiles.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
            {mediaFiles.map((file) => (
              <div key={file.id} className="relative border rounded-md p-2 h-32 flex flex-col">
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm"
                  onClick={() => handleRemoveFile(file.id)}
                >
                  <X className="h-3 w-3" />
                </button>
                
                <div className="flex-1 flex items-center justify-center overflow-hidden">
                  {file.type === 'image' && file.preview && (
                    <img src={file.preview} alt={file.name} className="max-h-full max-w-full object-contain" />
                  )}
                  
                  {file.type === 'image' && file.url && !file.preview && (
                    <img src={file.url} alt={file.name} className="max-h-full max-w-full object-contain" />
                  )}
                  
                  {file.type === 'audio' && (
                    <FileAudio className="h-10 w-10 text-connectos-300" />
                  )}
                  
                  {file.type === 'video' && (
                    <FileVideo className="h-10 w-10 text-connectos-300" />
                  )}
                </div>
                
                <div className="text-xs text-center mt-1 text-gray-500 truncate" title={file.name}>
                  {file.uploading ? 'Enviando...' : file.name}
                </div>
              </div>
            ))}
          </div>
          
          {mediaFiles.some(f => f.file && !f.uploaded) && (
            <Button
              type="button"
              variant="secondary"
              onClick={uploadFiles}
              disabled={isUploading}
              className="w-full"
            >
              <Paperclip className="mr-2 h-4 w-4" />
              {isUploading ? 'Enviando mídia...' : 'Enviar todos os arquivos'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaUpload;
