
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
}

export interface Record {
  id: string;
  story_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  location: Location | null;
  media_files: MediaFile[] | null;
}
