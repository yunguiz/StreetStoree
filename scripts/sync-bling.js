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

  // --- ROTINA DE BUSCA DE TODOS OS PRODUTOS (PAGINAÇÃO COMPLETA) ---
  if (accessToken) {
    console.log('📦 A iniciar a importação de todos os produtos do Bling...');
    
    let allProducts = [];
    let page = 1;
    let hasMore = true;
    const limit = 100;

    try {
      while (hasMore) {
        console.log(`-> A solicitar página ${page} (limite: ${limit})...`);
        
        const prodRes = await fetch(`https://api.bling.com.br/v3/produtos?pagina=${page}&limite=${limit}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });

        if (!prodRes.ok) {
          if (prodRes.status === 429) {
            console.warn('⚠️ Rate limit atingido. A aguardar 2 segundos...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          const errText = await prodRes.text();
          throw new Error(`Erro ao buscar página ${page} (${prodRes.status}): ${errText}`);
        }

        const prodJson = await prodRes.json();
        const products = prodJson.data || [];

        console.log(`-> Recebidos ${products.length} produtos nesta página.`);

        if (products.length > 0) {
          allProducts = [...allProducts, ...products];
          console.log(`✅ Total acumulado até agora: ${allProducts.length} produtos.`);
          
          if (products.length < limit) {
            console.log('🏁 Última página atingida (retornou menos itens que o limite).');
            hasMore = false;
          } else {
            page++;
          }

          await new Promise(resolve => setTimeout(resolve, 400));
        } else {
          console.log('🏁 Nenhum produto retornado nesta página. Fim da lista.');
          hasMore = false;
        }
      }

      fs.writeFileSync('bling_catalog_full.json', JSON.stringify(allProducts, null, 2));
      console.log(`✨ Sincronização concluída com sucesso! Total final de ${allProducts.length} produtos salvos em 'bling_catalog_full.json'.`);

    } catch (err) {
      console.error('❌ Erro ao buscar produtos:', err);
    }
  }
}

run();