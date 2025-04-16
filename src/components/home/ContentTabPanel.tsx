
import React from 'react';
import { useNavigate } from 'react-router-dom';
import StoryCard from '@/components/StoryCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Users, User } from 'lucide-react';

interface ContentTabPanelProps {
  loading: boolean;
  stories: any[];
  emptyActionRoute: string;
  emptyActionLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  isOwnStories?: boolean;
}

export const ContentTabPanel: React.FC<ContentTabPanelProps> = ({
  loading,
  stories,
  emptyActionRoute,
  emptyActionLabel,
  emptyTitle,
  emptyDescription,
  isOwnStories = false
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[200px] w-full" />
        ))}
      </div>
    );
  }
  
  if (stories.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border">
        {isOwnStories ? (
          <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        ) : (
          <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        )}
        <h3 className="text-lg font-medium mb-2">{emptyTitle}</h3>
        <p className="text-muted-foreground mb-4">
          {emptyDescription}
        </p>
        <Button 
          variant="default" 
          onClick={() => navigate(emptyActionRoute)}
          className="bg-connectos-400 hover:bg-connectos-500"
        >
          {emptyActionLabel}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {stories.map((story) => (
        <StoryCard
          key={story.id}
          id={story.id}
          name={story.name}
          description={story.description || ''}
          lastUpdated={story.lastUpdated}
          isPublic={story.is_public}
          recordCount={story.recordCount}
          storyType={story.story_type}
          location={story.location}
          thumbnailUrl={story.thumbnail}
          authorName={story.authorName}
          authorAvatar={story.authorAvatar}
          authorId={story.authorId}
          isOwnStory={story.isOwnStory}
        />
      ))}
    </div>
  );
};
