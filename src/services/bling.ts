export interface BlingStatus {
  connected: boolean;
  clientId?: string;
  scope?: string;
  hasRefreshToken?: boolean;
  isExpired?: boolean;
  expiresAt?: string;
  obtainedAt?: string;
  authorizeUrl?: string;
}

export interface BlingProduct {
  id: string;
  blingId: number;
  name: string;
  code: string;
  sku: string;
  price: number;
  stock: number;
  status: string;
  format?: string;
  type?: string;
  shortDescription?: string;
  imageUrl?: string;
}

export interface BlingOrder {
  id: number;
  numero: number;
  data: string;
  total: number;
  situacao: string | number;
  cliente: string;
  documento?: string;
  itens: Array<{
    codigo: string;
    descricao: string;
    quantidade: number;
    valor: number;
  }>;
}

// Exemplo de adaptação no bling.ts para buscar produtos com paginação
export async function getAllBlingProducts(accessToken: string): Promise<BlingProduct[]> {
  let allProducts: BlingProduct[] = [];
  let page = 1;
  let hasMore = true;
  const limit = 100; // Máximo recomendado por requisição na API v3 do Bling

  try {
    while (hasMore) {
      const response = await fetch(`https://api.bling.com.br/Api/v3/produtos?pagina=${page}&limite=${limit}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar produtos do Bling: ${response.statusText}`);
      }

      const data = await response.json();
      const products = data.data || [];

      if (products.length > 0) {
        allProducts = [...allProducts, ...products];
        page++;
        
        // Se a quantidade retornada for menor que o limite, chegamos ao fim
        if (products.length < limit) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    return allProducts;
  } catch (error) {
    console.error("Erro na sincronização completa de produtos do Bling:", error);
    throw error;
  }
}