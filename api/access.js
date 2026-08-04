import { BONUSES, CAMPAIGN_ID, PRODUCTS, getEntitlements, getOffer } from './_catalog.js';
import { stripeRequest, validSessionId } from './_stripe.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).send('Método não permitido.');
  }

  const sessionId = String(request.query.session_id || '');
  const itemId = String(request.query.item || '');
  if (!validSessionId(sessionId) || !itemId) return response.status(400).send('Link inválido.');

  try {
    const session = await stripeRequest(`/checkout/sessions/${encodeURIComponent(sessionId)}`);
    const sku = String(session.metadata?.sku || '');
    const offer = getOffer(sku);
    const paid =
      session.status === 'complete' &&
      session.payment_status === 'paid' &&
      session.currency === 'brl' &&
      session.amount_total === offer?.amount &&
      session.metadata?.campaign === CAMPAIGN_ID;
    const allowed = paid && getEntitlements(sku).includes(itemId);
    if (!allowed) return response.status(403).send('Acesso não autorizado.');

    response.setHeader('Cache-Control', 'private, no-store');
    const product = PRODUCTS[itemId];
    if (product) {
      const target = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(product.driveId)}`;
      return response.redirect(302, target);
    }
    const bonus = BONUSES[itemId];
    if (bonus) return response.redirect(302, bonus.url);
    return response.status(404).send('Item não encontrado.');
  } catch (error) {
    console.error('access_error', error);
    return response.status(500).send('Não foi possível liberar o acesso.');
  }
}
