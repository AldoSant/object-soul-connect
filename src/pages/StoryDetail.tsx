import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StoryTimeline from '@/components/StoryTimeline';
import RecordForm from '@/components/RecordForm';
import CommentForm from '@/components/CommentForm';
import CommentsList from '@/components/CommentsList';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MediaFile, Location, RecordType, StoryType, jsonToLocation, jsonToMediaFiles } from '@/types';
import { Globe, Lock, MapPin, Clock, Tag as TagIcon, Plus, FileDown, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

import { Json } from '@/integrations/supabase/types';

interface TimelineRecord {
  id: string;
  date: string;
  title: string;
  description: string;
  isPublic: boolean;
  location?: Location;
  mediaFiles?: MediaFile[];
}

const StoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [story, setStory] = useState<any>(null);
  const [records, setRecords] = useState<RecordType[]>([]);
  const [timelineRecords, setTimelineRecords] = useState<TimelineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRecordForm, setShowNewRecordForm] = useState(false);
  const [refreshComments, setRefreshComments] = useState(0);
  
  const isOwner = useMemo(() => {
    return user && story?.user_id === user.id;
  }, [user, story]);
  
  useEffect(() => {
    if (id) loadStory(id);
  }, [id]);
  
  const loadStory = async (storyId: string) => {
    setLoading(true);
    try {
      const { data: storyData, error: storyError } = await supabase
        .from('objects')
        .select('*')
        .eq('id', storyId)
        .single();
      
      if (storyError) throw storyError;
      
      const { data: recordsData, error: recordsError } = await supabase
        .from('records')
        .select('*')
        .eq('object_id', storyId)
        .order('created_at', { ascending: false });
      
      if (recordsError) throw recordsError;
      
      setStory({
        ...storyData,
        location: jsonToLocation(storyData.location)
      });
      
      const processedRecords = recordsData.map(record => ({
        ...record,
        story_id: record.object_id,
        location: jsonToLocation(record.location),
        media_files: jsonToMediaFiles(record.media_files)
      }));
      
      setRecords(processedRecords);
      
      const timeline = processedRecords.map(record => ({
        id: record.id,
        date: format(new Date(record.created_at), 'dd/MM/yyyy HH:mm'),
        title: record.title,
        description: record.description || '',
        isPublic: record.is_public || false,
        location: record.location,
        mediaFiles: record.media_files
      }));
      
      setTimelineRecords(timeline);
    } catch (error) {
      console.error('Error loading story:', error);
      toast({
        title: "Erro ao carregar história",
        description: "Não foi possível buscar os detalhes da história.",
        variant: "destructive"
      });
      navigate('/explore');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddRecord = async (record: {
    title: string;
    description: string;
    isPublic: boolean;
    location: Location | null;
    mediaFiles: MediaFile[];
  }) => {
    try {
      const { data, error } = await supabase
        .from('records')
        .insert({
          object_id: id,
          title: record.title,
          description: record.description,
          is_public: record.isPublic,
          location: record.location as unknown as Json,
          media_files: record.mediaFiles as unknown as Json
        })
        .select();
      
      if (error) throw error;
      
      if (data) {
        const newRecord = {
          ...data[0],
          story_id: data[0].object_id,
          location: jsonToLocation(data[0].location),
          media_files: jsonToMediaFiles(data[0].media_files)
        };
        
        setRecords([newRecord, ...records]);
        
        const newTimelineRecord = {
          id: newRecord.id,
          date: format(new Date(newRecord.created_at), 'dd/MM/yyyy HH:mm'),
          title: newRecord.title,
          description: newRecord.description || '',
          isPublic: newRecord.is_public || false,
          location: newRecord.location,
          mediaFiles: newRecord.media_files
        };
        
        setTimelineRecords([newTimelineRecord, ...timelineRecords]);
      }
      
      setShowNewRecordForm(false);
      
      toast({
        title: "Registro adicionado",
        description: "Seu novo registro foi adicionado com sucesso à timeline.",
      });
    } catch (error) {
      console.error('Error adding record:', error);
      toast({
        title: "Erro ao adicionar registro",
        description: "Não foi possível salvar o registro. Por favor, tente novamente.",
        variant: "destructive"
      });
    }
  };

  const generatePDF = () => {
    try {
      if (!story) return;

      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.setTextColor(33, 33, 33);
      doc.text(story.name, 20, 20);
      
      if (story.story_type) {
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        const storyTypeText = `Tipo: ${getStoryTypeLabel(story.story_type as StoryType)}`;
        doc.text(storyTypeText, 20, 30);
      }
      
      if (story.description) {
        doc.setFontSize(12);
        doc.setTextColor(33, 33, 33);
        const splitDescription = doc.splitTextToSize(story.description, 170);
        doc.text(splitDescription, 20, 40);
      }
      
      if (story.location) {
        const locationParts = [
          story.location.city,
          story.location.state,
          story.location.country
        ].filter(Boolean);
        
        if (locationParts.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(100, 100, 100);
          doc.text(`Localização: ${locationParts.join(', ')}`, 20, 60);
        }
      }
      
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.text('Timeline', 20, 80);
      
      if (timelineRecords.length > 0) {
        const tableData = timelineRecords.map(record => [
          record.date,
          record.title,
          record.description.substring(0, 60) + (record.description.length > 60 ? '...' : ''),
          record.location ? [
            record.location.city,
            record.location.state,
            record.location.country
          ].filter(Boolean).join(', ') : ''
        ]);
        
        (doc as any).autoTable({
          startY: 85,
          head: [['Data', 'Título', 'Descrição', 'Localização']],
          body: tableData,
          styles: { fontSize: 10 },
          headStyles: { fillColor: [41, 128, 185] },
          alternateRowStyles: { fillColor: [240, 240, 240] }
        });
      } else {
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('Nenhum registro encontrado para esta história.', 20, 90);
      }
      
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(10);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Gerado por ConnectOS - A Alma Digital das Coisas em ${format(new Date(), 'dd/MM/yyyy')}`,
          20,
          doc.internal.pageSize.height - 10
        );
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.width - 40,
          doc.internal.pageSize.height - 10
        );
      }
      
      doc.save(`historia-${story.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      
      toast({
        title: "PDF gerado com sucesso",
        description: "O arquivo PDF da história foi gerado e baixado.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o arquivo PDF. Por favor, tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  const getStoryTypeLabel = (type: StoryType): string => {
    const labels: Record<StoryType, string> = {
      'objeto': 'Objeto',
      'pessoa': 'Pessoa',
      'espaço': 'Espaço',
      'evento': 'Evento',
      'outro': 'Outro'
    };
    return labels[type] || type;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-8">
          <div className="container max-w-4xl">
            <Skeleton className="h-12 w-[200px] mb-4" />
            <Skeleton className="h-4 w-[100px] mb-8" />
            <Skeleton className="h-[200px] w-full mb-8" />
            <Skeleton className="h-8 w-[150px] mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!story) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-16">
          <div className="container text-center">
            <h1 className="text-2xl font-bold mb-4">História não encontrada</h1>
            <p className="mb-8">A história que você está procurando não existe ou foi removida.</p>
            <Button onClick={() => navigate('/explore')}>
              Explorar histórias
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const handleCommentAdded = () => {
    setRefreshComments(prev => prev + 1);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {story.cover_image && (
          <div className="relative h-[300px] overflow-hidden">
            <img 
              src={story.cover_image} 
              alt={story.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{story.name}</h1>
              <div className="flex flex-wrap gap-2 items-center">
                {story.story_type && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <TagIcon size={10} />
                    <span>{getStoryTypeLabel(story.story_type as StoryType)}</span>
                  </Badge>
                )}
                
                {story.is_public ? (
                  <Badge variant="outline" className="flex items-center gap-1 bg-white/20 text-white border-white/40">
                    <Globe size={10} />
                    <span>Público</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1 bg-white/20 text-white border-white/40">
                    <Lock size={10} />
                    <span>Privado</span>
                  </Badge>
                )}
                
                <div className="flex items-center gap-1 text-sm text-white/80">
                  <Clock size={12} />
                  <span>Criado em {format(new Date(story.created_at), 'dd/MM/yyyy')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="container max-w-4xl py-8">
          {!story.cover_image && (
            <div className="mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{story.name}</h1>
                  <div className="flex flex-wrap gap-2 items-center mb-4">
                    {story.story_type && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <TagIcon size={10} />
                        <span>{getStoryTypeLabel(story.story_type as StoryType)}</span>
                      </Badge>
                    )}
                    
                    {story.is_public ? (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Globe size={10} />
                        <span>Público</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Lock size={10} />
                        <span>Privado</span>
                      </Badge>
                    )}
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock size={12} />
                      <span>Criado em {format(new Date(story.created_at), 'dd/MM/yyyy')}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={generatePDF}
                >
                  <FileDown size={14} />
                  <span>PDF</span>
                </Button>
              </div>
            </div>
          )}
          
          <div className="mb-8">
            {story.description && (
              <p className="text-muted-foreground mb-4">{story.description}</p>
            )}
            
            {story.location && (story.location.city || story.location.state || story.location.country) && (
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <MapPin size={14} className="mr-1" />
                <span>
                  {[story.location.city, story.location.state, story.location.country]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
            )}
          </div>
          
          <Tabs defaultValue="timeline">
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="comments">Comentários</TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2">
                {story.cover_image && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={generatePDF}
                  >
                    <FileDown size={14} />
                    <span>PDF</span>
                  </Button>
                )}
                
                {isOwner && (
                  <Button 
                    className="bg-connectos-400 hover:bg-connectos-500"
                    onClick={() => setShowNewRecordForm(!showNewRecordForm)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar registro
                  </Button>
                )}
              </div>
            </div>
            
            {showNewRecordForm && (
              <div className="mb-8">
                <RecordForm 
                  onSubmit={handleAddRecord} 
                  onCancel={() => setShowNewRecordForm(false)} 
                />
              </div>
            )}
            
            <TabsContent value="timeline">
              <StoryTimeline 
                records={timelineRecords} 
                onAddRecord={() => setShowNewRecordForm(true)} 
              />
            </TabsContent>
            
            <TabsContent value="comments">
              <div className="space-y-8">
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-connectos-500" />
                    Deixar um comentário
                  </h3>
                  <CommentForm storyId={id!} onSuccess={handleCommentAdded} />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Comentários</h3>
                  <CommentsList storyId={id!} refreshTrigger={refreshComments} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StoryDetail;
