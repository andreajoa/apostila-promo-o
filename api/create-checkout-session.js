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
    params.set('ui_mode', 'embedded');
    params.set('return_url', `${siteUrl}/sucesso.html?session_id={CHECKOUT_SESSION_ID}`);
    params.set('redirect_on_completion', 'always');
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

    if (offer.id === 'colecao-completa') {
      params.set('payment_method_options[card][installments][enabled]', 'true');
    }

    const session = await stripeRequest('/checkout/sessions', {
      method: 'POST',
      body: params.toString(),
    });

    if (!session.client_secret) {
      throw new Error('A Stripe não devolveu o client_secret do checkout incorporado.');
    }

    response.setHeader('Cache-Control', 'private, no-store, max-age=0');
    return response.status(200).json({
      clientSecret: session.client_secret,
      installmentsEnabled: offer.id === 'colecao-completa',
    });
  } catch (error) {
    console.error('embedded_checkout_session_error', error);
    return response.status(500).json({
      error: error instanceof Error
        ? `Não foi possível iniciar o pagamento: ${error.message}`
        : 'Não foi possível iniciar o pagamento agora.',
    });
  }
}
