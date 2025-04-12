
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { StoryType, MediaFile } from "@/types";

interface SeedStory {
  name: string;
  description: string;
  storyType: StoryType;
  isPublic: boolean;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  coverImage?: string;
  thumbnail?: string;
}

interface SeedRecord {
  title: string;
  description: string;
  isPublic: boolean;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  mediaFiles?: MediaFile[];
}

export const seedStories = async (): Promise<void> => {
  const stories: Array<SeedStory> = [
    // Objetos
    {
      name: "Violão Takamine 1985",
      description: "Este violão me acompanha desde meus primeiros acordes. Um presente do meu avô que já passou por centenas de rodas de música e viagens. Cada marca na madeira conta uma história.",
      storyType: "objeto",
      isPublic: true,
      location: {
        city: "São Paulo",
        state: "SP",
        country: "Brasil"
      },
      coverImage: "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02",
      thumbnail: "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=200"
    },
    {
      name: "Câmera analógica herdada",
      description: "Uma Pentax K1000 que pertenceu ao meu pai. Ele documentou toda a minha infância com ela e agora eu continuo o legado registrando momentos importantes enquanto aprendo a ver o mundo através de suas lentes.",
      storyType: "objeto",
      isPublic: true,
      location: {
        city: "Rio de Janeiro",
        state: "RJ",
        country: "Brasil"
      },
      coverImage: "https://images.unsplash.com/photo-1519638831568-d9897f54ed69",
      thumbnail: "https://images.unsplash.com/photo-1519638831568-d9897f54ed69?w=200"
    },
    // Pessoas
    {
      name: "Maria Helena - Avó e memória viva",
      description: "Minha avó nasceu em 1932 e vivenciou tantas transformações no mundo. Este é um espaço para registrar suas histórias, receitas, sabedoria e memórias que não quero que se percam com o tempo.",
      storyType: "pessoa",
      isPublic: true,
      location: {
        city: "Salvador",
        state: "BA",
        country: "Brasil"
      },
      coverImage: "https://images.unsplash.com/photo-1581579438747-104c53d7fbc4",
      thumbnail: "https://images.unsplash.com/photo-1581579438747-104c53d7fbc4?w=200"
    },
    // Espaços
    {
      name: "Sítio Bem-te-vi",
      description: "O sítio da família que passou por quatro gerações. Registrando sua transformação, as histórias vividas lá, as reformas, as árvores plantadas e todas as memórias que este espaço guarda.",
      storyType: "espaço",
      isPublic: true,
      location: {
        city: "Atibaia",
        state: "SP",
        country: "Brasil"
      },
      coverImage: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21",
      thumbnail: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=200"
    },
    // Eventos
    {
      name: "Festival Memória e Arte 2023",
      description: "Documentação completa do festival que organizamos para celebrar culturas tradicionais. Aqui registro desde o planejamento até os momentos mais marcantes do evento.",
      storyType: "evento",
      isPublic: true,
      location: {
        city: "Ouro Preto",
        state: "MG",
        country: "Brasil"
      },
      coverImage: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81",
      thumbnail: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=200"
    },
    // Privado
    {
      name: "Diário de Restauro - Móvel Antigo",
      description: "Registro privado do processo de restauração de uma escrivaninha do século XIX. Documentando técnicas, materiais, desafios e transformações.",
      storyType: "objeto",
      isPublic: false,
      coverImage: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8",
      thumbnail: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=200"
    },
    // Outro
    {
      name: "Mapa Afetivo de Lisboa",
      description: "Um registro especial de todos os lugares significativos para mim em Lisboa. Cada ponto conta uma história pessoal e uma memória única.",
      storyType: "outro",
      isPublic: true,
      location: {
        city: "Lisboa",
        country: "Portugal"
      },
      coverImage: "https://images.unsplash.com/photo-1549314662-b88d8ad6bd91",
      thumbnail: "https://images.unsplash.com/photo-1549314662-b88d8ad6bd91?w=200"
    },
    {
      name: "Biblioteca familiar",
      description: "Catalogando nossa biblioteca familiar que já passou por três gerações. Cada livro tem marcações, dedicatórias e histórias de quando foi adquirido.",
      storyType: "objeto",
      isPublic: true,
      coverImage: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da",
      thumbnail: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=200"
    },
    {
      name: "Coleção de vinis",
      description: "História da minha coleção de discos de vinil iniciada nos anos 70 e continuada até hoje. Cada disco conta uma fase da minha vida e um momento da história da música.",
      storyType: "objeto",
      isPublic: true,
      location: {
        city: "Porto Alegre",
        state: "RS",
        country: "Brasil"
      },
      coverImage: "https://images.unsplash.com/photo-1603048588665-791ca8aea617",
      thumbnail: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=200"
    },
    {
      name: "Processo criativo - Exposição Raízes",
      description: "Documentação do processo de criação da minha exposição de arte, desde os primeiros esboços até a montagem final na galeria.",
      storyType: "outro",
      isPublic: true,
      location: {
        city: "Curitiba",
        state: "PR",
        country: "Brasil"
      },
      coverImage: "https://images.unsplash.com/photo-1460572894071-bde5697f7197",
      thumbnail: "https://images.unsplash.com/photo-1460572894071-bde5697f7197?w=200"
    }
  ];

  const recordsMap: Record<number, SeedRecord[]> = {
    0: [ // Violão
      {
        title: "Origem do violão",
        description: "Meu avô me deu este violão em 1985, quando completei 15 anos. Ele o comprou em uma viagem ao Japão e me ensinou os primeiros acordes.",
        isPublic: true,
        mediaFiles: [
          {
            id: uuidv4(),
            url: "https://images.unsplash.com/photo-1504898770365-14faca6a7320",
            type: "image",
            name: "Primeira foto com o violão"
          }
        ]
      },
      {
        title: "Restauração das cordas e braço",
        description: "Após 20 anos de uso, levei o violão para uma restauração completa. O luthier ficou impressionado com a qualidade da madeira e o estado de conservação apesar do uso intenso.",
        isPublic: true,
        location: {
          city: "São Paulo",
          state: "SP",
          country: "Brasil"
        },
        mediaFiles: [
          {
            id: uuidv4(),
            url: "https://images.unsplash.com/photo-1624381522901-8a0a0476b4b3",
            type: "image",
            name: "Durante a restauração"
          }
        ]
      },
      {
        title: "Apresentação no festival",
        description: "Utilizei este violão na minha primeira apresentação em um festival. A acústica dele se destacou mesmo em um ambiente aberto.",
        isPublic: true,
        mediaFiles: [
          {
            id: uuidv4(),
            url: "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
            type: "image",
            name: "No palco do festival"
          }
        ]
      }
    ],
    3: [ // Sítio
      {
        title: "Primeira visita ao sítio",
        description: "O sítio foi comprado pelo meu bisavô em 1943. Esta foto é da primeira vez que visitei o local, ainda criança, quando descobri o pomar e a nascente.",
        isPublic: true,
        location: {
          city: "Atibaia",
          state: "SP",
          country: "Brasil"
        },
        mediaFiles: [
          {
            id: uuidv4(),
            url: "https://images.unsplash.com/photo-1500603720222-eb7a1f997356",
            type: "image",
            name: "Primeira visita ao sítio"
          }
        ]
      },
      {
        title: "Reforma da casa principal",
        description: "Em 2010 iniciamos uma grande reforma para preservar a estrutura original da casa de 1950, mas modernizar as instalações. Mantivemos todas as madeiras originais e azulejos históricos.",
        isPublic: true,
        mediaFiles: [
          {
            id: uuidv4(),
            url: "https://images.unsplash.com/photo-1531835551805-16d864c8d311",
            type: "image",
            name: "Durante a reforma"
          }
        ]
      },
      {
        title: "Plantio das novas árvores frutíferas",
        description: "Ampliamos o pomar com mais 15 espécies de árvores frutíferas nativas. Um projeto para recuperar a biodiversidade original da região e garantir o futuro do sítio.",
        isPublic: true,
        mediaFiles: [
          {
            id: uuidv4(),
            url: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2",
            type: "image",
            name: "Novas mudas plantadas"
          }
        ]
      }
    ],
    7: [ // Biblioteca
      {
        title: "O livro mais antigo da coleção",
        description: "Esta primeira edição de 'Os Lusíadas' de 1872 é o item mais valioso da nossa biblioteca. Foi trazido de Portugal pelo meu bisavô e tem suas anotações nas margens.",
        isPublic: true,
        mediaFiles: [
          {
            id: uuidv4(),
            url: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6",
            type: "image",
            name: "Livro antigo"
          }
        ]
      },
      {
        title: "Catalogação digital",
        description: "Iniciamos um projeto para catalogar todos os mais de 3.000 livros da biblioteca familiar, incluindo detalhes como dedicatórias, anotações e estado de conservação.",
        isPublic: true,
        mediaFiles: [
          {
            id: uuidv4(),
            url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
            type: "image",
            name: "Processo de catalogação"
          }
        ]
      }
    ]
  };

  // Inserir as histórias e obter seus IDs
  for (let i = 0; i < stories.length; i++) {
    const story = stories[i];
    
    const { data: storyData, error: storyError } = await supabase
      .from('objects')
      .insert({
        name: story.name,
        description: story.description,
        story_type: story.storyType,
        is_public: story.isPublic,
        location: story.location || null,
        cover_image: story.coverImage || null,
        thumbnail: story.thumbnail || null
      })
      .select();
    
    if (storyError) {
      console.error(`Erro ao inserir história ${story.name}:`, storyError);
      continue;
    }
    
    // Se esta história tem registros para serem adicionados
    if (recordsMap[i] && storyData && storyData.length > 0) {
      const storyId = storyData[0].id;
      const records = recordsMap[i];
      
      // Inserir os registros para esta história
      for (const record of records) {
        // Fix: Convert MediaFile[] to a JSON-compatible format that Supabase can handle
        const mediaFilesJson = record.mediaFiles ? 
          record.mediaFiles.map(file => ({
            id: file.id,
            url: file.url,
            type: file.type,
            name: file.name
          })) : [];
        
        const { error: recordError } = await supabase
          .from('records')
          .insert({
            object_id: storyId,
            title: record.title,
            description: record.description,
            is_public: record.isPublic,
            location: record.location || null,
            media_files: mediaFilesJson
          });
        
        if (recordError) {
          console.error(`Erro ao inserir registro ${record.title} para história ${story.name}:`, recordError);
        }
      }
    }
  }
  
  console.log('Banco de dados populado com sucesso!');
};
