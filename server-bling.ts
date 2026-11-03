import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// Bling API v3 Constants
const BLING_AUTH_BASE = 'https://www.bling.com.br/Api/v3/oauth/authorize';
const BLING_TOKEN_URL = 'https://api.bling.com.br/v3/oauth/token';
const BLING_API_BASE = 'https://api.bling.com.br/v3';

const TOKENS_FILE = path.resolve(process.cwd(), '.bling_tokens.json');

export interface BlingTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  obtained_at: number; // timestamp in ms
}

// In-memory cache
let cachedTokens: BlingTokens | null = null;

// Read tokens from disk
export function loadBlingTokens(): BlingTokens | null {
  if (cachedTokens) return cachedTokens;
  try {
    if (fs.existsSync(TOKENS_FILE)) {
      const raw = fs.readFileSync(TOKENS_FILE, 'utf-8');
      cachedTokens = JSON.parse(raw);
      return cachedTokens;
    }
  } catch (err) {
    console.warn('[Bling] Could not read token file:', err);
  }
  return null;
}

// Save tokens to disk & cache
export function saveBlingTokens(tokens: BlingTokens): void {
  cachedTokens = tokens;
  try {
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2), 'utf-8');
    console.log('[Bling] Tokens saved successfully.');
  } catch (err) {
    console.error('[Bling] Could not save tokens to disk:', err);
  }
}

// Clear tokens
export function clearBlingTokens(): void {
  cachedTokens = null;
  try {
    if (fs.existsSync(TOKENS_FILE)) {
      fs.unlinkSync(TOKENS_FILE);
    }
  } catch (err) {
    console.warn('[Bling] Could not delete token file:', err);
  }
}

function getClientCredentials() {
  const clientId = process.env.BLING_CLIENT_ID || '66ada183edd39b7215178f3d05bbb4b13c013fdd';
  const clientSecret = process.env.BLING_CLIENT_SECRET || '92efd4ff0b3ca6219adf7ecdc2df633bece0925c4f4c888f071065eaa046';
  const state = process.env.BLING_STATE || '2b41de06512249e4b701e9c4fcdcef0e';
  return { clientId, clientSecret, state };
}

/**
 * Exchange Authorization Code for Access & Refresh Tokens
 */
export async function exchangeCodeForTokens(code: string, redirectUri?: string): Promise<BlingTokens> {
  const { clientId, clientSecret } = getClientCredentials();
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const bodyParams = new URLSearchParams();
  bodyParams.append('grant_type', 'authorization_code');
  bodyParams.append('code', code.trim());
  if (redirectUri) {
    bodyParams.append('redirect_uri', redirectUri);
  }

  console.log(`[Bling] Exchanging code for token with client_id: ${clientId}`);

  const res = await fetch(BLING_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': '1.0'
    },
    body: bodyParams.toString()
  });

  const responseText = await res.text();
  let json: any;
  try {
    json = JSON.parse(responseText);
  } catch {
    throw new Error(`Bling token endpoint returned non-JSON [${res.status}]: ${responseText}`);
  }

  if (!res.ok || json.error) {
    console.error('[Bling Token Error]:', json);
    const errDesc = json.error?.message || json.error_description || json.error || responseText;
    throw new Error(`Erro Bling OAuth: ${errDesc}`);
  }

  const tokenData: BlingTokens = {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_in: json.expires_in || 21600,
    token_type: json.token_type || 'Bearer',
    scope: json.scope || '',
    obtained_at: Date.now()
  };

  saveBlingTokens(tokenData);
  return tokenData;
}

/**
 * Refresh expired access token
 */
export async function refreshBlingToken(): Promise<BlingTokens> {
  const tokens = loadBlingTokens();
  if (!tokens?.refresh_token) {
    throw new Error('Nenhum refresh_token disponível para renovar sessão do Bling.');
  }

  const { clientId, clientSecret } = getClientCredentials();
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const bodyParams = new URLSearchParams();
  bodyParams.append('grant_type', 'refresh_token');
  bodyParams.append('refresh_token', tokens.refresh_token);

  console.log('[Bling] Refreshing token...');

  const res = await fetch(BLING_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': '1.0'
    },
    body: bodyParams.toString()
  });

  const responseText = await res.text();
  let json: any;
  try {
    json = JSON.parse(responseText);
  } catch {
    throw new Error(`Bling refresh endpoint returned non-JSON [${res.status}]: ${responseText}`);
  }

  if (!res.ok || json.error) {
    const errorMsg = json.error?.message || json.error_description || json.error || responseText;
    const isInvalidGrant = String(errorMsg).includes('invalid_grant') || String(responseText).includes('invalid_grant');
    
    if (isInvalidGrant) {
      console.warn('[Bling] Refresh token inválido ou expirado (invalid_grant). Limpando tokens locais.');
      clearBlingTokens();
    }
    throw new Error(`Erro ao renovar token Bling: ${errorMsg}`);
  }

  const newTokens: BlingTokens = {
    access_token: json.access_token,
    refresh_token: json.refresh_token || tokens.refresh_token,
    expires_in: json.expires_in || 21600,
    token_type: json.token_type || 'Bearer',
    scope: json.scope || tokens.scope,
    obtained_at: Date.now()
  };

  saveBlingTokens(newTokens);
  return newTokens;
}

/**
 * Get a valid access token (refreshes automatically if expired)
 */
export async function getValidAccessToken(): Promise<string> {
  const tokens = loadBlingTokens();
  if (!tokens?.access_token) {
    throw new Error('Bling ERP não conectado. Por favor, autorize a conexão via OAuth.');
  }

  const expiresInMs = (tokens.expires_in || 21600) * 1000;
  const isExpired = Date.now() - tokens.obtained_at >= expiresInMs - 120000; // 2 min safety margin

  if (isExpired) {
    if (tokens.refresh_token) {
      try {
        const refreshed = await refreshBlingToken();
        return refreshed.access_token;
      } catch (err: any) {
        const isInvalidGrant = String(err?.message || '').includes('invalid_grant');
        if (isInvalidGrant) {
          throw new Error('Sessão do Bling expirada (invalid_grant). Por favor, reconecte via OAuth.');
        }
        console.warn('[Bling] Falha ao renovar token:', err?.message || err);
        return tokens.access_token;
      }
    } else {
      clearBlingTokens();
      throw new Error('Sessão do Bling expirada sem refresh token. Por favor, reconecte via OAuth.');
    }
  }

  return tokens.access_token;
}

/**
 * Fetch authenticated resource from Bling v3 API
 */
export async function fetchFromBling(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = await getValidAccessToken();
  const url = endpoint.startsWith('http') ? endpoint : `${BLING_API_BASE}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    if (res.status === 401) {
      const currentTokens = loadBlingTokens();
      if (currentTokens?.refresh_token) {
        console.log('[Bling] 401 recebido. Tentando renovação de token...');
        try {
          const refreshed = await refreshBlingToken();
          const retryRes = await fetch(url, {
            ...options,
            headers: {
              'Authorization': `Bearer ${refreshed.access_token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              ...(options.headers || {})
            }
          });
          if (retryRes.ok) return retryRes.json();
        } catch (refreshErr: any) {
          console.warn('[Bling] Tentativa de renovação pós-401 cancelada:', refreshErr?.message || refreshErr);
        }
      }
    }
    throw new Error(`Bling API [${res.status}]: ${errorText}`);
  }

  return res.json();
}

/**
 * Register all Bling ERP routes on the Express app
 */
export function registerBlingRoutes(app: express.Express) {
  const { clientId, state } = getClientCredentials();

  app.get('/api/bling/auth-url', (req: Request, res: Response) => {
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const redirectUri = `${appUrl}/auth/callback`;
    const authUrl = `${BLING_AUTH_BASE}?response_type=code&client_id=${clientId}&state=${state}`;

    res.json({
      url: authUrl,
      redirectUri,
      clientId,
      state
    });
  });

  app.get(['/auth/callback', '/auth/callback/'], async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const reqState = req.query.state as string;
    const error = req.query.error as string;

    if (error) {
      return res.send(`<!DOCTYPE html><html><body style="background:#0E0E0E;color:#fff;text-align:center;padding:50px;"><h2>Falha na Autorização</h2><p>${error}</p><button onclick="window.close()">Fechar</button></body></html>`);
    }

    if (!code) {
      return res.send(`<!DOCTYPE html><html><body style="background:#0E0E0E;color:#fff;text-align:center;padding:50px;"><h3>Nenhum código recebido</h3><button onclick="window.close()">Fechar</button></body></html>`);
    }

    try {
      const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      const redirectUri = `${appUrl}/auth/callback`;
      await exchangeCodeForTokens(code, redirectUri);

      return res.send(`
        <!DOCTYPE html>
        <html>
          <body style="background:#0E0E0E;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
            <div style="background:#141414;border:1px solid #282828;border-radius:16px;padding:40px;text-align:center;">
              <h2 style="color:#4ade80;">Bling ERP Conectado com Sucesso!</h2>
              <p style="color:#9ca3af;">A janela vai fechar automaticamente...</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'bling' }, '*');
                  setTimeout(() => window.close(), 1200);
                } else {
                  setTimeout(() => window.location.href = '/', 1500);
                }
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (err: any) {
      return res.send(`<!DOCTYPE html><html><body style="background:#0E0E0E;color:#fff;text-align:center;padding:50px;"><h3>Erro ao conectar Bling</h3><p>${err.message}</p><button onclick="window.close()">Fechar</button></body></html>`);
    }
  });

  // 6. Fetch Products from Bling API v3 (UPDATED TO FETCH UP TO 1500 ITEMS / 15 PAGES)
  app.get('/api/bling/products', async (req: Request, res: Response) => {
    try {
      const pagina = req.query.pagina ? String(req.query.pagina) : '1';
      const limiteParam = parseInt(String(req.query.limite || '100'), 10);
      const fetchAll = req.query.all === 'true' || req.query.todos === 'true' || limiteParam > 100 || (!req.query.pagina && !req.query.limite);

      let rawProducts: any[] = [];
      
      if (fetchAll) {
        // Loop expandido para abranger até 15 páginas (1500 produtos, cobrindo perfeitamente os 1191 itens)
        for (let p = 1; p <= 15; p++) {
          try {
            const pageData = await fetchFromBling(`/produtos?pagina=${p}&limite=100`);
            const items = pageData?.data || [];
            if (items.length > 0) {
              rawProducts.push(...items);
            }
            // Se a página retornou menos de 100 itens, chegámos ao fim do catálogo do Bling
            if (items.length < 100) break;
          } catch (pageErr) {
            console.warn(`[Bling] Erro ao buscar página ${p} de produtos:`, pageErr);
            break;
          }
        }
      } else {
        const data = await fetchFromBling(`/produtos?pagina=${pagina}&limite=${limiteParam}`);
        rawProducts = data?.data || [];
      }

      // Mapeamento limpo dos produtos recolhidos
      const formatted = rawProducts.map((p: any) => ({
        id: `bling-${p.id}`,
        blingId: p.id,
        name: p.nome,
        code: p.codigo,
        sku: p.codigo,
        price: p.preco || 0,
        stock: p.estoque?.saldoFisico ?? 10,
        status: p.situacao,
        format: p.formato,
        type: p.tipo,
        shortDescription: p.descricaoCurta || '',
        imageUrl: p.imagemURL || p.anexos?.[0]?.url || '',
      }));

      res.json({
        success: true,
        count: formatted.length,
        products: formatted,
        rawCount: rawProducts.length
      });
    } catch (err: any) {
      console.error('[Bling Products Error]:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Falha ao buscar produtos do Bling ERP',
        connected: Boolean(loadBlingTokens())
      });
    }
  });

  // 9. Disconnect / Logout Bling
  app.post('/api/bling/disconnect', (_req: Request, res: Response) => {
    clearBlingTokens();
    res.json({ success: true, message: 'Bling desconectado com sucesso.' });
  });
}