
import React from 'react';
import StoryCard from '@/components/StoryCard';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyFeedState from '@/components/EmptyFeedState';

interface FeedStoriesListProps {
  loading: boolean;
  stories: any[];
}

const FeedStoriesList: React.FC<FeedStoriesListProps> = ({ loading, stories }) => {
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
    return <EmptyFeedState />;
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
