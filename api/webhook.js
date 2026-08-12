import crypto from 'node:crypto';
import { CAMPAIGN_ID, getOffer } from './_catalog.js';
import { sendLibraryEmail } from './_email.js';
import { recordAnalyticsEvent } from './_analytics.js';

export const config = { api: { bodyParser: false } };

const SITE_ID = 'apostila_combo';

async function readRawBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function verifyStripeSignature(payload, header, secret) {
  const parts = String(header || '').split(',').map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith('t='))?.slice(2);
  const signatures = parts.filter((part) => part.startsWith('v1=')).map((part) => part.slice(3));
  if (!timestamp || !signatures.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${payload.toString('utf8')}`)
    .digest('hex');

  return signatures.some((signature) => {
    try {
      const received = Buffer.from(signature, 'hex');
      const calculated = Buffer.from(expected, 'hex');
      return received.length === calculated.length && crypto.timingSafeEqual(received, calculated);
    } catch {
      return false;
    }
  });
}

function belongsToApostila(session) {
  const metadata = session?.metadata || {};
  if (metadata.site_id === SITE_ID) return true;

  // Compatibilidade com checkouts que já estavam abertos antes da separação:
  // só aceitamos o padrão legado se campanha E SKU forem da apostila.
  return metadata.campaign === CAMPAIGN_ID && Boolean(getOffer(String(metadata.sku || '')));
}

async function deliverPurchaseEmail(session, eventId) {
  const apiKey = String(process.env.RESEND_API_KEY || '').trim();
  const siteUrl = String(process.env.SITE_URL || 'https://apostila-promo.vercel.app').trim().replace(/\/$/, '');
  const email =
    session.metadata?.buyer_email ||
    session.customer_details?.email ||
    session.customer_email;
  const name = session.metadata?.buyer_name || session.customer_details?.name || 'Cliente';
  const sku = String(session.metadata?.sku || '');
  const offer = getOffer(sku);
  const libraryUrl = `${siteUrl}/sucesso.html?session_id=${encodeURIComponent(session.id)}`;

  return sendLibraryEmail({
    apiKey,
    to:email,
    name,
    offerName:offer?.name || 'Apostilas Margareth Almeida',
    libraryUrl,
    idempotencyKey:`${eventId}-biblioteca`,
  });
}

function analyticsId(value, fallback) {
  const id = String(value || '').trim().slice(0, 120);
  return /^[A-Za-z0-9:_-]{8,120}$/.test(id) ? id : fallback;
}

async function recordPurchaseAnalytics(session, eventId) {
  const metadata = session.metadata || {};
  const offer = getOffer(String(metadata.sku || ''));
  const sessionId = analyticsId(metadata.analytics_session_id, `stripe:${session.id}`);
  const visitorId = analyticsId(metadata.analytics_visitor_id, `stripe:${session.id}`);
  const parentSessionId = analyticsId(metadata.analytics_parent_session_id, '');

  return recordAnalyticsEvent({
    event_id:analyticsId(`stripe:${eventId}`, `stripe:${session.id}`),
    session_id:sessionId,
    visitor_id:visitorId,
    parent_session_id:parentSessionId,
    event_name:'purchase',
    path:'/sucesso.html',
    landing_path:'/',
    source:String(metadata.analytics_source || '').slice(0, 120),
    medium:String(metadata.analytics_medium || '').slice(0, 80),
    campaign:String(metadata.analytics_campaign || metadata.campaign || '').slice(0, 240),
    product_id:String(metadata.sku || '').slice(0, 120),
    product_name:String(offer?.name || session.custom_text?.submit?.message || 'Apostilas Margareth Almeida').slice(0, 500),
    value_cents:Number(session.amount_total || 0),
    transaction_id:String(session.id || '').slice(0, 160),
  }, SITE_ID);
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error:'Método não permitido.' });
  }

  try {
    const secret = String(process.env.STRIPE_WEBHOOK_SECRET || '').trim();
    if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET não configurada.');

    const rawBody = await readRawBody(request);
    const signature = request.headers['stripe-signature'];
    if (!verifyStripeSignature(rawBody, signature, secret)) {
      return response.status(400).json({ error:'Assinatura inválida.' });
    }

    const event = JSON.parse(rawBody.toString('utf8'));
    let emailDelivered = null;
    let analyticsRecorded = null;

    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      const session = event.data?.object;

      if (!belongsToApostila(session)) {
        return response.status(200).json({
          received:true,
          ignored:true,
          reason:'foreign_checkout',
        });
      }

      if (session?.payment_status === 'paid') {
        try {
          await deliverPurchaseEmail(session, event.id);
          emailDelivered = true;
        } catch (emailError) {
          emailDelivered = false;
          console.error('resend_delivery_error', emailError);
        }
        try {
          await recordPurchaseAnalytics(session, event.id);
          analyticsRecorded = true;
        } catch (analyticsError) {
          analyticsRecorded = false;
          console.error('purchase_analytics_error', analyticsError);
        }
      }
    }

    return response.status(200).json({ received:true, emailDelivered, analyticsRecorded });
  } catch (error) {
    console.error('stripe_webhook_error', error);
    return response.status(500).json({
      error:error instanceof Error ? error.message : 'Erro no webhook.',
    });
  }
}
