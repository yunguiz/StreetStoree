import { CustomerReview, InstagramPost } from '../types';

export const REVIEWS: CustomerReview[] = [
  {
    id: 'rev-01',
    name: 'Matheus Ribeiro',
    city: 'Itabira - MG',
    rating: 5,
    date: 'Ontem',
    comment: 'Passei na loja física da Street Store na Avenida João Pinheiro e peguei o Tesla Coil All Black Reflective. A camurça é muito grossa e firme pra lixa do skate, lingueta acolchoada que abraça o tornozelo e o detalhe refletivo brilha demais à noite. Melhor tênis que já usei!',
    productName: 'Tênis Tesla Footwear Coil All Black Reflective',
    verifiedPurchase: true,
    avatarText: 'MR',
    photoUrl: '/assets/aistudio/SaveClip.App_846207181_18118610126469989_4433467057000224093_n_b01c3d11.jpg'
  },
  {
    id: 'rev-02',
    name: 'Lucas "Neguin" Silva',
    city: 'Belo Horizonte - MG',
    rating: 5,
    date: 'Há 3 dias',
    comment: 'O Moletom Oversized Void Heavy 420g é simplesmente absurdo. Tecido pesado de verdade, gola canelada grossa que não deforma e o capuz duplo armado veste perfeitamente no corpo. Sem comparação com marcas comuns de shopping, Street Store representa!',
    productName: 'Moletom Oversized Void Research Heavy 420g',
    verifiedPurchase: true,
    avatarText: 'LS'
  },
  {
    id: 'rev-03',
    name: 'Gabriel Ferreira',
    city: 'São Paulo - SP',
    rating: 5,
    date: 'Há 5 dias',
    comment: 'Comprei a Calça Cargo Tactical com as fivelas de engate e o tecido ripstop é de outro nível. Os bolsos são fundos, cabe celular, carteira e chave sem estufar a silhueta da calça. Chegou em SP super rápido.',
    productName: 'Calça Cargo Tactical Heavy Utility',
    verifiedPurchase: true,
    avatarText: 'GF'
  },
  {
    id: 'rev-04',
    name: 'Thiago Mendes',
    city: 'Rio de Janeiro - RJ',
    rating: 5,
    date: 'Há 1 semana',
    comment: 'O Tênis HOCKS Tempó Camurça Heavy no pé é pura aula de conforto. A palmilha anatômica amortece o impacto de verdade e a estética retrô anos 2000 é muito chave. Caixa veio intacta com brindes e adesivos.',
    productName: 'Tênis HOCKS Skate Tempó Camurça Heavy Black',
    verifiedPurchase: true,
    avatarText: 'TM',
    photoUrl: '/assets/aistudio/snapinsta-1793618646205_6bd63862.jpg'
  },
  {
    id: 'rev-05',
    name: 'Enzo Rossi',
    city: 'Itabira - MG',
    rating: 5,
    date: 'Há 1 semana',
    comment: 'Armação de metal do Óculos Juliet X-Metal com lentes polarizadas violeta espelhada é surreal de perfeita. O peso do metal passa muita qualidade e o acabamento é impecável.',
    productName: 'Óculos Juliet X-Metal Lente Violet Polarizada',
    verifiedPurchase: true,
    avatarText: 'ER'
  },
  {
    id: 'rev-06',
    name: 'Rafael "DK" Castro',
    city: 'Ipatinga - MG',
    rating: 5,
    date: 'Há 2 semanas',
    comment: 'Peguei a Camiseta Chronic Oversized 260g e a Jersey dos Raiders. O caimento com ombro caído é exatamente o que eu procurava no streetwear. Já lavei 3 vezes e a cor permanece 100% preta.',
    productName: 'Camiseta Chronic Oversized 100% Algodão 260g',
    verifiedPurchase: true,
    avatarText: 'RC',
    photoUrl: '/assets/aistudio/SaveClip.App_822666289_18102126563150263_6322204292468705105_n_c25556bb.jpg'
  }
];

export const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: 'ig-01',
    image: '/assets/aistudio/SaveClip.App_846207181_18118610126469989_4433467057000224093_n_b01c3d11.jpg',
    likes: 3420,
    comments: 184,
    caption: 'Satisfação total na loja física! Cliente garantindo a coleção pesada de tênis Tesla Footwear na Street Store.',
    tag: '@streetstoreitabira'
  },
  {
    id: 'ig-02',
    image: '/assets/aistudio/SaveClip.App_822666289_18102126563150263_6322204292468705105_n_c25556bb.jpg',
    likes: 4180,
    comments: 256,
    caption: 'Dupla no kit completo com as Jerseys Raiders NFL e óculos clássicos. A pura essência do streetwear nacional.',
    tag: '@streetstoreitabira'
  },
  {
    id: 'ig-03',
    image: '/assets/aistudio/snapinsta-1793618646205_6bd63862.jpg',
    likes: 2890,
    comments: 142,
    caption: 'Camiseta HOCKS Bordado Marrom com óculos de lente espelhada no lifestyle urbano. Droparam poucas unidades!',
    tag: '@streetstoreitabira'
  },
  {
    id: 'ig-04',
    image: '/assets/aistudio/snapinsta-1793618644319_b3477e6f.jpg',
    likes: 3750,
    comments: 198,
    caption: 'Presença marcante na porta da Street Store em Itabira com a Jersey Raiders Branca e tranças estilizadas.',
    tag: '@streetstoreitabira'
  }
];
