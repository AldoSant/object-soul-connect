
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ObjectTimeline from '@/components/ObjectTimeline';
import RecordForm from '@/components/RecordForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Edit, Share2, Globe, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ObjectType {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface RecordType {
  id: string;
  object_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
}

const ObjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [object, setObject] = useState<ObjectType | null>(null);
  const [records, setRecords] = useState<RecordType[]>([]);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchObjectDetails();
      fetchObjectRecords();
    }
  }, [id]);

  const fetchObjectDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('objects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setObject(data);
      } else {
        toast({
          title: "Objeto não encontrado",
          description: "Não foi possível encontrar o objeto solicitado.",
          variant: "destructive"
        });
        navigate('/explore');
      }
    } catch (error) {
      console.error('Error fetching object details:', error);
      toast({
        title: "Erro ao carregar objeto",
        description: "Ocorreu um erro ao carregar os detalhes do objeto.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchObjectRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('records')
        .select('*')
        .eq('object_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setRecords(data);
      }
    } catch (error) {
      console.error('Error fetching object records:', error);
      toast({
        title: "Erro ao carregar registros",
        description: "Ocorreu um erro ao carregar os registros do objeto.",
        variant: "destructive"
      });
    }
  };

  const handleAddRecord = () => {
    setShowRecordForm(true);
  };

  const handleSubmitRecord = async (record: { title: string; description: string; isPublic: boolean }) => {
    try {
      const { data, error } = await supabase
        .from('records')
        .insert([
          {
            object_id: id,
            title: record.title,
            description: record.description,
            is_public: record.isPublic
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      setRecords([data, ...records]);
      setShowRecordForm(false);
      
      toast({
        title: "Registro adicionado",
        description: "O novo registro foi adicionado com sucesso à linha do tempo.",
      });
      
      // Update the object's updated_at timestamp
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
    if (!object) return;
    
    try {
      const newVisibility = !object.is_public;
      
      const { error } = await supabase
        .from('objects')
        .update({ is_public: newVisibility })
        .eq('id', id);
      
      if (error) throw error;
      
      setObject({ ...object, is_public: newVisibility });
      
      toast({
        title: `Objeto agora é ${newVisibility ? 'Público' : 'Privado'}`,
        description: `A visibilidade do objeto foi alterada com sucesso.`,
      });
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast({
        title: "Erro ao alterar visibilidade",
        description: "Ocorreu um erro ao alterar a visibilidade do objeto.",
        variant: "destructive"
      });
    }
  };

  const shareObject = () => {
    // Copy the object URL to clipboard
    const url = `${window.location.origin}/object/${id}`;
    navigator.clipboard.writeText(url);
    
    toast({
      title: "Link copiado",
      description: "O link do objeto foi copiado para a área de transferência.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p>Carregando detalhes do objeto...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!object) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Objeto não encontrado</h1>
            <Button onClick={() => navigate('/explore')}>Ver outros objetos</Button>
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
    isPublic: record.is_public
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container max-w-4xl py-8">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-connectos-100 to-connectos-50 dark:from-connectos-800 dark:to-connectos-700 p-8">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{object.name}</h1>
                  <p className="text-muted-foreground mt-2">{object.description}</p>
                </div>
                <div className="flex flex-col gap-2 md:items-end">
                  <p className="text-sm text-muted-foreground">
                    Criado em {new Date(object.created_at).toLocaleDateString('pt-BR')}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={shareObject}>
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
                      {object.is_public ? (
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Label htmlFor="public-toggle" className="ml-2 cursor-pointer">
                        {object.is_public ? "Público" : "Privado"}
                      </Label>
                    </div>
                    <Switch 
                      id="public-toggle" 
                      checked={object.is_public} 
                      onCheckedChange={toggleVisibility}
                    />
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
        
        <ObjectTimeline 
          records={formattedRecords} 
          onAddRecord={handleAddRecord} 
        />
      </main>
      <Footer />
    </div>
  );
};

export default ObjectDetail;
