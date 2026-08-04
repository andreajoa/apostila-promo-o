const state = document.getElementById('purchaseState');
const library = document.getElementById('library');
const grid = document.getElementById('libraryGrid');
const summary = document.getElementById('purchaseSummary');
const sessionId = new URLSearchParams(location.search).get('session_id');

function ensureStylesheet(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

function addStyles() {
  ensureStylesheet('/funnel.css');
  ensureStylesheet('/visual-fixes.css');
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, (char) => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;',
  }[char]));
}

function campaignImage(name, label = '') {
  return `<div class="campaign-image atlas-${name}" role="img" aria-label="${label}"><img src="/assets/campaign-${encodeURIComponent(name)}.webp" alt="" aria-hidden="true" decoding="async" loading="lazy"></div>`;
}

function fail(message) {
  state.className = 'error-card';
  state.innerHTML = `<div class="success-icon" style="background:#f8e3df;color:#8d2f24">!</div><h1>Não foi possível liberar o acesso</h1><p>${escapeHtml(message)}</p><button class="button button-primary" id="retryPurchase">Tentar novamente</button><a class="button button-ghost" href="/#apostilas">Voltar à página</a>`;
  document.getElementById('retryPurchase')?.addEventListener('click', () => {
    state.className = 'loading-card';
    state.innerHTML = '<div class="spinner"></div><h1>Confirmando seu pagamento...</h1><p>Aguarde enquanto validamos a compra.</p>';
    load(true);
  });
}

function postPurchaseHtml(data) {
  const emailMessage = data.emailDeliveryConfigured && data.buyer?.email
    ? `Também enviaremos este mesmo acesso para <strong>${escapeHtml(data.buyer.email)}</strong>.`
    : 'Mesmo sem e-mail, esta página já contém tudo o que foi liberado pela compra.';

  return `<section class="post-purchase-funnel" aria-label="Informações e ofertas complementares">
    <div class="post-offer">
      <div class="post-offer-copy">
        <p class="eyebrow">ACESSO ÚNICO DA COMPRA</p>
        <h2>Tudo o que você comprou está nesta página.</h2>
        <p>${emailMessage} Guarde este endereço para voltar quando precisar.</p>
        <div class="post-offer-actions">
          <button class="button button-primary" id="copyLibraryLink">Copiar link da minha biblioteca</button>
          <a class="button button-ghost" href="/">Voltar à página de vendas</a>
        </div>
        <small class="post-offer-note" id="copyStatus">O link é vinculado à sessão de pagamento confirmada.</small>
      </div>
    </div>

    <div class="post-offer">
      ${campaignImage('b3', 'Oferta complementar de materiais premium')}
      <div class="post-offer-copy">
        <p class="eyebrow">UPSELL OPCIONAL</p>
        <h2>Amplie as atividades de atenção e experiências sensoriais.</h2>
        <p>Pequenos Gigantes e Descubra os Sentidos continuam em suas páginas próprias, com checkout e entrega independentes.</p>
        <div class="post-offer-actions">
          <a class="button button-primary button-large" href="https://pequenos-gigantes-ebook.vercel.app/" target="_blank" rel="noopener">Conhecer Pequenos Gigantes</a>
          <a class="button button-accent button-large" href="https://descobrindo-os-cinco-sentidos.vercel.app/" target="_blank" rel="noopener">Conhecer Descubra os Sentidos</a>
        </div>
        <small class="post-offer-note">Imagem promocional ilustrativa. Não representa depoimento real nem adiciona produtos automaticamente ao pedido.</small>
      </div>
    </div>

    <div class="post-offer">
      ${campaignImage('b2', 'Recursos digitais interativos para celular, tablet e computador')}
      <div class="post-offer-copy">
        <p class="eyebrow">CROSS-SELL DE EXPERIÊNCIA</p>
        <h2>Continue a prática com recursos interativos.</h2>
        <p>Atenção em Jogo e História Maluca podem complementar o uso das apostilas no celular, tablet ou computador.</p>
        <div class="post-offer-actions">
          <a class="button button-primary" href="https://estimular-aten-o-sustentada.vercel.app/" target="_blank" rel="noopener">Abrir Atenção em Jogo</a>
          <a class="button button-ghost" href="https://narrative-play-magic.vercel.app/" target="_blank" rel="noopener">Abrir História Maluca</a>
        </div>
        <small class="post-offer-note">Os recursos são ferramentas educativas e não substituem avaliação profissional.</small>
      </div>
    </div>
  </section>`;
}

async function fetchPurchase(attempt = 0) {
  const response = await fetch(`/api/session?session_id=${encodeURIComponent(sessionId)}`, { cache:'no-store' });
  const data = await response.json().catch(() => ({}));

  if (response.ok && data.paid) return data;

  if ((response.status === 403 || response.status === 500) && attempt < 7) {
    await new Promise((resolve) => setTimeout(resolve, 1400 + attempt * 350));
    return fetchPurchase(attempt + 1);
  }

  throw new Error(data.error || 'Pagamento ainda não confirmado.');
}

function bindLibraryActions() {
  const button = document.getElementById('copyLibraryLink');
  const status = document.getElementById('copyStatus');
  button?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      button.textContent = 'Link copiado';
      if (status) status.textContent = 'O endereço da sua biblioteca foi copiado.';
    } catch {
      window.prompt('Copie o link da sua biblioteca:', location.href);
    }
  });
}

async function load(force = false) {
  addStyles();
  if (!sessionId) return fail('A identificação da compra não foi encontrada.');

  try {
    const data = await fetchPurchase(force ? 0 : 0);
    const firstName = data.buyer?.name ? data.buyer.name.split(' ')[0] : null;
    const buyerEmail = data.buyer?.email ? escapeHtml(data.buyer.email) : '';

    summary.innerHTML = `${firstName ? `${escapeHtml(firstName)}, ` : ''}abaixo estão todos os materiais vinculados a esta compra.${buyerEmail ? ` Compra registrada para <strong>${buyerEmail}</strong>.` : ''}`;

    grid.innerHTML = data.items.map((item) => {
      const isPdf = item.type === 'pdf';
      const href = `/api/access?session_id=${encodeURIComponent(sessionId)}&item=${encodeURIComponent(item.id)}`;
      return `<article class="library-item"><span>${escapeHtml(isPdf ? (item.category || 'APOSTILA DIGITAL') : 'RECURSO INTERATIVO')}</span><h2>${escapeHtml(item.name)}</h2><a href="${href}" ${isPdf ? '' : 'target="_blank" rel="noopener"'}>${isPdf ? 'Ver e baixar apostila' : 'Abrir atividade'} →</a></article>`;
    }).join('');

    if (!document.querySelector('.post-purchase-funnel')) {
      library.insertAdjacentHTML('beforeend', postPurchaseHtml(data));
    }

    state.hidden = true;
    library.hidden = false;
    bindLibraryActions();

    window.dataLayer?.push({
      event:'purchase',
      ecommerce:{
        transaction_id:sessionId,
        value:data.offer.amount / 100,
        currency:'BRL',
        items:[{ item_id:data.sku, item_name:data.offer.name }],
      },
    });
  } catch (error) {
    fail(error instanceof Error ? error.message : 'Não foi possível validar a compra.');
  }
}

load();
