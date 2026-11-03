import fs from 'fs';
import path from 'path';

// Curated streetwear product imagery
const IMAGES = {
  sneakers: [
    '/assets/aistudio/SaveClip.App_846207181_18118610126469989_4433467057000224093_n_b01c3d11.jpg',
    '/src/assets/images/product_sneaker_chunky_1793275503077.jpg',
    'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=85'
  ],
  chinelos: [
    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1000&q=85'
  ],
  hoodies: [
    '/src/assets/images/product_hoodie_oversized_1793275501387.jpg',
    '/src/assets/images/lookview_fullkit_model_1793275500631.jpg',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=85'
  ],
  camisetas: [
    '/assets/aistudio/snapinsta-1793618646205_6bd63862.jpg',
    '/assets/aistudio/snapinsta-1793618644319_b3477e6f.jpg',
    '/assets/aistudio/SaveClip.App_822666289_18102126563150263_6322204292468705105_n_c25556bb.jpg',
    '/src/assets/images/hero_streetwear_urban_1793275500555.jpg',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85'
  ],
  calcas: [
    '/src/assets/images/product_cargo_heavy_1793275501361.jpg',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=85'
  ],
  shorts: [
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=1000&q=85'
  ],
  bones: [
    'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=1000&q=85'
  ],
  oculos: [
    '/assets/aistudio/snapinsta-1793618646205_6bd63862.jpg',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=1000&q=85'
  ],
  bags: [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85'
  ],
  metal: [
    'https://images.unsplash.com/photo-1611591475870-a3597c27ec09?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=85'
  ]
};

// Catalogo de modelos reais base
const BASE_MODELS = [
  // --- TESLA FOOTWEAR ---
  { brand: 'Tesla Footwear', name: 'Tênis Tesla Coil All Black Reflective', cat: 'calcados', sub: 'sneakers', price: 389.90, orig: 479.90, imgType: 'sneakers', sizes: ['38', '39', '40', '41', '42', '43', '44'], stock: 14, tag: 'MAIS VENDIDO' },
  { brand: 'Tesla Footwear', name: 'Tênis Tesla Hertz White & Emerald Green', cat: 'calcados', sub: 'sneakers', price: 399.90, orig: 489.90, imgType: 'sneakers', sizes: ['38', '39', '40', '41', '42', '43'], stock: 8, tag: 'NOVO DROP' },
  { brand: 'Tesla Footwear', name: 'Tênis Tesla Fusion Camurça Grey Ice', cat: 'calcados', sub: 'sneakers', price: 379.90, orig: 459.90, imgType: 'sneakers', sizes: ['39', '40', '41', '42', '43'], stock: 12, tag: null },
  { brand: 'Tesla Footwear', name: 'Tênis Tesla 9 Parafusos Fat Lace Black', cat: 'calcados', sub: 'sneakers', price: 419.90, orig: 499.90, imgType: 'sneakers', sizes: ['38', '39', '40', '41', '42', '43', '44'], stock: 6, tag: 'POUCAS UNIDADES' },
  { brand: 'Tesla Footwear', name: 'Tênis Tesla Camp Brown Caramel Leather', cat: 'calcados', sub: 'sneakers', price: 389.90, orig: 469.90, imgType: 'sneakers', sizes: ['38', '39', '40', '41', '42', '43'], stock: 0, tag: 'SEM ESTOQUE' },
  { brand: 'Tesla Footwear', name: 'Tênis Tesla 21K Metallic Silver & Black', cat: 'calcados', sub: 'sneakers', price: 429.90, orig: 519.90, imgType: 'sneakers', sizes: ['39', '40', '41', '42', '43'], stock: 9, tag: 'NOVO DROP' },
  { brand: 'Tesla Footwear', name: 'Tênis Tesla Venice Skate Low Blue Navy', cat: 'calcados', sub: 'sneakers', price: 369.90, orig: 449.90, imgType: 'sneakers', sizes: ['38', '39', '40', '41', '42'], stock: 7, tag: null },
  { brand: 'Tesla Footwear', name: 'Tênis Tesla Coil Black & Purple Cyber', cat: 'calcados', sub: 'sneakers', price: 389.90, orig: 479.90, imgType: 'sneakers', sizes: ['38', '39', '40', '41', '42', '43'], stock: 11, tag: null },
  { brand: 'Tesla Footwear', name: 'Tênis Tesla Hertz Full Triple White', cat: 'calcados', sub: 'sneakers', price: 399.90, orig: 489.90, imgType: 'sneakers', sizes: ['38', '39', '40', '41', '42', '43', '44'], stock: 5, tag: 'POUCAS UNIDADES' },
  { brand: 'Tesla Footwear', name: 'Tênis Tesla Fusion Red Velvet & Black', cat: 'calcados', sub: 'sneakers', price: 379.90, orig: 459.90, imgType: 'sneakers', sizes: ['39', '40', '41', '42'], stock: 4, tag: null },

  // --- HOCKS SKATE ---
  { brand: 'HOCKS', name: 'Tênis HOCKS Skate Tempó Camurça Heavy Black', cat: 'calcados', sub: 'sneakers', price: 359.90, orig: 439.90, imgType: 'sneakers', sizes: ['38', '39', '40', '41', '42', '43'], stock: 12, tag: 'MAIS VENDIDO' },
  { brand: 'HOCKS', name: 'Tênis HOCKS Do Vale Preto com Sola Caramelo', cat: 'calcados', sub: 'sneakers', price: 349.90, orig: 429.90, imgType: 'sneakers', sizes: ['38', '39', '40', '41', '42', '43', '44'], stock: 16, tag: null },
  { brand: 'HOCKS', name: 'Tênis HOCKS Puff Fat Tongue Vintage 2000', cat: 'calcados', sub: 'sneakers', price: 389.90, orig: 469.90, imgType: 'sneakers', sizes: ['39', '40', '41', '42', '43'], stock: 9, tag: 'NOVO DROP' },
  { brand: 'HOCKS', name: 'Tênis HOCKS Montreal Camurça Estonada Areia', cat: 'calcados', sub: 'sneakers', price: 329.90, orig: 399.90, imgType: 'sneakers', sizes: ['38', '39', '40', '41', '42', '43'], stock: 11, tag: null },
  { brand: 'HOCKS', name: 'Tênis HOCKS De La Calle Canvas & Suede Black', cat: 'calcados', sub: 'sneakers', price: 319.90, orig: 389.90, imgType: 'sneakers', sizes: ['38', '39', '40', '41', '42'], stock: 14, tag: null },
  { brand: 'HOCKS', name: 'Tênis HOCKS Coruña Black Leather High Cut', cat: 'calcados', sub: 'sneakers', price: 399.90, orig: 489.90, imgType: 'sneakers', sizes: ['39', '40', '41', '42', '43', '44'], stock: 7, tag: null },
  { brand: 'HOCKS', name: 'Tênis HOCKS Pop Skate Low All Black', cat: 'calcados', sub: 'sneakers', price: 299.90, orig: 369.90, imgType: 'sneakers', sizes: ['38', '39', '40', '41', '42', '43'], stock: 18, tag: null },
  { brand: 'HOCKS', name: 'Tênis HOCKS Galáctica Refletivo 3M Black', cat: 'calcados', sub: 'sneakers', price: 389.90, orig: 479.90, imgType: 'sneakers', sizes: ['38', '39', '40', '41', '42'], stock: 0, tag: 'SEM ESTOQUE' },
  { brand: 'HOCKS', name: 'Tênis HOCKS Tempó Caramelo Natural Gum', cat: 'calcados', sub: 'sneakers', price: 359.90, orig: 439.90, imgType: 'sneakers', sizes: ['38', '39', '40', '41', '42', '43'], stock: 8, tag: null },
  { brand: 'HOCKS', name: 'Tênis HOCKS Do Vale Chumbo Estonado', cat: 'calcados', sub: 'sneakers', price: 349.90, orig: 429.90, imgType: 'sneakers', sizes: ['39', '40', '41', '42', '43'], stock: 6, tag: null },

  // --- QIX SKATE ---
  { brand: 'Qix', name: 'Tênis Qix Hexagon Retrô Camurça Fat Tongue', cat: 'calcados', sub: 'sneakers', price: 379.90, orig: 459.90, imgType: 'sneakers', sizes: ['38', '39', '40', '41', '42', '43', '44'], stock: 15, tag: 'MAIS VENDIDO' },
  { brand: 'Qix', name: 'Tênis Qix Combat Camurça Militar & Preto', cat: 'calcados', sub: 'sneakers', price: 349.90, orig: 429.90, imgType: 'sneakers', sizes: ['38', '39', '40', '41', '42', '43'], stock: 10, tag: null },
  { brand: 'Qix', name: 'Tênis Qix Chorão 013 Skate Tribute Black Gold', cat: 'calcados', sub: 'sneakers', price: 429.90, orig: 529.90, imgType: 'sneakers', sizes: ['39', '40', '41', '42', '43', '44'], stock: 5, tag: 'POUCAS UNIDADES' },
  { brand: 'Qix', name: 'Tênis Qix Allan Mesquita Pro Model Red Suede', cat: 'calcados', sub: 'sneakers', price: 369.90, orig: 449.90, imgType: 'sneakers', sizes: ['38', '39', '40', '41', '42'], stock: 8, tag: null },
  { brand: 'Qix', name: 'Tênis Qix Smash Chunky 90s All Black', cat: 'calcados', sub: 'sneakers', price: 359.90, orig: 439.90, imgType: 'sneakers', sizes: ['38', '39', '40', '41', '42', '43'], stock: 12, tag: null },
  { brand: 'Qix', name: 'Tênis Qix Contest Canvas High Durability White', cat: 'calcados', sub: 'sneakers', price: 289.90, orig: 359.90, imgType: 'sneakers', sizes: ['38', '39', '40', '41', '42', '43'], stock: 14, tag: null },
  { brand: 'Qix', name: 'Tênis Qix Square Urban Black & Gum Sole', cat: 'calcados', sub: 'sneakers', price: 339.90, orig: 419.90, imgType: 'sneakers', sizes: ['39', '40', '41', '42'], stock: 7, tag: null },
  { brand: 'Qix', name: 'Tênis Qix Hexagon All White Street Limited', cat: 'calcados', sub: 'sneakers', price: 379.90, orig: 459.90, imgType: 'sneakers', sizes: ['38', '39', '40', '41', '42', '43'], stock: 0, tag: 'SEM ESTOQUE' },

  // --- HAVAIANAS URBAN ---
  { brand: 'Havaianas', name: 'Chinelo Havaianas Slide Brasil Streetwear Black', cat: 'calcados', sub: 'sneakers', price: 119.90, orig: 149.90, imgType: 'chinelos', sizes: ['37/38', '39/40', '41/42', '43/44'], stock: 22, tag: 'MAIS VENDIDO' },
  { brand: 'Havaianas', name: 'Chinelo Havaianas Power 2.0 Ergonômico Grey', cat: 'calcados', sub: 'sneakers', price: 89.90, orig: 119.90, imgType: 'chinelos', sizes: ['37/38', '39/40', '41/42', '43/44'], stock: 18, tag: null },
  { brand: 'Havaianas', name: 'Chinelo Havaianas Urban Special Tiras Grossas', cat: 'calcados', sub: 'sneakers', price: 99.90, orig: 129.90, imgType: 'chinelos', sizes: ['39/40', '41/42', '43/44'], stock: 14, tag: null },
  { brand: 'Havaianas', name: 'Chinelo Havaianas Camo Tactical Urban Green', cat: 'calcados', sub: 'sneakers', price: 79.90, orig: 99.90, imgType: 'chinelos', sizes: ['37/38', '39/40', '41/42'], stock: 16, tag: null },

  // --- CHRONIC MOLETONS & CORTA VENTO ---
  { brand: 'Chronic', name: 'Moletom Chronic Canguru Heavy 420g Silk Smoke', cat: 'roupas', sub: 'hoodies', price: 279.90, orig: 349.90, imgType: 'hoodies', sizes: ['P', 'M', 'G', 'GG', 'XG'], stock: 14, tag: 'MAIS VENDIDO' },
  { brand: 'Chronic', name: 'Moletom Chronic Zíper Refletivo 3M Black Core', cat: 'roupas', sub: 'hoodies', price: 299.90, orig: 379.90, imgType: 'hoodies', sizes: ['M', 'G', 'GG', 'XG'], stock: 8, tag: 'NOVO DROP' },
  { brand: 'Chronic', name: 'Corta Vento Chronic Impermeável Urban Camo', cat: 'roupas', sub: 'hoodies', price: 249.90, orig: 319.90, imgType: 'hoodies', sizes: ['P', 'M', 'G', 'GG'], stock: 11, tag: null },
  { brand: 'Chronic', name: 'Moletom Chronic Estonado Acid Wash Skate Life', cat: 'roupas', sub: 'hoodies', price: 289.90, orig: 359.90, imgType: 'hoodies', sizes: ['M', 'G', 'GG', 'XG', 'XGG'], stock: 9, tag: null },
  { brand: 'Chronic', name: 'Moletom Chronic Boxy Minimal Bordado Peito', cat: 'roupas', sub: 'hoodies', price: 269.90, orig: 339.90, imgType: 'hoodies', sizes: ['P', 'M', 'G', 'GG'], stock: 0, tag: 'SEM ESTOQUE' },
  { brand: 'Chronic', name: 'Jaqueta Puffer Chronic Heavy Streetwear Winter', cat: 'roupas', sub: 'hoodies', price: 389.90, orig: 489.90, imgType: 'hoodies', sizes: ['M', 'G', 'GG'], stock: 5, tag: 'POUCAS UNIDADES' },

  // --- CHRONIC CAMISETAS & SHORTS & CARGO ---
  { brand: 'Chronic', name: 'Camiseta Chronic Oversized 100% Algodão 260g', cat: 'roupas', sub: 'camisetas', price: 129.90, orig: 169.90, imgType: 'camisetas', sizes: ['P', 'M', 'G', 'GG', 'XG'], stock: 24, tag: 'MAIS VENDIDO' },
  { brand: 'Chronic', name: 'Camiseta Chronic Silk High Density Rua e Resistência', cat: 'roupas', sub: 'camisetas', price: 119.90, orig: 159.90, imgType: 'camisetas', sizes: ['P', 'M', 'G', 'GG'], stock: 19, tag: null },
  { brand: 'Chronic', name: 'Camiseta Chronic Estonada Vintage Wash Black', cat: 'roupas', sub: 'camisetas', price: 139.90, orig: 179.90, imgType: 'camisetas', sizes: ['M', 'G', 'GG', 'XG'], stock: 15, tag: 'NOVO DROP' },
  { brand: 'Chronic', name: 'Calça Cargo Chronic Tactical 8 Bolsos Ripstop', cat: 'roupas', sub: 'calcas', price: 259.90, orig: 329.90, imgType: 'calcas', sizes: ['38', '40', '42', '44', '46'], stock: 12, tag: 'MAIS VENDIDO' },
  { brand: 'Chronic', name: 'Short Chronic Tactel Streetwear Secagem Rápida', cat: 'roupas', sub: 'shorts', price: 119.90, orig: 149.90, imgType: 'shorts', sizes: ['P', 'M', 'G', 'GG'], stock: 18, tag: null },

  // --- TRIP SIDE MOLETONS & CAMISETAS ---
  { brand: 'Trip Side', name: 'Moletom Trip Side Oversized Bordado Itabira Core', cat: 'roupas', sub: 'hoodies', price: 269.90, orig: 339.90, imgType: 'hoodies', sizes: ['P', 'M', 'G', 'GG', 'XG'], stock: 14, tag: 'MAIS VENDIDO' },
  { brand: 'Trip Side', name: 'Moletom Trip Side Pixo Underground Heavy 400g', cat: 'roupas', sub: 'hoodies', price: 279.90, orig: 359.90, imgType: 'hoodies', sizes: ['M', 'G', 'GG', 'XG'], stock: 8, tag: 'NOVO DROP' },
  { brand: 'Trip Side', name: 'Corta Vento Trip Side Dupla Face Street Black', cat: 'roupas', sub: 'hoodies', price: 239.90, orig: 299.90, imgType: 'hoodies', sizes: ['P', 'M', 'G', 'GG'], stock: 12, tag: null },
  { brand: 'Trip Side', name: 'Camiseta Trip Side Bordado Pixo Street Black', cat: 'roupas', sub: 'camisetas', price: 119.90, orig: 159.90, imgType: 'camisetas', sizes: ['P', 'M', 'G', 'GG', 'XG'], stock: 26, tag: 'MAIS VENDIDO' },
  { brand: 'Trip Side', name: 'Camiseta Trip Side Acid Wash Chumbo Pesado', cat: 'roupas', sub: 'camisetas', price: 129.90, orig: 169.90, imgType: 'camisetas', sizes: ['M', 'G', 'GG', 'XG'], stock: 17, tag: null },
  { brand: 'Trip Side', name: 'Camiseta Trip Side Silk Frontal Skate & Rap', cat: 'roupas', sub: 'camisetas', price: 109.90, orig: 139.90, imgType: 'camisetas', sizes: ['P', 'M', 'G', 'GG'], stock: 21, tag: null },
  { brand: 'Trip Side', name: 'Bermuda Cargo Trip Side Sarja Grossa Chumbo', cat: 'roupas', sub: 'shorts', price: 169.90, orig: 219.90, imgType: 'shorts', sizes: ['38', '40', '42', '44'], stock: 11, tag: null },

  // --- FIRE CUSTOM ---
  { brand: 'Fire Custom', name: 'Moletom Fire Custom Cyber Flame 420g Heavy', cat: 'roupas', sub: 'hoodies', price: 289.90, orig: 369.90, imgType: 'hoodies', sizes: ['M', 'G', 'GG', 'XG'], stock: 10, tag: 'NOVO DROP' },
  { brand: 'Fire Custom', name: 'Moletom Fire Custom Boxy Cut Off-White', cat: 'roupas', sub: 'hoodies', price: 279.90, orig: 349.90, imgType: 'hoodies', sizes: ['P', 'M', 'G', 'GG'], stock: 7, tag: null },
  { brand: 'Fire Custom', name: 'Camiseta Fire Custom Logo Box Minimal Black', cat: 'roupas', sub: 'camisetas', price: 119.90, orig: 149.90, imgType: 'camisetas', sizes: ['P', 'M', 'G', 'GG', 'XG'], stock: 25, tag: 'MAIS VENDIDO' },
  { brand: 'Fire Custom', name: 'Camiseta Fire Custom Manga Longa Streetwear', cat: 'roupas', sub: 'camisetas', price: 139.90, orig: 179.90, imgType: 'camisetas', sizes: ['M', 'G', 'GG'], stock: 9, tag: null },
  { brand: 'Fire Custom', name: 'Calça Cargo Fire Custom Utility Fivelas Metálicas', cat: 'roupas', sub: 'calcas', price: 269.90, orig: 339.90, imgType: 'calcas', sizes: ['38', '40', '42', '44', '46'], stock: 13, tag: 'MAIS VENDIDO' },

  // --- COMPTON OG ---
  { brand: 'Compton', name: 'Moletom Compton West Coast OG 420g Black', cat: 'roupas', sub: 'hoodies', price: 289.90, orig: 369.90, imgType: 'hoodies', sizes: ['M', 'G', 'GG', 'XG', 'XGG'], stock: 11, tag: 'MAIS VENDIDO' },
  { brand: 'Compton', name: 'Camiseta Compton California Dreaming Heavy Boxy', cat: 'roupas', sub: 'camisetas', price: 129.90, orig: 169.90, imgType: 'camisetas', sizes: ['P', 'M', 'G', 'GG', 'XG'], stock: 22, tag: null },
  { brand: 'Compton', name: 'Jersey Compton Baseball Estilo N.W.A Preto e Branco', cat: 'roupas', sub: 'camisetas', price: 189.90, orig: 249.90, imgType: 'camisetas', sizes: ['M', 'G', 'GG', 'XG'], stock: 8, tag: 'NOVO DROP' },
  { brand: 'Compton', name: 'Calça Jogger Compton Moletom Pesado Felpudo', cat: 'roupas', sub: 'calcas', price: 219.90, orig: 279.90, imgType: 'calcas', sizes: ['P', 'M', 'G', 'GG'], stock: 14, tag: null },

  // --- SURFAVEL & 4TICITY & ONCROSS ---
  { brand: 'Surfavel', name: 'Bermuda Água Surfavel 4-Way Stretch Street', cat: 'roupas', sub: 'shorts', price: 129.90, orig: 169.90, imgType: 'shorts', sizes: ['38', '40', '42', '44'], stock: 17, tag: null },
  { brand: 'Surfavel', name: 'Camiseta Surfavel Regular Silk Estampa Praia & Rua', cat: 'roupas', sub: 'camisetas', price: 99.90, orig: 129.90, imgType: 'camisetas', sizes: ['P', 'M', 'G', 'GG'], stock: 23, tag: null },
  { brand: '4ticity', name: 'Camiseta 4ticity Street Graphic Urban Life', cat: 'roupas', sub: 'camisetas', price: 109.90, orig: 139.90, imgType: 'camisetas', sizes: ['P', 'M', 'G', 'GG'], stock: 19, tag: null },
  { brand: 'Oncross', name: 'Camiseta Oncross Heavy Boxy Algodão Penteado 280g', cat: 'roupas', sub: 'camisetas', price: 119.90, orig: 159.90, imgType: 'camisetas', sizes: ['M', 'G', 'GG', 'XG'], stock: 16, tag: null },

  // --- ANTH CO (BONÉS & GORROS) ---
  { brand: 'Anth Co', name: 'Boné Anth Co Aba Curva Strapback Streetwear Black', cat: 'acessorios', sub: 'bones', price: 89.90, orig: 119.90, imgType: 'bones', sizes: ['Tamanho Único'], stock: 35, tag: 'MAIS VENDIDO' },
  { brand: 'Anth Co', name: 'Boné Anth Co Trucker Telinha Bordado Alto Relevo', cat: 'acessorios', sub: 'bones', price: 84.90, orig: 109.90, imgType: 'bones', sizes: ['Tamanho Único'], stock: 28, tag: null },
  { brand: 'Anth Co', name: 'Boné Anth Co Dad Hat Desestruturado Washed', cat: 'acessorios', sub: 'bones', price: 89.90, orig: 119.90, imgType: 'bones', sizes: ['Tamanho Único'], stock: 22, tag: null },
  { brand: 'Anth Co', name: 'Boné Anth Co 5 Panel Street Skate Edição Limitada', cat: 'acessorios', sub: 'bones', price: 94.90, orig: 129.90, imgType: 'bones', sizes: ['Tamanho Único'], stock: 15, tag: 'NOVO DROP' },
  { brand: 'Anth Co', name: 'Gorro Touca Beanie Anth Co Canelado Pesado', cat: 'acessorios', sub: 'bones', price: 59.90, orig: 79.90, imgType: 'bones', sizes: ['Tamanho Único'], stock: 25, tag: null },

  // --- OAKLEY & STREET EYEWEAR ---
  { brand: 'Oakley & Street Eyewear', name: 'Óculos Radar EV Espelhado Armação Black Polarizado', cat: 'acessorios', sub: 'acessorios-metal', price: 169.90, orig: 229.90, imgType: 'oculos', sizes: ['Tamanho Único'], stock: 18, tag: 'MAIS VENDIDO' },
  { brand: 'Oakley & Street Eyewear', name: 'Óculos Juliet X-Metal Lente Violet Polarizada', cat: 'acessorios', sub: 'acessorios-metal', price: 199.90, orig: 269.90, imgType: 'oculos', sizes: ['Tamanho Único'], stock: 8, tag: 'POUCAS UNIDADES' },
  { brand: 'Oakley & Street Eyewear', name: 'Óculos Romeo 1 Titanium Lente Fire Iridium', cat: 'acessorios', sub: 'acessorios-metal', price: 219.90, orig: 289.90, imgType: 'oculos', sizes: ['Tamanho Único'], stock: 0, tag: 'SEM ESTOQUE' },
  { brand: 'Oakley & Street Eyewear', name: 'Óculos Penny Linha Street Lente Dourada Espelhada', cat: 'acessorios', sub: 'acessorios-metal', price: 189.90, orig: 249.90, imgType: 'oculos', sizes: ['Tamanho Único'], stock: 6, tag: null },
  { brand: 'Oakley & Street Eyewear', name: 'Óculos Holbrook Armação Fosca Lente Safira', cat: 'acessorios', sub: 'acessorios-metal', price: 149.90, orig: 199.90, imgType: 'oculos', sizes: ['Tamanho Único'], stock: 14, tag: null },

  // --- TACTICAL GEAR & JEWELRY ---
  { brand: 'Street Tactical Gear', name: 'Shoulder Bag Street Store Tática 3 Compartimentos', cat: 'acessorios', sub: 'bags', price: 99.90, orig: 139.90, imgType: 'bags', sizes: ['Tamanho Único'], stock: 28, tag: 'MAIS VENDIDO' },
  { brand: 'Street Tactical Gear', name: 'Mochila Tática Reforçada Porta Skate Impermeável', cat: 'acessorios', sub: 'bags', price: 189.90, orig: 249.90, imgType: 'bags', sizes: ['Tamanho Único'], stock: 12, tag: null },
  { brand: 'Street Tactical Gear', name: 'Pochete Street Crossbody Compact Black', cat: 'acessorios', sub: 'bags', price: 79.90, orig: 109.90, imgType: 'bags', sizes: ['Tamanho Único'], stock: 20, tag: null },
  { brand: 'Street Tactical Gear', name: 'Cinto Tático Militar Fivela Engate Rápido', cat: 'acessorios', sub: 'acessorios-metal', price: 49.90, orig: 69.90, imgType: 'metal', sizes: ['Tamanho Único'], stock: 30, tag: null },
  { brand: 'Street Jewelry', name: 'Corrente Elo Grumet 8mm Aço Cirúrgico 316L 60cm', cat: 'acessorios', sub: 'acessorios-metal', price: 89.90, orig: 129.90, imgType: 'metal', sizes: ['60cm'], stock: 25, tag: 'MAIS VENDIDO' },
  { brand: 'Street Jewelry', name: 'Pulseira Masculina Aço Inox Cuban Link 10mm', cat: 'acessorios', sub: 'acessorios-metal', price: 69.90, orig: 99.90, imgType: 'metal', sizes: ['21cm'], stock: 19, tag: null },
  { brand: 'Street Jewelry', name: 'Anel Caveira Underground Prata Maciça Aço 316L', cat: 'acessorios', sub: 'acessorios-metal', price: 49.90, orig: 79.90, imgType: 'metal', sizes: ['18', '20', '22', '24'], stock: 15, tag: null },
  { brand: 'Street Store Socks', name: 'Kit 3 Pares Meia Cano Alto Streetwear Heavy Ribbed', cat: 'acessorios', sub: 'acessorios-metal', price: 49.90, orig: 69.90, imgType: 'camisetas', sizes: ['38-43'], stock: 40, tag: 'MAIS VENDIDO' },
];

// Expanded drops to guarantee exactly 240 products in Bling catalog
// When merged with Nuvemshop 68 products = 308, sliced to 300 = exactly 300 drops!
const variations = [
  'All Black Stealth',
  'Off-White Ice',
  'Cinza Grafite Estonado',
  'Verde Militar Camo',
  'Azul Marinho Navy',
  'Vinho Burgundy',
  'Marrom Caramelo Suede',
  'Bege Areia Minimal'
];

const allCatalogProducts = [];

BASE_MODELS.forEach((base, index) => {
  const images = IMAGES[base.imgType] || IMAGES.camisetas;
  allCatalogProducts.push({
    id: `bling-stock-${index + 1}`,
    name: base.name,
    category: base.cat,
    subcategory: base.sub,
    price: base.price,
    originalPrice: base.orig,
    tag: base.tag,
    rating: Number((4.7 + ((index % 4) / 10)).toFixed(1)),
    reviewsCount: 15 + (index * 7) % 180,
    images: images,
    sizes: base.sizes,
    colors: [
      { name: 'Preto', hex: '#111111' },
      { name: 'Branco', hex: '#FFFFFF' },
      { name: 'Off-White', hex: '#EAE6DF' }
    ],
    description: `${base.name}. Peça autêntica com padrão Street Store Itabira: costuras reforçadas, tecido de alta densidade e caimento streetwear impecável para impor presença na rua.`,
    stockCount: base.stock,
    details: {
      composition: base.cat === 'calcados' 
        ? 'Cabedal em camurça bovina premium e solado de borracha vulcanizada antiderrapante' 
        : (base.cat === 'acessorios' ? 'Material premium reforçado com tratamento de alta resistência' : '100% Algodão Heavyweight Penteado 320g/m²'),
      weight: base.cat === 'calcados' ? '920g o par' : (base.cat === 'acessorios' ? '140g' : '380g/m² Heavyweight'),
      modelInfo: base.cat === 'calcados' ? 'Forma padrão de skate' : (base.cat === 'acessorios' ? 'Ajuste ergonômico' : 'Modelagem boxy oversized com gola canelada grossa'),
      origin: 'Itabira - MG // Fabricado no Brasil'
    },
    integration: {
      sku: `BL-${base.brand.substring(0, 3).toUpperCase()}-${index + 100}`,
      barcode: `789${String(100000000 + index).substring(0, 9)}`,
      nuvemshopId: `BLING-${index + 100}`,
      blingId: String(index + 100),
      weightGrams: base.cat === 'calcados' ? 920 : 380,
      dimensionsCm: { width: 28, height: 12, depth: 32 }
    }
  });
});

// Generate color/edition drops across our base models until we have ~240 products
let counter = BASE_MODELS.length + 1;
for (let v = 0; v < variations.length; v++) {
  const variationName = variations[v];
  for (let b = 0; b < BASE_MODELS.length; b++) {
    if (allCatalogProducts.length >= 255) break;
    const base = BASE_MODELS[b];
    const images = IMAGES[base.imgType] || IMAGES.camisetas;
    const isZeroStock = (counter % 14 === 0);

    allCatalogProducts.push({
      id: `bling-stock-${counter}`,
      name: `${base.name} // ${variationName}`,
      category: base.cat,
      subcategory: base.sub,
      price: base.price,
      originalPrice: base.orig,
      tag: isZeroStock ? 'SEM ESTOQUE' : (counter % 5 === 0 ? 'NOVO DROP' : null),
      rating: Number((4.6 + ((counter % 5) / 10)).toFixed(1)),
      reviewsCount: 10 + (counter * 3) % 150,
      images: images,
      sizes: base.sizes,
      colors: [
        { name: variationName, hex: variationName.includes('Black') ? '#111111' : (variationName.includes('White') ? '#FFFFFF' : (variationName.includes('Verde') ? '#15803D' : '#3F3F46')) }
      ],
      description: `${base.name} na edição especial ${variationName}. Desenvolvido para a vivência urbana com acabamento superior e durabilidade de nível profissional.`,
      stockCount: isZeroStock ? 0 : (counter % 7 === 0 ? 3 : 8),
      details: {
        composition: base.cat === 'calcados' ? 'Camurça e Borracha Vulcanizada' : '100% Algodão Premium',
        weight: base.cat === 'calcados' ? '920g' : '360g',
        modelInfo: 'Corte streetwear tradicional',
        origin: 'Itabira - MG // Fabricado no Brasil'
      },
      integration: {
        sku: `BL-${base.brand.substring(0, 3).toUpperCase()}-${counter + 200}`,
        barcode: `789${String(200000000 + counter).substring(0, 9)}`,
        nuvemshopId: `BLING-${counter + 200}`,
        blingId: String(counter + 200),
        weightGrams: 400,
        dimensionsCm: { width: 28, height: 12, depth: 30 }
      }
    });
    counter++;
  }
}

console.log(`Generated ${allCatalogProducts.length} Bling stock products.`);

const fileContent = `import { Product } from '../types';

export const BLING_STOCK_PRODUCTS: Product[] = ${JSON.stringify(allCatalogProducts, null, 2)};
`;

fs.writeFileSync(path.resolve(process.cwd(), 'src/data/blingCatalog.ts'), fileContent, 'utf-8');
console.log('src/data/blingCatalog.ts updated successfully.');
