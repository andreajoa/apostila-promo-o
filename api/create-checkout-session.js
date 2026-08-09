import { CAMPAIGN_ID, getOffer } from './_catalog.js';
import { resolveSiteUrl, stripeRequest } from './_stripe.js';

function readBody(request) {
  if (request.body && typeof request.body === 'object') return request.body;
  try { return JSON.parse(request.body || '{}'); } catch { return {}; }
}

function cleanText(value, maxLength) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function cleanWhatsapp(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 15);
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function cleanAnalyticsId(value) {
  const id = String(value || '').trim().slice(0, 120);
  return /^[A-Za-z0-9:_-]{8,120}$/.test(id) ? id : '';
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const body = readBody(request);
    const sku = cleanText(body.sku, 80);
    const name = cleanText(body.name, 120);
    const email = cleanText(body.email, 180).toLowerCase();
    const whatsapp = cleanWhatsapp(body.whatsapp);
    const analytics = body.analytics && typeof body.analytics === 'object' ? body.analytics : {};
    const analyticsSessionId = cleanAnalyticsId(analytics.sessionId);
    const analyticsVisitorId = cleanAnalyticsId(analytics.visitorId);
    const analyticsParentSessionId = cleanAnalyticsId(analytics.parentSessionId);
    const analyticsSource = cleanText(analytics.source, 120);
    const analyticsMedium = cleanText(analytics.medium, 80);
    const analyticsCampaign = cleanText(analytics.campaign, 240);
    const offer = getOffer(sku);

    if (!offer) return response.status(400).json({ error: 'Produto inválido.' });
    if (name.length < 3) return response.status(400).json({ error: 'Informe seu nome completo.' });
    if (!validEmail(email)) return response.status(400).json({ error: 'Informe um e-mail válido.' });
    if (whatsapp.length < 10) return response.status(400).json({ error: 'Informe um WhatsApp válido com DDD.' });

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
    params.set('customer_email', email);
    params.set('billing_address_collection', 'auto');
    params.set('line_items[0][quantity]', '1');
    params.set('line_items[0][price_data][currency]', 'brl');
    params.set('line_items[0][price_data][unit_amount]', String(offer.amount));
    params.set('line_items[0][price_data][product_data][name]', offer.name);
    params.set('line_items[0][price_data][product_data][description]', offer.description);
    params.set('metadata[sku]', offer.id);
    params.set('metadata[campaign]', CAMPAIGN_ID);
    params.set('metadata[buyer_name]', name);
    params.set('metadata[buyer_email]', email);
    params.set('metadata[buyer_whatsapp]', whatsapp);
    if (analyticsSessionId) params.set('metadata[analytics_session_id]', analyticsSessionId);
    if (analyticsVisitorId) params.set('metadata[analytics_visitor_id]', analyticsVisitorId);
    if (analyticsParentSessionId) params.set('metadata[analytics_parent_session_id]', analyticsParentSessionId);
    if (analyticsSource) params.set('metadata[analytics_source]', analyticsSource);
    if (analyticsMedium) params.set('metadata[analytics_medium]', analyticsMedium);
    if (analyticsCampaign) params.set('metadata[analytics_campaign]', analyticsCampaign);
    params.set('payment_intent_data[metadata][sku]', offer.id);
    params.set('payment_intent_data[metadata][campaign]', CAMPAIGN_ID);
    params.set('payment_intent_data[metadata][buyer_name]', name);
    params.set('payment_intent_data[metadata][buyer_email]', email);
    params.set('payment_intent_data[metadata][buyer_whatsapp]', whatsapp);
    if (analyticsSessionId) params.set('payment_intent_data[metadata][analytics_session_id]', analyticsSessionId);
    if (analyticsVisitorId) params.set('payment_intent_data[metadata][analytics_visitor_id]', analyticsVisitorId);
    if (analyticsParentSessionId) params.set('payment_intent_data[metadata][analytics_parent_session_id]', analyticsParentSessionId);
    params.set('submit_type', 'pay');

    if (offer.id === 'colecao-completa') {
      params.set('payment_method_options[card][installments][enabled]', 'true');
    }

    const session = await stripeRequest('/checkout/sessions', { method:'POST', body:params.toString() });
    if (!session.client_secret) throw new Error('A Stripe não devolveu o client_secret do checkout incorporado.');

    response.setHeader('Cache-Control', 'private, no-store, max-age=0');
    return response.status(200).json({ clientSecret:session.client_secret, sessionId:session.id, offer:{ id:offer.id, name:offer.name, amount:offer.amount } });
  } catch (error) {
    console.error('embedded_checkout_session_error', error);
    return response.status(500).json({ error:error instanceof Error ? `Não foi possível iniciar o pagamento: ${error.message}` : 'Não foi possível iniciar o pagamento agora.' });
  }
}
