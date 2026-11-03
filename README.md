# 🔥 STREET STORE ITABIRA — Streetwear & Drops Exclusivos

E-commerce streetwear de alta densidade e autoridade urbana da **Street Store Itabira** com catálogo de 300 drops autênticos, sincronização com Nuvemshop e Bling ERP, Checkout Transparente via Mercado Pago (PIX com 5% OFF e Cartão em até 12x), Rastreamento de Pedidos em tempo real, Depoimentos de Clientes com fotos e avaliação em Coroas, Feed Oficial do Instagram e Central de Políticas (Entrega, Trocas & Devoluções e FAQ).

---

## 📍 Informações Oficiais da Loja

- **Endereço Físico:** Avenida João Pinheiro, 353 - Centro, Itabira - MG · CEP: 35900-539
- **WhatsApp Oficial:** [(31) 98480-6556](https://wa.me/5531984806556)
- **Instagram Oficial:** [@streetstoreitabira](https://instagram.com/streetstoreitabira)
- **Horário de Atendimento:** Segunda a Sexta: 09:00 às 19:00 · Sábados: 09:00 às 14:00

---

## 🚀 Como Executar no VS Code (Desenvolvimento Local)

### 1. Pré-requisitos
- **Node.js** 18+ ou 20+ instalado na sua máquina ([Download Node.js](https://nodejs.org/))
- **npm** (incluso com Node.js) ou **pnpm** / **yarn**
- **VS Code** instalado com extensões recomendadas (*Tailwind CSS IntelliSense*, *ESLint*)

### 2. Passo a Passo

1. **Abra a pasta do projeto no VS Code**:
   ```bash
   code .
   ```

2. **Instale as dependências do projeto**:
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente**:
   Crie um arquivo `.env` na raiz do projeto (você pode duplicar o `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Preencha as chaves com seus dados (Nuvemshop, Mercado Pago e Bling ERP se aplicável). Se não preencher, o sistema utiliza o catálogo nativo com 300 peças e modo de demonstração seguro.

4. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
   - O terminal iniciará o servidor full-stack Express integrado com o Vite em:
   👉 **http://localhost:3000**

5. **Para testar o build de produção**:
   ```bash
   npm run build
   ```

---

## ⚡ Como Publicar na Vercel (Deploy em 3 Minutos)

O projeto já está **100% configurado para a Vercel** com:
- `vercel.json` pronto com regras de rotas e Serverless Functions
- `api/index.ts` que exporta a API do Express para rodar como Serverless na Vercel
- Suporte a SPA (Single Page Application) com roteamento direto para `/index.html`

### Opção 1: Via Painel Web da Vercel (Recomendado)

1. Suba o código do seu projeto para um repositório no seu **GitHub** ou **GitLab**.
2. Acesse [vercel.com](https://vercel.com) e clique em **"Add New..."** > **"Project"**.
3. Selecione o repositório da `Street Store`.
4. As configurações de Build serão detectadas automaticamente:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Na seção **Environment Variables**, adicione as variáveis de produção do seu arquivo `.env`:
   - `MERCADO_PAGO_PUBLIC_KEY` e `VITE_MERCADO_PAGO_PUBLIC_KEY`
   - `MERCADO_PAGO_ACCESS_TOKEN`
   - `NUVEMSHOP_USER_ID` e `NUVEMSHOP_ACCESS_TOKEN`
   - `BLING_CLIENT_ID` e `BLING_CLIENT_SECRET` (se for usar)
6. Clique em **"Deploy"**.
7. Pronto! Em menos de 2 minutos sua loja estará no ar com HTTPS gratuito e CDN global.

---

### Opção 2: Via Vercel CLI (Terminal)

```bash
# 1. Instalar a CLI da Vercel (se ainda não tiver)
npm i -g vercel

# 2. Fazer login
vercel login

# 3. Executar o deploy
vercel --prod
```

---

## 🛠️ Tecnologias e Arquitetura

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion), Lucide React Icons
- **Backend:** Node.js, Express, TSX, integração REST Nuvemshop & Bling ERP v3
- **Pagamentos:** Mercado Pago SDK (Checkout Transparente com QR Code PIX nativo e Cartão de Crédito)
- **Banco de Dados & Avaliações:** Firebase Firestore com regras de segurança granulares
- **Logística:** Cálculo de frete (Correios SEDEX/PAC, Jadlog/Melhor Envio) e Retirada na Loja Física em Itabira

---

## 📁 Estrutura do Projeto

```
├── api/
│   └── index.ts               # Handler Serverless para a Vercel
├── public/                    # Assets estáticos, logos, fotos e banners
├── src/
│   ├── components/            # Componentes visuais modulares
│   │   ├── Header.tsx         # Barra de navegação com Sacola, Favoritos, Ajuda e Rastreamento
│   │   ├── Hero.tsx           # Seção principal com vídeo 3D lateral em loop
│   │   ├── CatalogSection.tsx # Grid de 300 produtos com badges de estoque e filtros
│   │   ├── ProductModal.tsx   # Gaveta de detalhes, fotos, tamanhos e aviso de esgotado
│   │   ├── CartDrawer.tsx     # Sacola com cupom, frete CEP e botão de checkout
│   │   ├── SocialProofSection.tsx # Feed Instagram 2x2 e Depoimentos lado a lado
│   │   ├── PoliciesAndFaqModal.tsx # Modal com abas de FAQ, Entregas e Trocas
│   │   ├── OrderTrackingModal.tsx  # Consulta de pedidos e rastreio
│   │   └── Footer.tsx         # Rodapé completo com selos, endereço e links
│   ├── data/                  # Catálogo de 300 drops, depoimentos e marcas
│   ├── services/              # Conectores com Nuvemshop, Mercado Pago e Firestore
│   ├── types/                 # Definições de tipagem TypeScript
│   ├── App.tsx                # Aplicação principal
│   └── main.tsx               # Entrypoint do React
├── server.ts                  # Servidor full-stack Express (API + Proxy)
├── vercel.json                # Configuração de rotas e build para Vercel
└── package.json               # Dependências e scripts
```
