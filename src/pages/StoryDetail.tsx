
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StoryTimeline from '@/components/StoryTimeline';
import RecordForm from '@/components/RecordForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { Edit, Share2, Globe, Lock, Download, MapPin, FileText, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { MediaFile, Story, Record, Location, StoryType } from '@/types';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Map for story type display names
const storyTypeLabels: Record<string, string> = {
  'objeto': 'Objeto',
  'pessoa': 'Pessoa', 
  'espaço': 'Espaço',
  'evento': 'Evento',
  'outro': 'Outro'
};

const StoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [story, setStory] = useState<Story | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    if (id) {
      fetchStoryDetails();
      fetchStoryRecords();
    }
  }, [id]);

  const fetchStoryDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('objects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setStory(data as Story);
      } else {
        toast({
          title: "História não encontrada",
          description: "Não foi possível encontrar a história solicitada.",
          variant: "destructive"
        });
        navigate('/explore');
      }
    } catch (error) {
      console.error('Error fetching story details:', error);
      toast({
        title: "Erro ao carregar história",
        description: "Ocorreu um erro ao carregar os detalhes da história.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStoryRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('records')
        .select('*')
        .eq('object_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Transform media_files from Json to MediaFile[]
        const transformedData: Record[] = data.map(record => ({
          ...record,
          story_id: record.object_id,
          media_files: record.media_files ? (record.media_files as unknown as MediaFile[]) : null
        }));
        
        setRecords(transformedData);
      }
    } catch (error) {
      console.error('Error fetching story records:', error);
      toast({
        title: "Erro ao carregar registros",
        description: "Ocorreu um erro ao carregar os registros da história.",
        variant: "destructive"
      });
    }
  };

  const handleAddRecord = () => {
    setShowRecordForm(true);
  };

  const handleSubmitRecord = async (record: { 
    title: string; 
    description: string; 
    isPublic: boolean;
    location: Location | null;
    mediaFiles: MediaFile[];
  }) => {
    try {
      const { data, error } = await supabase
        .from('records')
        .insert([
          {
            object_id: id,
            title: record.title,
            description: record.description,
            is_public: record.isPublic,
            location: record.location,
            media_files: record.mediaFiles.length > 0 ? record.mediaFiles as unknown as Json : null
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      // Transform the returned data to match our Record type
      const newRecord: Record = {
        ...data,
        story_id: data.object_id,
        media_files: data.media_files ? (data.media_files as unknown as MediaFile[]) : null
      };
      
      setRecords([newRecord, ...records]);
      setShowRecordForm(false);
      
      toast({
        title: "Registro adicionado",
        description: "O novo registro foi adicionado com sucesso à linha do tempo.",
      });
      
      // Update the story's updated_at timestamp
      await supabase
        .from('objects')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', id);
      
    } catch (error) {
      console.error('Error adding record:', error);
      toast({
        title: "Erro ao adicionar registro",
        description: "Ocorreu um erro ao adicionar o registro. Por favor, tente novamente.",
        variant: "destructive"
      });
    }
  };

  const toggleVisibility = async () => {
    if (!story) return;
    
    try {
      const newVisibility = !story.is_public;
      
      const { error } = await supabase
        .from('objects')
        .update({ is_public: newVisibility })
        .eq('id', id);
      
      if (error) throw error;
      
      setStory({ ...story, is_public: newVisibility });
      
      toast({
        title: `História agora é ${newVisibility ? 'Pública' : 'Privada'}`,
        description: `A visibilidade da história foi alterada com sucesso.`,
      });
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast({
        title: "Erro ao alterar visibilidade",
        description: "Ocorreu um erro ao alterar a visibilidade da história.",
        variant: "destructive"
      });
    }
  };

  const shareStory = () => {
    // Copy the story URL to clipboard
    const url = `${window.location.origin}/story/${id}`;
    navigator.clipboard.writeText(url);
    
    toast({
      title: "Link copiado",
      description: "O link da história foi copiado para a área de transferência.",
    });
  };

  const generatePDF = async () => {
    if (!story) return;
    
    setIsGeneratingPdf(true);
    
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Embed the default font
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Add a page to the document
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      const { width, height } = page.getSize();
      
      // Set some styles
      const margin = 50;
      const fontSize = 12;
      const lineHeight = 1.5;
      const titleFontSize = 24;
      const subtitleFontSize = 16;
      const smallFontSize = 10;
      
      // Draw the title
      page.drawText('ConnectOS', {
        x: margin,
        y: height - margin,
        size: 14,
        font: boldFont,
        color: rgb(0.2, 0.4, 0.6)
      });
      
      page.drawText('A Alma Digital das Coisas', {
        x: margin,
        y: height - margin - 20,
        size: 10,
        font,
        color: rgb(0.5, 0.5, 0.5)
      });
      
      // Draw a line
      page.drawLine({
        start: { x: margin, y: height - margin - 40 },
        end: { x: width - margin, y: height - margin - 40 },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
      });
      
      // Draw the story title
      page.drawText(story.name, {
        x: margin,
        y: height - margin - 80,
        size: titleFontSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });
      
      // Draw the story type badge
      const storyTypeText = `Tipo: ${storyTypeLabels[story.story_type || 'outro'] || 'Outro'}`;
      page.drawText(storyTypeText, {
        x: margin,
        y: height - margin - 110,
        size: smallFontSize,
        font,
        color: rgb(0.5, 0.5, 0.5)
      });
      
      // Draw the location if available
      let locationY = height - margin - 130;
      
      if (story.location) {
        const locationParts = [
          story.location.city,
          story.location.state,
          story.location.country
        ].filter(Boolean);
        
        if (locationParts.length > 0) {
          const locationText = `Localização: ${locationParts.join(', ')}`;
          page.drawText(locationText, {
            x: margin,
            y: locationY,
            size: smallFontSize,
            font,
            color: rgb(0.5, 0.5, 0.5)
          });
          locationY -= 20;
        }
      }
      
      // Draw the description
      if (story.description) {
        page.drawText('Descrição:', {
          x: margin,
          y: locationY,
          size: subtitleFontSize,
          font: boldFont,
          color: rgb(0, 0, 0)
        });
        
        // Split the description into lines for better formatting
        const maxWidth = width - 2 * margin;
        let currentLine = '';
        let currentY = locationY - 25;
        
        for (const word of story.description.split(' ')) {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const lineWidth = font.widthOfTextAtSize(testLine, fontSize);
          
          if (lineWidth > maxWidth) {
            // Draw the current line and start a new one
            page.drawText(currentLine, {
              x: margin,
              y: currentY,
              size: fontSize,
              font,
              color: rgb(0, 0, 0)
            });
            currentY -= fontSize * lineHeight;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        
        // Draw the last line of the description
        if (currentLine) {
          page.drawText(currentLine, {
            x: margin,
            y: currentY,
            size: fontSize,
            font,
            color: rgb(0, 0, 0)
          });
          currentY -= fontSize * lineHeight * 2;
        }
        
        // Draw the timeline title
        page.drawText('Linha do Tempo', {
          x: margin,
          y: currentY,
          size: subtitleFontSize,
          font: boldFont,
          color: rgb(0, 0, 0)
        });
        currentY -= 25;
        
        // Draw the records
        for (const record of records) {
          const recordDate = new Date(record.created_at).toLocaleDateString('pt-BR');
          
          page.drawText(`${recordDate} - ${record.title}`, {
            x: margin + 10,
            y: currentY,
            size: fontSize,
            font: boldFont,
            color: rgb(0, 0, 0)
          });
          currentY -= fontSize * lineHeight;
          
          // Draw the record location if available
          if (record.location) {
            const recordLocationParts = [
              record.location.city,
              record.location.state,
              record.location.country
            ].filter(Boolean);
            
            if (recordLocationParts.length > 0) {
              const recordLocationText = `Localização: ${recordLocationParts.join(', ')}`;
              page.drawText(recordLocationText, {
                x: margin + 10,
                y: currentY,
                size: smallFontSize,
                font,
                color: rgb(0.5, 0.5, 0.5)
              });
              currentY -= fontSize;
            }
          }
          
          // Draw the record description
          if (record.description) {
            // Split the record description into lines
            let recordCurrentLine = '';
            
            for (const word of record.description.split(' ')) {
              const testLine = recordCurrentLine + (recordCurrentLine ? ' ' : '') + word;
              const lineWidth = font.widthOfTextAtSize(testLine, fontSize);
              
              if (lineWidth > maxWidth - 20) {
                // Draw the current line and start a new one
                page.drawText(recordCurrentLine, {
                  x: margin + 10,
                  y: currentY,
                  size: fontSize,
                  font,
                  color: rgb(0, 0, 0)
                });
                currentY -= fontSize * lineHeight;
                recordCurrentLine = word;
              } else {
                recordCurrentLine = testLine;
              }
            }
            
            // Draw the last line of the record description
            if (recordCurrentLine) {
              page.drawText(recordCurrentLine, {
                x: margin + 10,
                y: currentY,
                size: fontSize,
                font,
                color: rgb(0, 0, 0)
              });
              currentY -= fontSize * lineHeight;
            }
          }
          
          // Add some space after each record
          currentY -= fontSize * lineHeight;
          
          // Check if we need a new page
          if (currentY < margin + 50) {
            const newPage = pdfDoc.addPage([595.28, 841.89]);
            currentY = height - margin;
          }
        }
      }
      
      // Add a footer
      page.drawText(`Gerado por ConnectOS em ${new Date().toLocaleDateString('pt-BR')}`, {
        x: margin,
        y: margin / 2,
        size: smallFontSize,
        font,
        color: rgb(0.5, 0.5, 0.5)
      });
      
      // Serialize the PDFDocument to bytes
      const pdfBytes = await pdfDoc.save();
      
      // Create a Blob from the PDF bytes
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      // Create a temporary URL to the blob
      const url = URL.createObjectURL(blob);
      
      // Open the PDF in a new tab
      window.open(url, '_blank');
      
      // Create a download link and click it
      const link = document.createElement('a');
      link.href = url;
      link.download = `${story.name.replace(/\s+/g, '_')}_historia.pdf`;
      link.click();
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "PDF gerado com sucesso",
        description: "A história foi exportada para PDF.",
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o PDF da história.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p>Carregando detalhes da história...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">História não encontrada</h1>
            <Button onClick={() => navigate('/explore')}>Ver outras histórias</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Format records for the timeline component
  const formattedRecords = records.map(record => ({
    id: record.id,
    date: new Date(record.created_at).toLocaleDateString('pt-BR'),
    title: record.title,
    description: record.description || "",
    isPublic: record.is_public,
    location: record.location as Location,
    mediaFiles: record.media_files || []
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container max-w-4xl py-8">
          <Card className="overflow-hidden">
            <div className={`${story.cover_image ? '' : 'bg-gradient-to-r from-connectos-100 to-connectos-50 dark:from-connectos-800 dark:to-connectos-700'}`}>
              {story.cover_image && (
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={story.cover_image} 
                    alt={story.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
              )}
              
              <div className="p-8">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {story.story_type && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Tag size={12} />
                          <span>{storyTypeLabels[story.story_type] || story.story_type}</span>
                        </Badge>
                      )}
                      
                      {story.is_public ? (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Globe size={12} />
                          <span>Público</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Lock size={12} />
                          <span>Privado</span>
                        </Badge>
                      )}
                    </div>
                    
                    <h1 className="text-2xl font-bold">{story.name}</h1>
                    <p className="text-muted-foreground mt-2">{story.description}</p>
                    
                    {story.location && (story.location.city || story.location.state || story.location.country) && (
                      <div className="flex items-center text-sm text-muted-foreground mt-2">
                        <MapPin size={14} className="mr-1" />
                        <span>
                          {[story.location.city, story.location.state, story.location.country].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 md:items-end">
                    <p className="text-sm text-muted-foreground">
                      Criado em {new Date(story.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={generatePDF}
                        disabled={isGeneratingPdf}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {isGeneratingPdf ? "Gerando..." : "Baixar PDF"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={shareStory}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Compartilhar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <div className="flex items-center">
                        {story.is_public ? (
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Label htmlFor="public-toggle" className="ml-2 cursor-pointer">
                          {story.is_public ? "Público" : "Privado"}
                        </Label>
                      </div>
                      <Switch 
                        id="public-toggle" 
                        checked={story.is_public} 
                        onCheckedChange={toggleVisibility}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {showRecordForm ? (
          <div className="container max-w-4xl py-4">
            <RecordForm 
              onSubmit={handleSubmitRecord} 
              onCancel={() => setShowRecordForm(false)} 
            />
          </div>
        ) : null}
        
        <StoryTimeline 
          records={formattedRecords} 
          onAddRecord={handleAddRecord} 
        />
      </main>
      <Footer />
    </div>
  );
};

export default StoryDetail;
