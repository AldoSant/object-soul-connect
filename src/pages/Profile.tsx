
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import UserStats from '@/components/UserStats';
import UserStories from '@/components/UserStories';
import UserComments from '@/components/UserComments';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // If no ID is provided, use the current user's ID
        const userId = id || user?.id;
        
        if (!userId) {
          navigate('/auth');
          return;
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (error) throw error;
        
        setProfile(data);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [id, user, navigate]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container max-w-4xl py-8">
          <ProfileSkeleton />
        </div>
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <Navbar />
        <div className="container max-w-4xl py-8">
          <Card>
            <CardHeader>
              <CardTitle>Erro</CardTitle>
              <CardDescription>
                Não foi possível carregar o perfil. {error || 'Perfil não encontrado.'}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </>
    );
  }

  const isOwnProfile = user?.id === profile.id;

  return (
    <>
      <Navbar />
      <div className="container max-w-4xl py-8">
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-xl bg-connectos-100 text-connectos-700">
                {profile.full_name?.[0] || profile.username?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{profile.full_name || profile.username || 'Usuário'}</CardTitle>
              <CardDescription>
                {isOwnProfile ? 'Seu perfil' : 'Perfil de usuário'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <UserStats userId={profile.id} />
          </CardContent>
        </Card>

        <Tabs defaultValue="stories" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stories">Histórias</TabsTrigger>
            <TabsTrigger value="comments">Comentários</TabsTrigger>
          </TabsList>
          <TabsContent value="stories" className="mt-4">
            <UserStories userId={profile.id} isOwnProfile={isOwnProfile} />
          </TabsContent>
          <TabsContent value="comments" className="mt-4">
            <UserComments userId={profile.id} isOwnProfile={isOwnProfile} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

// Skeleton loader for the profile page
const ProfileSkeleton = () => (
  <>
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Skeleton className="h-16 w-full" />
        </div>
      </CardContent>
    </Card>
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  </>
);

export default Profile;
