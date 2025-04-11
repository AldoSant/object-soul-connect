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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Tag, QrCode, Link as LinkIcon, PlusCircle, MapPin, Upload, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { StoryType, Location } from '@/types';
import { Json } from '@/integrations/supabase/types';
import { v4 as uuidv4 } from 'uuid';

const NewStory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState('');
  const [storyType, setStoryType] = useState<StoryType>('objeto');
  const [showLocation, setShowLocation] = useState(false);
  const [location, setLocation] = useState<Location>({
    city: '',
    state: '',
    country: ''
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const uploadImage = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('stories')
      .upload(filePath, file);
    
    if (error) throw error;
    
    const { data: urlData } = await supabase.storage
      .from('stories')
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, dê um nome à sua história.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload images if provided
      let coverImageUrl = null;
      let thumbnailUrl = null;
      
      if (coverImage) {
        coverImageUrl = await uploadImage(coverImage, 'covers');
      }
      
      if (thumbnail) {
        thumbnailUrl = await uploadImage(thumbnail, 'thumbnails');
      }
      
      // Process location - if not showing location or all fields are empty, set to null
      const locationData = !showLocation || (
        !location.city?.trim() && 
        !location.state?.trim() && 
        !location.country?.trim()
      ) ? null : location as unknown as Json;
      
      // Insert story into the database
      const { data, error } = await supabase
        .from('objects')
        .insert({
          name, 
          description, 
          is_public: isPublic,
          story_type: storyType,
          location: locationData,
          cover_image: coverImageUrl,
          thumbnail: thumbnailUrl
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "História criada com sucesso!",
        description: "Sua nova história digital agora está pronta para receber registros.",
      });
      
      // Navigate to the new story page
      if (data && data.length > 0) {
        navigate(`/story/${data[0].id}`);
      } else {
        throw new Error("No data returned from story creation");
      }
    } catch (error) {
      console.error('Error creating story:', error);
      toast({
        title: "Erro ao criar história",
        description: "Ocorreu um erro ao registrar sua história. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 bg-gradient-to-b from-connectos-50/30 to-transparent">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold mb-8 text-connectos-700">Registrar nova história</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informações da história</CardTitle>
                  <CardDescription>
                    Preencha os detalhes para criar a identidade digital da sua história.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome da história</Label>
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
                        placeholder="Conte um pouco sobre esta história, sua origem, significado..." 
                        rows={4} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tipo de história</Label>
                      <RadioGroup 
                        value={storyType} 
                        onValueChange={(value) => setStoryType(value as StoryType)}
                        className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="objeto" id="objeto" />
                          <Label htmlFor="objeto">Objeto</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pessoa" id="pessoa" />
                          <Label htmlFor="pessoa">Pessoa</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="espaço" id="espaco" />
                          <Label htmlFor="espaco">Espaço</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="evento" id="evento" />
                          <Label htmlFor="evento">Evento</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="outro" id="outro" />
                          <Label htmlFor="outro">Outro</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div>
                      <div className="flex items-center mb-2">
                        <MapPin className="h-4 w-4 mr-2 text-connectos-400" />
                        <Label htmlFor="showLocation" className="cursor-pointer">Adicionar localização</Label>
                        <Switch 
                          id="showLocation" 
                          className="ml-auto"
                          checked={showLocation} 
                          onCheckedChange={setShowLocation}
                        />
                      </div>
                      
                      {showLocation && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                          <div>
                            <Label htmlFor="city">Cidade</Label>
                            <Input 
                              id="city" 
                              value={location.city || ''} 
                              onChange={(e) => setLocation({...location, city: e.target.value})} 
                              placeholder="Cidade"
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">Estado</Label>
                            <Input 
                              id="state" 
                              value={location.state || ''} 
                              onChange={(e) => setLocation({...location, state: e.target.value})} 
                              placeholder="Estado"
                            />
                          </div>
                          <div>
                            <Label htmlFor="country">País</Label>
                            <Input 
                              id="country" 
                              value={location.country || ''} 
                              onChange={(e) => setLocation({...location, country: e.target.value})} 
                              placeholder="País"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="coverImage">
                          <div className="flex items-center gap-2">
                            <Image className="h-4 w-4 text-connectos-400" />
                            <span>Imagem de capa</span>
                          </div>
                        </Label>
                        <div className="flex flex-col items-center p-4 border border-dashed rounded-md bg-gray-50 dark:bg-gray-800">
                          {coverImagePreview ? (
                            <div className="mb-2 w-full">
                              <img 
                                src={coverImagePreview} 
                                alt="Cover preview" 
                                className="w-full h-32 object-cover rounded-md"
                              />
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="mt-2 w-full"
                                onClick={() => {
                                  setCoverImage(null);
                                  setCoverImagePreview(null);
                                }}
                              >
                                Remover
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center p-6">
                              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm text-muted-foreground">
                                Arraste uma imagem ou clique para selecionar
                              </p>
                            </div>
                          )}
                          <Input 
                            id="coverImage" 
                            type="file" 
                            accept="image/*"
                            className="hidden"
                            onChange={handleCoverImageChange}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="thumbnail">
                          <div className="flex items-center gap-2">
                            <Image className="h-4 w-4 text-connectos-400" />
                            <span>Miniatura</span>
                          </div>
                        </Label>
                        <div className="flex flex-col items-center p-4 border border-dashed rounded-md bg-gray-50 dark:bg-gray-800">
                          {thumbnailPreview ? (
                            <div className="mb-2 w-full">
                              <img 
                                src={thumbnailPreview} 
                                alt="Thumbnail preview" 
                                className="w-full h-32 object-cover rounded-md"
                              />
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="mt-2 w-full"
                                onClick={() => {
                                  setThumbnail(null);
                                  setThumbnailPreview(null);
                                }}
                              >
                                Remover
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center p-6">
                              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm text-muted-foreground">
                                Arraste uma imagem ou clique para selecionar
                              </p>
                            </div>
                          )}
                          <Input 
                            id="thumbnail" 
                            type="file" 
                            accept="image/*"
                            className="hidden"
                            onChange={handleThumbnailChange}
                          />
                        </div>
                      </div>
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
                      <Label htmlFor="isPublic" className="cursor-pointer">Tornar história pública</Label>
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
                      {isSubmitting ? "Criando..." : "Criar história"}
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
                    Após criar sua história, você poderá conectá-la ao mundo físico.
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
                        <p className="text-sm text-muted-foreground">Compartilhe o link direto da história</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => navigate('/explore')}
                      >
                        <PlusCircle className="h-4 w-4" />
                        Ver histórias existentes
                      </Button>
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

export default NewStory;
