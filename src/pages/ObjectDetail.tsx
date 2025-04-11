
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
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

// Mock data (in a real app, this would come from a database)
const mockObject = {
  id: "123",
  name: "Violão Takamine EG341SC",
  description: "Meu violão acústico, comprado em 2010. Ele me acompanhou em muitas viagens e momentos importantes.",
  isPublic: true,
  tags: ["Instrumento", "Música", "Pessoal"],
  createdAt: "10/04/2022"
};

const mockRecords = [
  {
    id: "1",
    date: "12/04/2022",
    title: "Primeira apresentação",
    description: "Hoje usei o violão na minha primeira apresentação pública. Estava nervoso, mas o som ficou incrível.",
    isPublic: true
  },
  {
    id: "2",
    date: "03/07/2022",
    title: "Troca de cordas",
    description: "Troquei as cordas para um conjunto de nylon de melhor qualidade. A sonoridade melhorou significativamente.",
    isPublic: true
  },
  {
    id: "3",
    date: "22/10/2022",
    title: "Pequeno reparo",
    description: "Uma das tarraxas estava com problema. Levei na luthieria para um pequeno ajuste.",
    isPublic: false
  }
];

const ObjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [object, setObject] = useState(mockObject);
  const [records, setRecords] = useState(mockRecords);
  const [showRecordForm, setShowRecordForm] = useState(false);

  const handleAddRecord = () => {
    setShowRecordForm(true);
  };

  const handleSubmitRecord = (record: { title: string; description: string; isPublic: boolean }) => {
    const newRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('pt-BR'),
      ...record
    };
    
    setRecords([newRecord, ...records]);
    setShowRecordForm(false);
    
    toast({
      title: "Registro adicionado",
      description: "O novo registro foi adicionado com sucesso à linha do tempo.",
    });
  };

  const toggleVisibility = () => {
    setObject({ ...object, isPublic: !object.isPublic });
    
    toast({
      title: `Objeto agora é ${!object.isPublic ? 'Público' : 'Privado'}`,
      description: `A visibilidade do objeto foi alterada com sucesso.`,
    });
  };

  const shareObject = () => {
    // In a real app, this would copy the actual link
    navigator.clipboard.writeText(`https://connectos.app/object/${id}`);
    
    toast({
      title: "Link copiado",
      description: "O link do objeto foi copiado para a área de transferência.",
    });
  };

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
                  <div className="flex flex-wrap gap-2 mt-4">
                    {object.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="text-xs px-2 py-1 rounded-full bg-white/50 dark:bg-connectos-600/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 md:items-end">
                  <p className="text-sm text-muted-foreground">Criado em {object.createdAt}</p>
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
                      {object.isPublic ? (
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Label htmlFor="public-toggle" className="ml-2 cursor-pointer">
                        {object.isPublic ? "Público" : "Privado"}
                      </Label>
                    </div>
                    <Switch 
                      id="public-toggle" 
                      checked={object.isPublic} 
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
          records={records} 
          onAddRecord={handleAddRecord} 
        />
      </main>
      <Footer />
    </div>
  );
};

export default ObjectDetail;
