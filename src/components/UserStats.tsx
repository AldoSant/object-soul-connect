
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, MessageSquare, BookOpen, Star } from 'lucide-react';

interface UserStatsProps {
  userId: string;
}

// Engagement levels configuration
const ENGAGEMENT_LEVELS = [
  { level: 1, name: "Iniciante", minPoints: 0, maxPoints: 50 },
  { level: 2, name: "Explorador", minPoints: 51, maxPoints: 150 },
  { level: 3, name: "Contador", minPoints: 151, maxPoints: 300 },
  { level: 4, name: "Narrador", minPoints: 301, maxPoints: 500 },
  { level: 5, name: "Historiador", minPoints: 501, maxPoints: 750 },
  { level: 6, name: "Mestre", minPoints: 751, maxPoints: 1000 },
  { level: 7, name: "Lendário", minPoints: 1001, maxPoints: Infinity }
];

// Get level based on points
const getLevelInfo = (points: number) => {
  const level = ENGAGEMENT_LEVELS.find(
    level => points >= level.minPoints && points <= level.maxPoints
  ) || ENGAGEMENT_LEVELS[0];
  
  const nextLevel = ENGAGEMENT_LEVELS.find(l => l.level === level.level + 1);
  const progress = nextLevel 
    ? ((points - level.minPoints) / (nextLevel.minPoints - level.minPoints)) * 100
    : 100;
  
  return {
    ...level,
    progress: Math.min(Math.max(progress, 0), 100),
    pointsToNextLevel: nextLevel ? nextLevel.minPoints - points : 0
  };
};

const UserStats: React.FC<UserStatsProps> = ({ userId }) => {
  const [storiesCount, setStoriesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [engagementPoints, setEngagementPoints] = useState(0);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch stories count
        const { count: storiesCount, error: storiesError } = await supabase
          .from('objects')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        if (storiesError) throw storiesError;
        
        // Fetch comments count
        const { count: commentsCount, error: commentsError } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        if (commentsError) throw commentsError;
        
        // Calculate engagement points
        // Stories are worth 10 points each, comments are worth 2 points each
        const points = (storiesCount || 0) * 10 + (commentsCount || 0) * 2;
        
        setStoriesCount(storiesCount || 0);
        setCommentsCount(commentsCount || 0);
        setEngagementPoints(points);
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchStats();
    }
  }, [userId]);
  
  const levelInfo = getLevelInfo(engagementPoints);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          icon={<BookOpen className="h-5 w-5 text-connectos-500" />}
          label="Histórias"
          value={loading ? '-' : storiesCount.toString()}
        />
        <StatCard 
          icon={<MessageSquare className="h-5 w-5 text-connectos-500" />}
          label="Comentários"
          value={loading ? '-' : commentsCount.toString()}
        />
        <StatCard 
          icon={<Star className="h-5 w-5 text-yellow-500" />}
          label="Pontos de Engajamento"
          value={loading ? '-' : engagementPoints.toString()}
        />
      </div>
      
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center mb-2">
          <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
          <div className="font-medium">Nível {levelInfo.level}: {levelInfo.name}</div>
        </div>
        
        <Progress value={levelInfo.progress} className="h-2 mb-2" />
        
        {levelInfo.level < ENGAGEMENT_LEVELS.length && (
          <div className="text-sm text-gray-500">
            Faltam {levelInfo.pointsToNextLevel} pontos para o próximo nível
          </div>
        )}
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => {
  return (
    <Card className="flex items-center p-4">
      <div className="mr-3">{icon}</div>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-xl font-semibold">{value}</div>
      </div>
    </Card>
  );
};

export default UserStats;
