import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const code = process.argv[2];

if (!code) {
  console.log('Uso: node scripts/sync-bling.js <CODIGO_AUTORIZACAO_OU_TOKEN>');
  process.exit(1);
}

const clientId = process.env.BLING_CLIENT_ID || '66ada183edd39b7215178f3d05bbb4b13c013fdd';
const clientSecret = process.env.BLING_CLIENT_SECRET || '92efd4ff0b3ca6219adf7ecdc2df633bece0925c4f4c888f071065eaa046';
const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

async function run() {
  let cleanCode = code.trim();
  let accessToken = '';

  // Se o argumento passado já for um token direto ou um código de autorização
  if (cleanCode.length > 50 && !cleanCode.includes('code=')) {
    accessToken = cleanCode;
    console.log('Usando token fornecido diretamente.');
  } else {
    if (cleanCode.includes('code=')) {
      const params = new URLSearchParams(cleanCode.split('?')[1] || cleanCode);
      cleanCode = params.get('code') || cleanCode;
    }

    console.log('Trocando código no Bling:', cleanCode);

    try {
      const res = await fetch('https://api.bling.com.br/v3/oauth/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': '1.0'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: cleanCode
        }).toString()
      });

      const json = await res.json();
      console.log('Resposta do Bling:', json);

      if (json.access_token) {
        accessToken = json.access_token;
        const tokenData = {
          access_token: json.access_token,
          refresh_token: json.refresh_token,
          expires_in: json.expires_in || 21600,
          token_type: json.token_type || 'Bearer',
          scope: json.scope || '',
          obtained_at: Date.now()
        };
        fs.writeFileSync('.bling_tokens.json', JSON.stringify(tokenData, null, 2));
        console.log('✅ Tokens salvos em .bling_tokens.json!');
      } else {
        console.error('❌ Falha ao obter o token de acesso.');
        return;
      }
    } catch (err) {
      console.error('Erro na autenticação:', err);
      return;
    }
  }

  // --- ROTINA DE BUSCA DE TODOS OS PRODUTOS (PAGINAÇÃO) ---
  if (accessToken) {
    console.log('📦 Iniciando a importação de todos os produtos do Bling...');
    
    let allProducts = [];
    let page = 1;
    let hasMore = true;
    const limit = 100; // Máximo por requisição na API v3 do Bling

    try {
      while (hasMore) {
        const prodRes = await fetch(`https://api.bling.com.br/v3/produtos?pagina=${page}&limite=${limit}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });

        if (!prodRes.ok) {
          if (prodRes.status === 429) {
            console.warn('⚠️ Rate limit atingido. Aguardando 2 segundos...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          throw new Error(`Erro ao buscar página ${page}: ${prodRes.statusText}`);
        }

        const prodJson = await prodRes.json();
        const products = prodJson.data || [];

        if (products.length > 0) {
          allProducts = [...allProducts, ...products];
          console.log(`-> Página ${page} puxada com sucesso. Acumulado: ${allProducts.length} produtos.`);
          page++;

          if (products.length < limit) {
            hasMore = false;
          }

          // Delay de segurança para respeitar o limite de requisições por segundo
          await new Promise(resolve => setTimeout(resolve, 350));
        } else {
          hasMore = false;
        }
      }

      // Salva todos os produtos em um arquivo JSON local para o site consumir
      fs.writeFileSync('bling_catalog_full.json', JSON.stringify(allProducts, null, 2));
      console.log(`✨ Sincronização concluída com sucesso! Total de ${allProducts.length} produtos salvos em 'bling_catalog_full.json'.`);

    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    }
  }
}

run();