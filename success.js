const state = document.getElementById('purchaseState');
const library = document.getElementById('library');
const grid = document.getElementById('libraryGrid');
const summary = document.getElementById('purchaseSummary');
const sessionId = new URLSearchParams(location.search).get('session_id');

function addStyles() {
  if (document.querySelector('link[href="/funnel.css"]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/funnel.css';
  document.head.appendChild(link);
}

function atlas(name, label = '') {
  return `<div class="campaign-image atlas atlas-${name}" role="img" aria-label="${label}"><img src="/assets/funnel-atlas.webp" alt="" aria-hidden="true"></div>`;
}

function fail(message) {
  state.className = 'error-card';
  state.innerHTML = `<div class="success-icon" style="background:#f8e3df;color:#8d2f24">!</div><h1>Não foi possível liberar o acesso</h1><p>${message}</p><a class="button button-primary" href="/#apostilas">Voltar à página</a>`;
}

function postPurchaseHtml(data) {
  const emailMessage = data.emailDeliveryConfigured && data.buyer?.email
    ? `O link desta biblioteca também foi enviado para <strong>${data.buyer.email}</strong>.`
    : 'Guarde o endereço desta página para acessar novamente os itens da compra.';

  return `<section class="post-purchase-funnel" aria-label="Ofertas complementares">
    <div class="post-offer">
      <div class="post-offer-copy">
        <p class="eyebrow">ENTREGA CONFIRMADA</p>
        <h2>Seu acesso está organizado.</h2>
        <p>${emailMessage}</p>
      </div>
    </div>

    <div class="post-offer">
      ${atlas('b3', 'Oferta complementar de materiais premium')}
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
      ${atlas('b2', 'Recursos digitais interativos para celular, tablet e computador')}
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

async function load() {
  addStyles();
  if (!sessionId) return fail('A identificação da compra não foi encontrada.');

  try {
    const response = await fetch(`/api/session?session_id=${encodeURIComponent(sessionId)}`, { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok || !data.paid) throw new Error(data.error || 'Pagamento ainda não confirmado.');

    const firstName = data.buyer?.name ? data.buyer.name.split(' ')[0] : null;
    summary.innerHTML = `${firstName ? `${firstName}, ` : ''}escolha abaixo o material que deseja acessar.${data.buyer?.email ? ` Compra vinculada a <strong>${data.buyer.email}</strong>.` : ''}`;

    grid.innerHTML = data.items.map((item) => {
      const isPdf = item.type === 'pdf';
      const href = `/api/access?session_id=${encodeURIComponent(sessionId)}&item=${encodeURIComponent(item.id)}`;
      return `<article class="library-item"><span>${isPdf ? (item.category || 'APOSTILA DIGITAL') : 'RECURSO INTERATIVO'}</span><h2>${item.name}</h2><a href="${href}" ${isPdf ? '' : 'target="_blank" rel="noopener"'}>${isPdf ? 'Baixar apostila' : 'Abrir atividade'} →</a></article>`;
    }).join('');

    library.insertAdjacentHTML('beforeend', postPurchaseHtml(data));
    state.hidden = true;
    library.hidden = false;

    window.dataLayer?.push({
      event: 'purchase',
      ecommerce: {
        transaction_id: sessionId,
        value: data.offer.amount / 100,
        currency: 'BRL',
        items: [{ item_id: data.sku, item_name: data.offer.name }],
      },
    });
  } catch (error) {
    fail(error instanceof Error ? error.message : 'Não foi possível validar a compra.');
  }
}

load();
