import { CAMPAIGN_ID, getOffer } from './_catalog.js';
import { resolveSiteUrl, stripeRequest } from './_stripe.js';

function readBody(request) {
  if (request.body && typeof request.body === 'object') return request.body;
  try { return JSON.parse(request.body || '{}'); } catch { return {}; }
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const { sku } = readBody(request);
    const offer = getOffer(String(sku || ''));
    if (!offer) return response.status(400).json({ error: 'Produto inválido.' });

    const siteUrl = resolveSiteUrl(request);
    if (!siteUrl) throw new Error('SITE_URL não configurada.');

    const params = new URLSearchParams();
    params.set('mode', 'payment');
    params.set('success_url', `${siteUrl}/sucesso.html?session_id={CHECKOUT_SESSION_ID}`);
    params.set('cancel_url', `${siteUrl}/#apostilas`);
    params.set('locale', 'pt-BR');
    params.set('payment_method_types[0]', 'card');
    params.set('customer_creation', 'always');
    params.set('billing_address_collection', 'auto');
    params.set('line_items[0][quantity]', '1');
    params.set('line_items[0][price_data][currency]', 'brl');
    params.set('line_items[0][price_data][unit_amount]', String(offer.amount));
    params.set('line_items[0][price_data][product_data][name]', offer.name);
    params.set('line_items[0][price_data][product_data][description]', offer.description);
    params.set('metadata[sku]', offer.id);
    params.set('metadata[campaign]', CAMPAIGN_ID);
    params.set('submit_type', 'pay');

    const session = await stripeRequest('/checkout/sessions', {
      method: 'POST',
      body: params.toString(),
    });

    return response.status(200).json({ url: session.url });
  } catch (error) {
    console.error('checkout_session_error', error);
    return response.status(500).json({ error: 'Não foi possível iniciar o pagamento agora.' });
  }
}
