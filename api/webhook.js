import crypto from 'node:crypto';
import { getOffer } from './_catalog.js';
import { sendLibraryEmail } from './_email.js';

export const config = { api: { bodyParser: false } };

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

    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      const session = event.data?.object;
      if (session?.payment_status === 'paid') {
        try {
          await deliverPurchaseEmail(session, event.id);
          emailDelivered = true;
        } catch (emailError) {
          emailDelivered = false;
          console.error('resend_delivery_error', emailError);
        }
      }
    }

    return response.status(200).json({ received:true, emailDelivered });
  } catch (error) {
    console.error('stripe_webhook_error', error);
    return response.status(500).json({
      error:error instanceof Error ? error.message : 'Erro no webhook.',
    });
  }
}
