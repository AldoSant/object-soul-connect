
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Tag, QrCode, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const NewObject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, dê um nome ao seu objeto.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert object into the database
      const { data, error } = await supabase
        .from('objects')
        .insert([
          { 
            name, 
            description, 
            is_public: isPublic 
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Objeto criado com sucesso!",
        description: "Seu novo objeto digital agora está pronto para receber registros.",
      });
      
      // Navigate to the new object page
      navigate(`/object/${data.id}`);
    } catch (error) {
      console.error('Error creating object:', error);
      toast({
        title: "Erro ao criar objeto",
        description: "Ocorreu um erro ao registrar seu objeto. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Registrar novo objeto</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do objeto</CardTitle>
                  <CardDescription>
                    Preencha os detalhes para criar a identidade digital do seu objeto.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do objeto</Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Ex: Violão Takamine EG341SC" 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea 
                        id="description" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        placeholder="Conte um pouco sobre este objeto, sua origem, significado..." 
                        rows={4} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                      <Input 
                        id="tags" 
                        value={tags} 
                        onChange={(e) => setTags(e.target.value)} 
                        placeholder="Ex: pessoal, coleção, presente" 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="isPublic" className="cursor-pointer">Tornar objeto público</Label>
                      <Switch 
                        id="isPublic" 
                        checked={isPublic} 
                        onCheckedChange={setIsPublic}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={!name || isSubmitting} 
                      className="w-full bg-connectos-400 hover:bg-connectos-500"
                    >
                      {isSubmitting ? "Criando..." : "Criar objeto"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Como conectar</CardTitle>
                  <CardDescription>
                    Após criar seu objeto, você poderá conectá-lo ao mundo físico.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-connectos-100 dark:bg-connectos-700 p-3 rounded-full">
                        <Tag className="h-6 w-6 text-connectos-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">Tag NFC</h3>
                        <p className="text-sm text-muted-foreground">Use uma etiqueta NFC para acesso rápido</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-connectos-100 dark:bg-connectos-700 p-3 rounded-full">
                        <QrCode className="h-6 w-6 text-connectos-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">Código QR</h3>
                        <p className="text-sm text-muted-foreground">Imprima um QR code para o objeto</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-connectos-100 dark:bg-connectos-700 p-3 rounded-full">
                        <LinkIcon className="h-6 w-6 text-connectos-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">Link compartilhável</h3>
                        <p className="text-sm text-muted-foreground">Compartilhe o link direto do objeto</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewObject;
