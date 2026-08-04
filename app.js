const products = [
  { id: 'calma', name: 'Apostila CALMA', category: 'Comportamento e regulação', tag: 'PROTOCOLO', description: 'Compreender, acolher, manter limites possíveis, modelar comunicação e acompanhar padrões.', icon: 'C' },
  { id: 'tdah-vida-real', name: 'TDAH na Vida Real', category: 'TDAH e desenvolvimento', tag: 'GUIA PREMIUM', description: 'Funções executivas, avaliação responsável, rotina, escola, estudo e registros objetivos.', icon: 'T' },
  { id: 'durante-a-crise', name: 'Durante a Crise', category: 'Comportamento e regulação', tag: 'PLANO PRÁTICO', description: 'Segurança, redução de exigência, comunicação acessível e apoio à recuperação.', icon: 'D' },
  { id: 'crise-protesto-frustracao', name: 'Crise, Protesto ou Frustração?', category: 'Comportamento e regulação', tag: 'GUIA DE DECISÃO', description: 'Observar contexto e capacidade sem rotular, com frases e registro A-B-C ampliado.', icon: '?' },
  { id: 'marcos-desenvolvimento', name: 'Marcos do Desenvolvimento', category: 'TDAH e desenvolvimento', tag: '0 A 5 ANOS', description: 'Habilidades por faixa etária, ideias de apoio e sinais para procurar avaliação.', icon: 'M' },
  { id: 'antes-da-crise', name: 'Antes da Crise', category: 'Comportamento e regulação', tag: 'PREVENÇÃO', description: 'Protocolo A.N.T.E.S., mapa de sinais, kit de regulação e plano preventivo.', icon: 'A' },
  { id: 'estrategias-coletivas', name: 'Estratégias Coletivas para Sala', category: 'Escola e inclusão', tag: 'INCLUSÃO', description: 'Seis pilares para uma sala mais previsível, acessível e participativa.', icon: 'E' },
  { id: 'quadro-emocoes', name: 'Quadro de Emoções da Semana', category: 'Família e emoções', tag: 'PREENCHÍVEL', description: 'Observar relações entre emoção, corpo, contexto e apoio sem transformar sentimento em nota.', icon: 'Q' },
  { id: 'protocolo-luz', name: 'Protocolo LUZ', category: 'Família e emoções', tag: 'FAMÍLIAS', description: 'Organizar o caminho após uma preocupação, suspeita ou diagnóstico, sem culpa nem pressa.', icon: 'L' },
  { id: 'protocolo-ensinar', name: 'Protocolo ENSINAR', category: 'Escola e inclusão', tag: 'PROFESSORES', description: 'Transformar barreiras em acesso, participação, comunicação e aprendizagem possível.', icon: 'E' },
  { id: 'protocolo-esperanca', name: 'Protocolo ESPERANÇA', category: 'Família e emoções', tag: 'REDE DE APOIO', description: 'Nove movimentos para organizar respostas e pedir ajuda concreta nos dias difíceis.', icon: 'E' },
  { id: 'protocolo-acolher', name: 'Protocolo ACOLHER', category: 'Comportamento e regulação', tag: 'CRISE EMOCIONAL', description: 'Roteiro de baixa exigência, cartão rápido e plano individual para momentos intensos.', icon: 'A' },
];

const catalog = document.getElementById('catalog');
const toast = document.getElementById('toast');
let activeFilter = 'Todos';

function money(cents) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

function renderCatalog() {
  const visible = activeFilter === 'Todos' ? products : products.filter((item) => item.category === activeFilter);
  catalog.innerHTML = visible.map((item, index) => `
    <article class="product-card" style="--delay:${index * 35}ms">
      <div class="product-cover cover-${(index % 4) + 1}">
        <span>${item.tag}</span>
        <strong>${item.name}</strong>
        <i>${item.icon}</i>
        <small>Margareth Almeida</small>
      </div>
      <div class="product-body">
        <span class="category-label">${item.category}</span>
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="product-bottom">
          <div><small>valor promocional</small><strong>${money(510)}</strong></div>
          <button class="button button-primary" data-buy="${item.id}" aria-label="Comprar ${item.name} por R$ 5,10">Comprar</button>
        </div>
      </div>
    </article>
  `).join('');
}

function showToast(message, error = false) {
  toast.textContent = message;
  toast.className = `toast show${error ? ' error' : ''}`;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => { toast.className = 'toast'; }, 3500);
}

async function startCheckout(sku, button) {
  const original = button?.textContent;
  try {
    if (button) { button.disabled = true; button.textContent = 'Abrindo checkout...'; }
    window.dataLayer?.push({ event: 'begin_checkout', ecommerce: { items: [{ item_id: sku }] } });
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sku }),
    });
    const data = await response.json();
    if (!response.ok || !data.url) throw new Error(data.error || 'Não foi possível abrir o pagamento.');
    window.location.assign(data.url);
  } catch (error) {
    showToast(error instanceof Error ? error.message : 'Não foi possível abrir o pagamento.', true);
    if (button) { button.disabled = false; button.textContent = original; }
  }
}

document.addEventListener('click', (event) => {
  const filter = event.target.closest('[data-filter]');
  if (filter) {
    activeFilter = filter.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach((item) => item.classList.toggle('active', item === filter));
    renderCatalog();
    return;
  }
  const buy = event.target.closest('[data-buy]');
  if (buy) startCheckout(buy.dataset.buy, buy);
});

renderCatalog();
