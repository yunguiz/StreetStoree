import { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  Truck, 
  RefreshCw, 
  ChevronDown, 
  Search, 
  ShieldCheck, 
  Package, 
  MapPin, 
  CheckCircle2, 
  MessageSquare, 
  Clock, 
  CreditCard, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type PolicyTab = 'faq' | 'shipping' | 'returns';

interface PoliciesAndFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: PolicyTab;
  onOpenTracking?: (orderNumber?: string) => void;
}

interface FaqItem {
  id: string;
  category: 'entrega' | 'trocas' | 'pagamento' | 'produtos';
  question: string;
  answer: string;
  actionText?: string;
  actionType?: 'tracking' | 'whatsapp' | 'catalog';
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-01',
    category: 'entrega',
    question: 'Como faço para rastrear o envio do meu pedido?',
    answer: 'Você pode acompanhar seu pedido em tempo real direto aqui no site! Basta clicar no botão "RASTREAR" no menu superior ou rodapé e inserir o número do seu pedido (ex: #1042) ou seu CPF/e-mail cadastrado. Mostramos o status atualizado dos Correios e transportadoras parceiras.',
    actionText: 'Rastrear Meu Pedido Agora',
    actionType: 'tracking'
  },
  {
    id: 'faq-02',
    category: 'entrega',
    question: 'Qual é o prazo de entrega e como é calculado o frete?',
    answer: 'O prazo varia conforme a sua localidade e modalidade de envio escolhida (Correios PAC, Sedex Express ou Jadlog/Melhor Envio). Na página do carrinho ou de qualquer produto, você pode inserir seu CEP para calcular o valor exato e o prazo estimado em dias úteis. Enviamos todas as peças em até 24 horas úteis após a confirmação do pagamento.',
    actionText: 'Ver Produtos no Catálogo',
    actionType: 'catalog'
  },
  {
    id: 'faq-03',
    category: 'entrega',
    question: 'Como funciona a Retirada Grátis na Loja Física em Itabira?',
    answer: 'Clientes de Itabira e região podem escolher a opção "Retirada na Loja Física" durante a compra sem pagar frete. Seu pedido fica separado e embalado na nossa unidade na Avenida João Pinheiro, 353 - Centro, Itabira - MG em até 2 horas úteis após a aprovação da compra.',
    actionText: 'Falar no WhatsApp da Loja',
    actionType: 'whatsapp'
  },
  {
    id: 'faq-04',
    category: 'trocas',
    question: 'Como funciona a política de trocas e devoluções gratuitas?',
    answer: 'Conforme o Código de Defesa do Consumidor (Art. 49), você tem até 7 dias corridos após o recebimento para solicitar troca ou devolução por qualquer motivo. A primeira troca é 100% gratuita: emitimos uma etiqueta pré-paga para você postar nos Correios sem custos.',
    actionText: 'Solicitar Troca ou Devolução',
    actionType: 'tracking'
  },
  {
    id: 'faq-05',
    category: 'trocas',
    question: 'O que é necessário para a peça ser aceita na troca?',
    answer: 'A peça deve estar sem indícios de uso, com todas as etiquetas originais afixadas, na embalagem original (caixa do tênis intacta no caso de calçados) e acompanhada de eventuais acessórios/brindes que a acompanharam.',
  },
  {
    id: 'faq-06',
    category: 'pagamento',
    question: 'Quais são as formas de pagamento e como funciona o desconto no PIX?',
    answer: 'Aceitamos PIX com 5% de desconto imediato gerado pelo Mercado Pago (com QR Code dinâmico e código Pix Copia e Cola), Cartão de Crédito em até 6x sem juros (todas as bandeiras) e Boleto Bancário. Toda transação é protegida com criptografia bancária SSL de ponta a ponta.',
  },
  {
    id: 'faq-07',
    category: 'produtos',
    question: 'Os tênis e roupas (Tesla, HOCKS, Qix, Chronic, etc.) são originais?',
    answer: 'Sim, 100% originais e autênticos! A Street Store é revendedora oficial autorizada de marcas de referência do streetwear e skate nacional, como Tesla Footwear, HOCKS, Qix Skate, Havaianas, Chronic 420, Trip Side, Fire Custom, Compton, Surfavel, 4ticity, Anth Co, Oncross e óculos Oakley X-Metal. Todos os itens acompanham nota fiscal e garantia oficial do fabricante.',
  },
  {
    id: 'faq-08',
    category: 'produtos',
    question: 'Qual é o padrão de modelagem das roupas (Oversized / Boxy)?',
    answer: 'Nossas camisetas e moletons possuem modelagem autêntica corte boxy e oversized: caimento solto e estruturado, ombros caídos e golas caneladas grossas com tecido pesado (260g a 420g/m²). Se você prefere caimento tradicional, recomendamos um tamanho menor; se curte o visual baggy autêntico de rua, compre seu tamanho usual.',
  }
];

export function PoliciesAndFaqModal({
  isOpen,
  onClose,
  initialTab = 'faq',
  onOpenTracking
}: PoliciesAndFaqModalProps) {
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>('faq-01');
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<'all' | 'entrega' | 'trocas' | 'pagamento' | 'produtos'>('all');

  if (!isOpen) return null;

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCategory = faqCategoryFilter === 'all' || item.category === faqCategoryFilter;
    const matchesSearch = searchQuery.trim() === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleFaqAction = (type?: string) => {
    onClose();
    if (type === 'tracking' && onOpenTracking) {
      onOpenTracking();
    } else if (type === 'whatsapp') {
      window.open('https://wa.me/5531984806556?text=Ol%C3%A1%20Street%20Store%2C%20tenho%20uma%20d%C3%BAvida%20sobre%20minha%20compra!', '_blank');
    } else if (type === 'catalog') {
      const el = document.getElementById('catalogo');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-4xl bg-[#111111] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header with Title and Tabs */}
        <div className="p-4 sm:p-6 bg-[#161616] border-b border-zinc-800 shrink-0">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#E50914] font-black font-oswald">
                <ShieldCheck className="w-4 h-4" />
                <span>CENTRAL DE AJUDA & DIRETRIZES OFICIAIS</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-white uppercase font-display mt-0.5">
                Políticas, Trocas & Dúvidas
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            <button
              onClick={() => setActiveTab('faq')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'faq'
                  ? 'bg-[#E50914] text-white shadow-lg shadow-red-950/60'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Dúvidas Frequentes (FAQ)</span>
            </button>

            <button
              onClick={() => setActiveTab('shipping')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'shipping'
                  ? 'bg-[#E50914] text-white shadow-lg shadow-red-950/60'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Políticas de Entrega</span>
            </button>

            <button
              onClick={() => setActiveTab('returns')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'returns'
                  ? 'bg-[#E50914] text-white shadow-lg shadow-red-950/60'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Trocas & Devoluções</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-zinc-300">
          
          {/* TAB 1: FAQ (DÚVIDAS FREQUENTES) */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              {/* Search Bar & Categories */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar pergunta sobre entrega, trocas, tamanho ou pix..."
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E50914] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs cursor-pointer"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {[
                    { id: 'all', label: 'Todas' },
                    { id: 'entrega', label: 'Envio' },
                    { id: 'trocas', label: 'Trocas' },
                    { id: 'pagamento', label: 'PIX/Cartão' },
                    { id: 'produtos', label: 'Produtos' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setFaqCategoryFilter(cat.id as any)}
                      className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                        faqCategoryFilter === cat.id
                          ? 'bg-zinc-800 text-white border-zinc-700'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accordion List */}
              <div className="space-y-3">
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-12 bg-zinc-950 rounded-xl border border-dashed border-zinc-800 p-6 space-y-2">
                    <HelpCircle className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p className="text-sm font-bold text-white uppercase">Nenhuma dúvida encontrada</p>
                    <p className="text-xs text-zinc-400">Tente buscar por termos diferentes ou fale no WhatsApp.</p>
                  </div>
                ) : (
                  filteredFaqs.map((faq) => {
                    const isExpanded = expandedFaq === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className="rounded-xl border border-zinc-800/90 bg-[#141414] overflow-hidden transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                          className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-zinc-900/60 transition-colors"
                        >
                          <span className="text-xs sm:text-sm font-bold text-white leading-snug">
                            {faq.question}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ${
                              isExpanded ? 'rotate-180 text-[#E50914]' : ''
                            }`}
                          />
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="px-4 pb-4 pt-1 text-xs text-zinc-300 leading-relaxed border-t border-zinc-800/60"
                            >
                              <p>{faq.answer}</p>
                              {faq.actionText && (
                                <button
                                  type="button"
                                  onClick={() => handleFaqAction(faq.actionType)}
                                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E50914]/20 hover:bg-[#E50914]/30 text-[#E50914] font-bold text-[11px] uppercase tracking-wider border border-[#E50914]/40 transition-colors cursor-pointer"
                                >
                                  <span>{faq.actionText}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: POLÍTICAS DE ENTREGA */}
          {activeTab === 'shipping' && (
            <div className="space-y-6 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-900 border border-red-900/40 flex items-start gap-3">
                <Truck className="w-5 h-5 text-[#E50914] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-black text-white uppercase font-display">
                    Envio Ágil em até 24 Horas Úteis para Todo o Brasil
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Cada drop é conferido e embalado individualmente com lacre antiviolação e código de rastreamento enviado automaticamente por e-mail e SMS.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#141414] border border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>Prazos e Modalidades</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    <li>• <strong>Sedex Express:</strong> 1 a 3 dias úteis para capitais e regiões metropolitanas.</li>
                    <li>• <strong>Correios PAC:</strong> 3 a 7 dias úteis econômico.</li>
                    <li>• <strong>Jadlog / Loggi:</strong> Rotas diretas via Melhor Envio com cotação dinâmica no carrinho.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#141414] border border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-[#E50914]" />
                    <span>Retirada na Loja Física (Sem Frete)</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Disponível gratuitamente para clientes de Itabira e região.
                  </p>
                  <p className="text-xs text-zinc-400">
                    Endereço: <strong>Avenida João Pinheiro, 353 - Centro, Itabira - MG</strong>. Disponível para retirada em até 2 horas úteis após a aprovação da compra.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#141414] border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-yellow-400" />
                  <span>Seguro e Proteção de Transporte</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Todas as encomendas da Street Store possuem seguro integral de carga. Em caso de extravio, roubo ou dano comprovado durante o transporte pelas transportadoras, garantimos o reenvio imediato sem qualquer custo ou o estorno total do valor pago.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: TROCAS E DEVOLUÇÕES */}
          {activeTab === 'returns' && (
            <div className="space-y-6 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-800/40 flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-black text-white uppercase font-display">
                    Primeira Troca 100% Gratuita // Satisfação Garantida
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Não serviu ou prefere outro modelo? Trocamos sem burocracia dentro de 7 dias corridos após a entrega.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-white font-oswald">
                  Como Solicitar Minha Troca em 4 Passos:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#141414] border border-zinc-800 space-y-1">
                    <span className="font-mono text-emerald-400 font-black">PASSO 01</span>
                    <p className="font-bold text-white">Solicitação pelo Site ou Whats</p>
                    <p className="text-zinc-400 text-[11px]">Acesse a aba de rastreamento ou envie uma mensagem no WhatsApp com seu número de pedido.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#141414] border border-zinc-800 space-y-1">
                    <span className="font-mono text-emerald-400 font-black">PASSO 02</span>
                    <p className="font-bold text-white">Receba a Etiqueta Grátis</p>
                    <p className="text-zinc-400 text-[11px]">Enviamos um código de postagem reversa dos Correios para você despachar a peça sem custos.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#141414] border border-zinc-800 space-y-1">
                    <span className="font-mono text-emerald-400 font-black">PASSO 03</span>
                    <p className="font-bold text-white">Análise Rápida na Chegada</p>
                    <p className="text-zinc-400 text-[11px]">Assim que a peça chega na loja física em Itabira, conferimos o estado em até 24 horas.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#141414] border border-zinc-800 space-y-1">
                    <span className="font-mono text-emerald-400 font-black">PASSO 04</span>
                    <p className="font-bold text-white">Novo Envio ou Estorno</p>
                    <p className="text-zinc-400 text-[11px]">Despachamos o novo tamanho desejado, liberamos vale-compras ou estornamos 100% no PIX/cartão.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenTracking) onOpenTracking();
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#E50914] hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-950/40 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Abrir Solicitação de Devolução / Troca</span>
                </button>

                <a
                  href="https://wa.me/5531984806556?text=Ol%C3%A1%20Street%20Store%2C%20gostaria%20de%20ajuda%20para%20fazer%20uma%20troca%20ou%20devolu%C3%A7%C3%A3o!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider border border-zinc-700 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Falar com Atendente no WhatsApp</span>
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer with Store Address & Contact */}
        <div className="p-4 bg-[#141414] border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 shrink-0">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <MapPin className="w-4 h-4 text-[#E50914] shrink-0" />
            <span>Avenida João Pinheiro, 353 - Centro, Itabira - MG · CEP 35900-539</span>
          </div>

          <div className="flex items-center gap-3 font-semibold text-zinc-300">
            <span>WhatsApp: (31) 98480-6556</span>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
