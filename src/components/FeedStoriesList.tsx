
import React from 'react';
import StoryCard from '@/components/StoryCard';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyFeedState from '@/components/EmptyFeedState';
import { PlusCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface FeedStoriesListProps {
  loading: boolean;
  stories: any[];
  emptyMessage?: string;
}

const FeedStoriesList: React.FC<FeedStoriesListProps> = ({ 
  loading, 
  stories,
  emptyMessage = "Seu feed está vazio. Siga usuários para ver suas histórias."
}) => {
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
      <div className="text-center py-8">
        <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {emptyMessage}
        </h3>
        <Button asChild className="mt-2 bg-connectos-400 hover:bg-connectos-500">
          <Link to="/story/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar nova história
          </Link>
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

export default FeedStoriesList;
