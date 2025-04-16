
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FollowSuggestions from '@/components/FollowSuggestions';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, HomeIcon } from 'lucide-react';
import { useFeedContent } from '@/hooks/useFeedContent';
import { ContentTabPanel } from '@/components/home/ContentTabPanel';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('following');
  const [refreshKey, setRefreshKey] = useState(0);
  
  const {
    loading,
    stories,
    myStories
  } = useFeedContent(user, navigate, toast, refreshKey);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <HomeIcon className="h-6 w-6 text-connectos-500" />
              Início
            </h1>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-1"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Atualizar</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Tabs 
                defaultValue="following" 
                className="w-full"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="following">Seguindo</TabsTrigger>
                  <TabsTrigger value="mystories">Minhas Histórias</TabsTrigger>
                </TabsList>
                
                <TabsContent value="following">
                  <ContentTabPanel 
                    loading={loading && activeTab === "following"}
                    stories={stories}
                    emptyActionRoute="/explore"
                    emptyActionLabel="Explorar histórias"
                    emptyTitle="Seu feed está vazio"
                    emptyDescription="Comece seguindo outros usuários para ver suas histórias aqui."
                  />
                </TabsContent>
                
                <TabsContent value="mystories">
                  <ContentTabPanel 
                    loading={loading && activeTab === "mystories"}
                    stories={myStories}
                    emptyActionRoute="/story/new"
                    emptyActionLabel="Criar história"
                    emptyTitle="Você ainda não criou histórias"
                    emptyDescription="Crie sua primeira história para começar a registrar suas memórias digitais."
                    isOwnStories={true}
                  />
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="order-first md:order-last mb-6 md:mb-0">
              <FollowSuggestions onFollow={handleRefresh} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
