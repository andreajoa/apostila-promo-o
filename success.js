const state = document.getElementById('purchaseState');
const library = document.getElementById('library');
const grid = document.getElementById('libraryGrid');
const summary = document.getElementById('purchaseSummary');
const sessionId = new URLSearchParams(location.search).get('session_id');

function fail(message) {
  state.className = 'error-card';
  state.innerHTML = `<div class="success-icon" style="background:#f8e3df;color:#8d2f24">!</div><h1>Não foi possível liberar o acesso</h1><p>${message}</p><a class="button button-primary" href="/#apostilas">Voltar à página</a>`;
}

async function load() {
  if (!sessionId) return fail('A identificação da compra não foi encontrada.');
  try {
    const response = await fetch(`/api/session?session_id=${encodeURIComponent(sessionId)}`, { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok || !data.paid) throw new Error(data.error || 'Pagamento ainda não confirmado.');

    summary.textContent = data.email ? `Compra vinculada a ${data.email}. Escolha abaixo o material que deseja acessar.` : 'Escolha abaixo o material que deseja acessar.';
    grid.innerHTML = data.items.map((item) => {
      const isPdf = item.type === 'pdf';
      const href = `/api/access?session_id=${encodeURIComponent(sessionId)}&item=${encodeURIComponent(item.id)}`;
      return `<article class="library-item"><span>${isPdf ? (item.category || 'APOSTILA DIGITAL') : 'RECURSO INTERATIVO'}</span><h2>${item.name}</h2><a href="${href}" ${isPdf ? '' : 'target="_blank" rel="noopener"'}>${isPdf ? 'Baixar apostila' : 'Abrir atividade'} →</a></article>`;
    }).join('');

    state.hidden = true;
    library.hidden = false;
    window.dataLayer?.push({ event: 'purchase', ecommerce: { transaction_id: sessionId, value: data.offer.amount / 100, currency: 'BRL' } });
  } catch (error) {
    fail(error instanceof Error ? error.message : 'Não foi possível validar a compra.');
  }
}
load();
