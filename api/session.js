import { CAMPAIGN_ID, getEntitlements, getOffer, getPublicItem } from './_catalog.js';
import { stripeRequest, validSessionId } from './_stripe.js';

function resendConfigured() {
  const sender =
    process.env.EMAIL_FROM ||
    process.env.RESEND_FROM ||
    process.env.RESEND_FROM_EMAIL;
  return Boolean(
    process.env.RESEND_API_KEY &&
    sender &&
    process.env.STRIPE_WEBHOOK_SECRET
  );
}

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error:'Método não permitido.' });
  }

  const sessionId = String(request.query.session_id || '');
  if (!validSessionId(sessionId)) {
    return response.status(400).json({ error:'Sessão inválida.' });
  }

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

    if (!paid || !offer) {
      return response.status(403).json({ error:'Pagamento ainda não confirmado.' });
    }

    const items = getEntitlements(sku).map(getPublicItem).filter(Boolean);
    const buyerEmail =
      session.metadata?.buyer_email ||
      session.customer_details?.email ||
      session.customer_email ||
      null;

    response.setHeader('Cache-Control', 'private, no-store');
    return response.status(200).json({
      paid:true,
      sku,
      offer:{ id:offer.id, name:offer.name, amount:offer.amount },
      buyer:{
        name:session.metadata?.buyer_name || session.customer_details?.name || null,
        email:buyerEmail,
        whatsapp:session.metadata?.buyer_whatsapp || null,
      },
      email:buyerEmail,
      emailDeliveryConfigured:resendConfigured(),
      items,
    });
  } catch (error) {
    console.error('session_validation_error', error);
    return response.status(500).json({ error:'Não foi possível validar sua compra.' });
  }
}
