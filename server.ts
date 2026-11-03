import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import QRCode from 'qrcode';
import { registerBlingRoutes, fetchFromBling, loadBlingTokens } from './server-bling';
import { BLING_STOCK_PRODUCTS } from './src/data/blingCatalog';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Nuvemshop Credentials
const NUVEMSHOP_USER_ID = process.env.NUVEMSHOP_USER_ID || '6486155';
const NUVEMSHOP_ACCESS_TOKEN = process.env.NUVEMSHOP_ACCESS_TOKEN || 'e2ec763eeec1a6dd2c1b07e00cddad99ff1bf133';
const NUVEMSHOP_USER_AGENT = process.env.NUVEMSHOP_USER_AGENT || 'StreetStore (streetstore364@gmail.com)';
const NUVEMSHOP_API_BASE = 'https://api.nuvemshop.com.br/v1';

// Mercado Pago Credentials
const MERCADO_PAGO_PUBLIC_KEY = process.env.MERCADO_PAGO_PUBLIC_KEY || 'APP_USR-b72ab0f6-ad03-4238-9070-602d5bfd942a';
const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-1812187507012211-102712-308c387108d8d06e1d2de659247d0294-2461933848';
const MERCADO_PAGO_CLIENT_ID = process.env.MERCADO_PAGO_CLIENT_ID || '1812187507012211';
const MERCADO_PAGO_CLIENT_SECRET = process.env.MERCADO_PAGO_CLIENT_SECRET || 'TOLV7NTDfnsd0F1HsbQFwU2CmOfXG1z9';
const MERCADO_PAGO_API_BASE = 'https://api.mercadopago.com';

async function fetchFromNuvemshop(endpoint: string, options: RequestInit = {}) {
  const url = `${NUVEMSHOP_API_BASE}/${NUVEMSHOP_USER_ID}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authentication': `bearer ${NUVEMSHOP_ACCESS_TOKEN}`,
      'User-Agent': NUVEMSHOP_USER_AGENT,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Nuvemshop API error [${response.status}]: ${errorText}`);
  }

  return response.json();
}

// Robust HTML cleaning function that strips <p>, <br>, tags and entities
function cleanDescription(raw?: string): string {
  if (!raw) return '';
  let text = String(raw);
  text = text
    .replace(/</gi, '<')
    .replace(/>/gi, '>')
    .replace(/"/gi, '"')
    .replace(/'/gi, "'")
    .replace(/&/gi, '&');

  text = text
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<div[^>]*>/gi, '')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]*>?/gm, '')
    .replace(/ /gi, ' ')
    .replace(/&[a-zA-Z0-9#]+;/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text;
}

const COLOR_PALETTE: { name: string; regex: RegExp; hex: string }[] = [
  { name: 'Preto', regex: /\b(preto|preta|black|all black|negro)\b/i, hex: '#111111' },
  { name: 'Branco', regex: /\b(branco|branca|white)\b/i, hex: '#FFFFFF' },
  { name: 'Off-White', regex: /\b(off white|off-white|off withe|off)\b/i, hex: '#EAE6DF' },
  { name: 'Cinza', regex: /\b(cinza|grey|gray|chumbo|grafite|estonado|estonada)\b/i, hex: '#6B7280' },
  { name: 'Azul', regex: /\b(azul|navy|blue|safira|jeans|marinho)\b/i, hex: '#1E3A8A' },
  { name: 'Verde', regex: /\b(verde|green|militar|musgo)\b/i, hex: '#14532D' },
  { name: 'Vermelho', regex: /\b(vermelho|vermelha|red)\b/i, hex: '#DC2626' },
  { name: 'Rosa / Rose Gold', regex: /\b(rosa|pink|rose|rose gold)\b/i, hex: '#F472B6' },
  { name: 'Roxo', regex: /\b(roxo|roxa|purple)\b/i, hex: '#6B21A8' },
  { name: 'Marrom / Bege', regex: /\b(marrom|brown|caramelo|bege|areia|khaki)\b/i, hex: '#78350F' },
  { name: 'Prata', regex: /\b(prata|prateado|prateada|silver)\b/i, hex: '#9CA3AF' },
  { name: 'Dourado', regex: /\b(dourado|dourada|ouro|gold)\b/i, hex: '#F59E0B' },
  { name: 'Amarelo', regex: /\b(amarelo|amarela|yellow)\b/i, hex: '#EAB308' },
  { name: 'Laranja', regex: /\b(laranja|orange)\b/i, hex: '#EA580C' }
];

function detectColorFromName(name: string): { name: string; hex: string } | null {
  for (const c of COLOR_PALETTE) {
    if (c.regex.test(name)) {
      return { name: c.name, hex: c.hex };
    }
  }
  return null;
}

function mapCategoryAndSubcategory(
  productName: string,
  categories?: Array<{ name?: { pt?: string } | string }>
): { category: 'roupas' | 'calcados' | 'acessorios'; subcategory: 'hoodies' | 'camisetas' | 'calcas' | 'shorts' | 'sneakers' | 'bones' | 'bags' | 'acessorios-metal' } {
  const allCatNames = (categories || [])
    .map(c => (typeof c.name === 'object' && c.name?.pt ? c.name.pt : (c.name || '')))
    .join(' ')
    .toLowerCase();

  const titleLower = productName.toLowerCase();
  const text = `${allCatNames} ${titleLower}`;

  if (text.includes('boné') || text.includes('bone') || text.includes('bucket') || text.includes('gorro')) {
    return { category: 'acessorios', subcategory: 'bones' };
  }
  if (text.includes('bag') || text.includes('shoulder') || text.includes('mochila') || text.includes('pochete') || text.includes('mala')) {
    return { category: 'acessorios', subcategory: 'bags' };
  }
  if (
    text.includes('óculos') || text.includes('oculos') || 
    text.includes('radar') || text.includes('juliet') || text.includes('penny') ||
    text.includes('oakley') || text.includes('cartier') || text.includes('descanço') || text.includes('descanso') ||
    text.includes('cinto') || text.includes('carteira') || text.includes('relógio') || text.includes('relogio') || 
    text.includes('isqueiro') || text.includes('corrente') || text.includes('chaveiro') || text.includes('anel') || text.includes('pulseira') ||
    titleLower.includes('meia') || titleLower.includes('cadarço') || titleLower.includes('cadarco') || titleLower.includes('lace')
  ) {
    return { category: 'acessorios', subcategory: 'acessorios-metal' };
  }

  if (text.includes('tênis') || text.includes('tenis') || text.includes('sneaker') || text.includes('chinelo') || text.includes('calçado') || text.includes('calcado')) {
    return { category: 'calcados', subcategory: 'sneakers' };
  }

  if (text.includes('moletom') || text.includes('hoodie') || text.includes('jaqueta') || text.includes('corta vento') || text.includes('casaco')) {
    return { category: 'roupas', subcategory: 'hoodies' };
  }
  if (text.includes('calça') || text.includes('calca') || text.includes('cargo') || text.includes('jogger')) {
    return { category: 'roupas', subcategory: 'calcas' };
  }
  if (text.includes('bermuda') || text.includes('short')) {
    return { category: 'roupas', subcategory: 'shorts' };
  }

  return { category: 'roupas', subcategory: 'camisetas' };
}

// API Routes
app.get('/api/nuvemshop/status', async (_req: Request, res: Response) => {
  try {
    const storeInfo = await fetchFromNuvemshop('/store');
    res.json({
      connected: true,
      storeId: NUVEMSHOP_USER_ID,
      name: storeInfo.name?.pt || storeInfo.name || 'Street Store',
      url: storeInfo.url_with_protocol || 'https://www.streetstore.com.br',
      email: storeInfo.email || 'streetstore364@gmail.com'
    });
  } catch (error: any) {
    res.status(500).json({
      connected: false,
      error: error.message || 'Falha ao conectar com Nuvemshop'
    });
  }
});

app.get('/api/nuvemshop/products', async (_req: Request, res: Response) => {
  try {
    // 1. Fetch robusto da Nuvemshop com paginação em loop (até 10 páginas / 1000 itens)
    let rawProducts: any[] = [];
    let nuvemPage = 1;
    let hasMoreNuvem = true;

    while (hasMoreNuvem && nuvemPage <= 10) {
      try {
        const pageData = await fetchFromNuvemshop(`/products?per_page=100&page=${nuvemPage}&published=true`);
        if (Array.isArray(pageData) && pageData.length > 0) {
          rawProducts.push(...pageData);
          if (pageData.length < 100) {
            hasMoreNuvem = false;
          } else {
            nuvemPage++;
          }
        } else {
          hasMoreNuvem = false;
        }
      } catch {
        hasMoreNuvem = false;
      }
    }

    console.log(`[Nuvemshop Sync] Total bruto carregado da Nuvemshop: ${rawProducts.length}`);

    // Deduplicate Nuvemshop products by normalized title
    const deduplicatedRawProducts: any[] = [];
    const seenNuvemTitles = new Map<string, any>();

    rawProducts.forEach((p) => {
      const rawTitle = (p.name?.pt || p.name || 'Produto Street Store').trim();
      const normKey = rawTitle.toLowerCase().replace(/\s+/g, ' ');

      if (!seenNuvemTitles.has(normKey)) {
        seenNuvemTitles.set(normKey, p);
        deduplicatedRawProducts.push(p);
      } else {
        const canonical = seenNuvemTitles.get(normKey);
        if (Array.isArray(p.images) && Array.isArray(canonical.images)) {
          p.images.forEach((img: any) => {
            const hasImg = canonical.images.some((ci: any) => ci.src === img.src || ci.id === img.id);
            if (!hasImg) canonical.images.push(img);
          });
        }
        if (Array.isArray(p.variants) && Array.isArray(canonical.variants)) {
          p.variants.forEach((v: any) => {
            const hasVariant = canonical.variants.some((cv: any) => cv.sku === v.sku || cv.id === v.id);
            if (!hasVariant) canonical.variants.push(v);
          });
        }
      }
    });

    // Transform into frontend Product schema
    const products = deduplicatedRawProducts.map((p, idx) => {
      const name = p.name?.pt || p.name || 'Produto Street Store';
      const variants = p.variants || [];
      const firstVariant = variants[0] || {};
      
      const priceVal = parseFloat(firstVariant.promotional_price || firstVariant.price || '99.90');
      const comparePriceVal = parseFloat(firstVariant.compare_at_price || firstVariant.price || `${priceVal + 40}`);
      
      const sizesSet = new Set<string>();
      variants.forEach((v: any) => {
        if (v.values && v.values.length > 0) {
          v.values.forEach((val: any) => {
            const sizeStr = typeof val === 'object' ? val.pt || val.es || '' : String(val);
            if (sizeStr) sizesSet.add(sizeStr.trim());
          });
        }
      });

      const { category, subcategory } = mapCategoryAndSubcategory(name, p.categories);

      let finalSizes: string[] = [];
      if (sizesSet.size > 0) {
        const rawSizes = Array.from(sizesSet);
        const isNumeric = rawSizes.every(s => !isNaN(Number(s)));
        if (isNumeric) {
          finalSizes = rawSizes.sort((a, b) => Number(a) - Number(b));
        } else {
          const clothesOrder = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG', 'G1', 'G2', 'G3', 'G4'];
          finalSizes = rawSizes.sort((a, b) => {
            const idxA = clothesOrder.indexOf(a.toUpperCase());
            const idxB = clothesOrder.indexOf(b.toUpperCase());
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            return a.localeCompare(b);
          });
        }
      } else {
        finalSizes = ['Tamanho Único'];
      }

      const rawAttrs = (p.attributes || []).map((a: any) => (typeof a === 'object' && a.pt ? a.pt : (typeof a === 'string' ? a : ''))).join(' ');
      const combinedColorSearch = `${name} ${rawAttrs}`;

      const detectedColorsMap = new Map<string, { name: string; hex: string }>();
      for (const c of COLOR_PALETTE) {
        if (c.regex.test(combinedColorSearch)) {
          detectedColorsMap.set(c.name, { name: c.name, hex: c.hex });
        }
      }

      let finalColors: { name: string; hex: string }[] = [];
      if (detectedColorsMap.size > 0) {
        finalColors = Array.from(detectedColorsMap.values());
      } else {
        finalColors = [{ name: 'Cor Única', hex: '#1C1C1C' }];
      }

      const images: string[] = (p.images && p.images.length > 0)
        ? p.images.map((img: any) => img.src)
        : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=85'];

      const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock ?? 0), 0);

      let tag: 'NOVO DROP' | 'MAIS VENDIDO' | 'POUCAS UNIDADES' | null = null;
      if (totalStock > 0 && totalStock <= 3) {
        tag = 'POUCAS UNIDADES';
      } else if (idx < 6) {
        tag = 'NOVO DROP';
      } else if (idx % 3 === 0) {
        tag = 'MAIS VENDIDO';
      }

      const hash = String(p.id).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const rating = 4.8 + ((hash % 3) / 10);
      const reviewsCount = 18 + (hash % 60);

      const cleanedDesc = cleanDescription(p.description?.pt || p.description);

      return {
        id: `nuvem-${p.id}`,
        name,
        category,
        subcategory,
        price: isNaN(priceVal) ? 119.90 : priceVal,
        originalPrice: isNaN(comparePriceVal) || comparePriceVal <= priceVal ? priceVal * 1.3 : comparePriceVal,
        tag,
        rating,
        reviewsCount,
        images,
        sizes: finalSizes,
        colors: finalColors,
        description: cleanedDesc || 'Modelagem autêntica corte boxy, tecido robusto e caimento streetwear impecável.',
        stockCount: totalStock,
        details: {
          composition: category === 'calcados' ? 'Solado em borracha vulcanizada de alta durabilidade' : (category === 'acessorios' ? 'Material premium' : '100% Algodão Penteado Premium'),
          weight: category === 'calcados' ? '900g o par' : (category === 'acessorios' ? '120g' : '350g/m² Heavyweight'),
          modelInfo: category === 'acessorios' ? 'Tamanho ergonômico' : 'Modelagem autêntica corte boxy',
          origin: 'Nacional // Fabricado no Brasil',
        },
        integration: {
          sku: firstVariant.sku || `SKU-${p.id}`,
          barcode: firstVariant.barcode || `789${p.id}`,
          nuvemshopId: String(p.id),
          blingId: `BLING-${p.id}`,
          weightGrams: Math.round(parseFloat(firstVariant.weight || '0.350') * 1000),
          dimensionsCm: {
            width: parseFloat(firstVariant.width || '25'),
            height: parseFloat(firstVariant.height || '25'),
            depth: parseFloat(firstVariant.depth || '5'),
          },
        },
        canonicalUrl: p.canonical_url || `https://www.streetstore.com.br`,
        variantsList: variants.map((v: any) => ({
          id: v.id,
          sku: v.sku,
          price: parseFloat(v.promotional_price || v.price || '0'),
          comparePrice: parseFloat(v.compare_at_price || v.price || '0'),
          stock: v.stock || 0,
          size: v.values?.[0]?.pt || v.values?.[0] || 'Tamanho Único',
        })),
      };
    });

    // 2. Fetch robusto do Bling ERP em loop para atingir até 1191 itens agrupados sem duplicados
    try {
      const blingTokens = loadBlingTokens();
      if (blingTokens?.access_token) {
        const blingRaw: any[] = [];
        let blingPage = 1;
        let hasMoreBling = true;

        while (hasMoreBling && blingPage <= 15) {
          try {
            const pageData = await fetchFromBling(`/produtos?pagina=${blingPage}&limite=100`);
            const items = pageData?.data || [];
            if (items.length > 0) {
              blingRaw.push(...items);
              if (items.length < 100) {
                hasMoreBling = false;
              } else {
                blingPage++;
              }
            } else {
              hasMoreBling = false;
            }
          } catch {
            hasMoreBling = false;
          }
        }

        console.log(`[Bling Sync] Total bruto recolhido do Bling: ${blingRaw.length}`);

        const productGroups: Record<string, {
          id: number;
          baseName: string;
          items: any[];
          price: number;
          category: 'roupas' | 'calcados' | 'acessorios';
          subcategory: any;
        }> = {};

        blingRaw.forEach((bp: any) => {
          const rawName = (bp.nome || '').trim();
          const parts = rawName.split(':');
          const baseName = parts[0].trim();
          const groupKey = String(bp.idProdutoPai || baseName.toUpperCase());

          if (!productGroups[groupKey]) {
            const { category, subcategory } = mapCategoryAndSubcategory(baseName);
            productGroups[groupKey] = {
              id: bp.id,
              baseName,
              items: [],
              price: parseFloat(bp.preco || '99.90'),
              category,
              subcategory,
            };
          }
          productGroups[groupKey].items.push(bp);
        });

        const existingSkus = new Set(products.map(p => p.integration?.sku));
        const existingNames = new Set(products.map(p => p.name.toLowerCase().trim()));

        let addedFromBlingCount = 0;
        const groupedArray = Object.values(productGroups).slice(0, 1191);

        groupedArray.forEach((group, gIdx) => {
          const firstItem = group.items[0];
          const groupSku = firstItem?.codigo || `BLING-${group.id}`;
          const normalizedBaseName = group.baseName.toLowerCase().trim();

          if (existingNames.has(normalizedBaseName)) {
            const match = products.find(p => p.name.toLowerCase().trim() === normalizedBaseName);
            if (match) {
              const totalBlingStock = group.items.reduce((acc, it) => acc + (it.estoque?.saldoVirtualTotal || it.estoque?.saldoFisico || 0), 0);
              if (totalBlingStock > 0) match.stockCount = totalBlingStock;
              if (group.price > 0) match.price = group.price;
            }
            return;
          }

          const sizesList: string[] = [];
          group.items.forEach(it => {
            const parts = (it.nome || '').split(':');
            if (parts.length > 1) {
              const sz = parts[1].trim();
              if (sz && !sizesList.includes(sz)) sizesList.push(sz);
            }
          });

          let finalSizes: string[] = [];
          if (sizesList.length > 0) {
            const isNumericSizes = sizesList.every(s => !isNaN(Number(s)));
            if (isNumericSizes) {
              finalSizes = [...sizesList].sort((a, b) => Number(a) - Number(b));
            } else {
              const clothesOrder = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG', 'G1', 'G2', 'G3', 'G4'];
              finalSizes = [...sizesList].sort((a, b) => {
                const idxA = clothesOrder.indexOf(a.toUpperCase());
                const idxB = clothesOrder.indexOf(b.toUpperCase());
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                return a.localeCompare(b);
              });
            }
          } else {
            finalSizes = ['Tamanho Único'];
          }

          const detectedColorsMap = new Map<string, { name: string; hex: string }>();
          group.items.forEach(it => {
            const colorFound = detectColorFromName(it.nome || '');
            if (colorFound) {
              detectedColorsMap.set(colorFound.name, colorFound);
            }
          });

          let finalColors: { name: string; hex: string }[] = [];
          if (detectedColorsMap.size > 0) {
            finalColors = Array.from(detectedColorsMap.values());
          } else {
            finalColors = [{ name: 'Cor Única', hex: '#1C1C1C' }];
          }

          const totalStock = group.items.reduce((acc, it) => {
            const s = it.estoque?.saldoVirtualTotal ?? it.estoque?.saldoFisicoTotal ?? it.estoque?.saldoFisico ?? 5;
            return acc + (s > 0 ? s : 0);
          }, 0);

          let images: string[] = [
            '/src/assets/images/hero_streetwear_urban_1793275500555.jpg',
            'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=85'
          ];
          if (group.category === 'calcados') {
            images = [
              '/src/assets/images/product_sneaker_chunky_1793275501375.jpg',
              'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=85'
            ];
          } else if (group.subcategory === 'hoodies') {
            images = [
              '/src/assets/images/product_hoodie_oversized_1793275501387.jpg'
            ];
          } else if (group.category === 'acessorios') {
            images = [
              '/src/assets/images/product_chain_silver_1793275501382.jpg',
              '/src/assets/images/product_cap_streetwear_1793275501370.jpg'
            ];
          }

          const priceVal = isNaN(group.price) || group.price <= 0 ? 119.90 : group.price;
          const rawBlingDesc = firstItem?.descricaoCurta || firstItem?.descricaoComplementar || '';
          const cleanedBlingDesc = cleanDescription(rawBlingDesc) || `${group.baseName} - Produto autêntico da Street Store.`;

          products.push({
            id: `bling-${group.id}`,
            name: group.baseName,
            category: group.category,
            subcategory: group.subcategory,
            price: priceVal,
            originalPrice: Math.round(priceVal * 1.3),
            tag: totalStock > 0 && totalStock <= 3 ? 'POUCAS UNIDADES' : (gIdx < 4 ? 'NOVO DROP' : null),
            rating: 4.8 + ((group.id % 3) / 10),
            reviewsCount: 15 + (group.id % 40),
            images,
            sizes: finalSizes,
            colors: finalColors,
            description: cleanedBlingDesc,
            stockCount: totalStock > 0 ? totalStock : 8,
            details: {
              composition: group.category === 'calcados' ? 'Solado em borracha vulcanizada' : (group.category === 'acessorios' ? 'Material premium' : '100% Algodão Premium Heavyweight'),
              weight: group.category === 'calcados' ? '900g o par' : (group.category === 'acessorios' ? '120g' : '380g/m² Heavyweight'),
              modelInfo: group.category === 'acessorios' ? 'Formato ergonômico' : 'Modelagem autêntica',
              origin: 'Itabira - MG // Fabricado no Brasil',
            },
            integration: {
              sku: groupSku,
              barcode: firstItem?.codigo || `789${group.id}`,
              nuvemshopId: String(group.id),
              blingId: String(group.id),
              weightGrams: Math.round(parseFloat(firstItem?.pesoBruto || '0.450') * 1000),
              dimensionsCm: {
                width: parseFloat(firstItem?.largura || '28'),
                height: parseFloat(firstItem?.altura || '12'),
                depth: parseFloat(firstItem?.profundidade || '32'),
              },
            },
            canonicalUrl: 'https://www.streetstore.com.br',
            variantsList: group.items.map(it => {
              const szParts = (it.nome || '').split(':');
              const vSize = szParts.length > 1 ? szParts[1].trim() : (finalSizes[0] || 'Tamanho Único');
              return {
                id: it.id,
                sku: it.codigo || `${groupSku}-${vSize}`,
                price: parseFloat(it.preco || String(priceVal)),
                stock: it.estoque?.saldoVirtualTotal ?? it.estoque?.saldoFisico ?? 5,
                size: vSize
              };
            })
          });

          existingSkus.add(groupSku);
          existingNames.add(normalizedBaseName);
          addedFromBlingCount++;
        });

        console.log(`[Bling Sync] Sucesso: ${addedFromBlingCount} modelos únicos fundidos do Bling.`);
      }
    } catch (blingErr) {
      console.warn('[Catalog] Aviso no merge do Bling:', blingErr);
    }

    // 3. Garantir os produtos oficiais de stock local
    const finalExistingSkus = new Set(products.map(p => p.integration?.sku));
    const finalExistingNames = new Set(products.map(p => p.name.toLowerCase().trim().replace(/\s+/g, ' ')));

    BLING_STOCK_PRODUCTS.forEach(bp => {
      const normName = bp.name.toLowerCase().trim().replace(/\s+/g, ' ');
      if (!finalExistingNames.has(normName) && !finalExistingSkus.has(bp.integration.sku)) {
        products.push({
          ...bp,
          tag: bp.tag ?? null,
          variantsList: bp.variantsList || []
        } as any);
        finalExistingNames.add(normName);
        finalExistingSkus.add(bp.integration.sku);
      }
    });

    const finalProducts = products.slice(0, 1191);

    res.json({
      success: true,
      count: finalProducts.length,
      products: finalProducts
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao consultar produtos'
    });
  }
});

app.get('/api/nuvemshop/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await fetchFromNuvemshop('/categories');
    res.json({ success: true, categories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/nuvemshop/checkout-link', (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    const baseUrl = 'https://www.streetstore.com.br';
    
    if (items && items.length === 1 && items[0].variantId) {
      const url = `${baseUrl}/cart/add?variant_id=${items[0].variantId}&quantity=${items[0].quantity || 1}`;
      return res.json({ success: true, url });
    }

    return res.json({ success: true, url: `${baseUrl}/checkout` });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Newsletter Subscription
const newsletterSubscribers = new Set<string>();

app.post('/api/newsletter', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
      return res.status(400).json({
        success: false,
        error: 'Por favor, informe um e-mail válido para assinar a newsletter.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    newsletterSubscribers.add(cleanEmail);
    console.log(`[Newsletter] Novo assinante exclusivo Street Store: ${cleanEmail} (Total: ${newsletterSubscribers.size})`);

    return res.json({
      success: true,
      message: 'Inscrição confirmada! Você receberá todos os novos drops e descontos exclusivos.',
      couponCode: 'STREETVIP',
      discount: '15% OFF'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao processar inscrição na newsletter'
    });
  }
});

// Register Bling specific routes if any
registerBlingRoutes(app);

// Vite & Static file handler
async function setupViteOrStatic() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
        hmr: false,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
    console.log(`[Dev] Vite middleware attached (HMR disabled).`);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    
    // Catch-all que ignora rotas /api
    app.get(/^(?!\/api).*/, (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    
    console.log(`[Prod] Serving static files from ${distPath}`);
  }
}

setupViteOrStatic().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Para rodar localmente no teu PC
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Street Store Full-Stack Server running on port ${PORT}`);
  });
}

// Obrigatório para a Vercel processar as rotas da API em produção
export default app;