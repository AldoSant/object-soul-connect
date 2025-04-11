
import { Json } from "@/integrations/supabase/types";

export interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'audio' | 'video';
  name: string;
  file?: File;
  preview?: string;
  uploading?: boolean;
  uploaded?: boolean;
}

export interface Location {
  city?: string;
  state?: string;
  country?: string;
}

export type StoryType = 'objeto' | 'pessoa' | 'espaço' | 'evento' | 'outro';

export interface Story {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  location: Location | null;
  story_type: StoryType | null;
  cover_image: string | null;
  thumbnail: string | null;
  recordCount?: number; // Add this property for the Explore page
}

// Rename from Record to RecordType to avoid collision with JavaScript's Record type
export interface RecordType {
  id: string;
  story_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  location: Location | null;
  media_files: MediaFile[] | null;
}

// Helper to safely convert Json to Location
export const jsonToLocation = (json: Json | null): Location | null => {
  if (!json) return null;
  
  try {
    if (typeof json === 'string') {
      return JSON.parse(json) as Location;
    } else if (typeof json === 'object') {
      return json as unknown as Location;
    }
  } catch (e) {
    console.error('Error parsing location JSON:', e);
  }
  
  return null;
};

// Helper to safely convert Json to MediaFile[]
export const jsonToMediaFiles = (json: Json | null): MediaFile[] | null => {
  if (!json) return null;
  
  try {
    if (typeof json === 'string') {
      return JSON.parse(json) as MediaFile[];
    } else if (Array.isArray(json)) {
      return json as unknown as MediaFile[];
    }
  } catch (e) {
    console.error('Error parsing media files JSON:', e);
  }
  
  return null;
};
