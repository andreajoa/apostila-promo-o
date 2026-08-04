import crypto from 'node:crypto';
import { getOffer } from './_catalog.js';

export const config = { api: { bodyParser: false } };

async function readRawBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function verifyStripeSignature(payload, header, secret) {
  const parts = String(header || '').split(',').map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith('t='))?.slice(2);
  const signatures = parts.filter((part) => part.startsWith('v1=')).map((part) => part.slice(3));
  if (!timestamp || !signatures.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${payload.toString('utf8')}`).digest('hex');
  return signatures.some((signature) => {
    try {
      const a = Buffer.from(signature, 'hex');
      const b = Buffer.from(expected, 'hex');
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  });
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));
}

async function sendDeliveryEmail(session, eventId) {
  const apiKey = String(process.env.BREVO_API_KEY || '').trim();
  const senderEmail = String(process.env.BREVO_FROM_EMAIL || '').trim();
  const senderName = String(process.env.BREVO_FROM_NAME || 'Margareth Almeida').trim();
  const siteUrl = String(process.env.SITE_URL || '').trim().replace(/\/$/, '');

  if (!apiKey || !senderEmail || !siteUrl) {
    throw new Error('BREVO_API_KEY, BREVO_FROM_EMAIL ou SITE_URL não configurada.');
  }

  const email = session.metadata?.buyer_email || session.customer_details?.email || session.customer_email;
  if (!email) throw new Error('Compra sem e-mail para entrega.');

  const name = session.metadata?.buyer_name || session.customer_details?.name || 'Cliente';
  const whatsapp = session.metadata?.buyer_whatsapp || 'não informado';
  const offer = getOffer(String(session.metadata?.sku || ''));
  const libraryUrl = `${siteUrl}/sucesso.html?session_id=${encodeURIComponent(session.id)}`;

  const htmlContent = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#fff8f3;font-family:Arial,sans-serif;color:#18283d"><div style="max-width:640px;margin:0 auto;padding:28px"><div style="background:#09274b;color:white;padding:28px;border-radius:22px 22px 0 0"><p style="margin:0 0 8px;color:#f3b69a;font-size:12px;font-weight:700;letter-spacing:.12em">PAGAMENTO CONFIRMADO</p><h1 style="margin:0;font-family:Georgia,serif;font-size:34px">Seu material está liberado.</h1></div><div style="background:white;padding:28px;border:1px solid rgba(9,39,75,.12);border-top:0;border-radius:0 0 22px 22px"><p>Olá, <strong>${escapeHtml(name)}</strong>.</p><p>Recebemos a confirmação do pagamento de <strong>${escapeHtml(offer?.name || 'seu material')}</strong>. Use o botão abaixo para acessar sua biblioteca digital.</p><p style="margin:28px 0"><a href="${libraryUrl}" style="display:inline-block;background:#a64b2a;color:white;text-decoration:none;padding:16px 24px;border-radius:999px;font-weight:700">Acessar meus materiais</a></p><p style="font-size:13px;color:#637083">Guarde este e-mail. O link contém a identificação segura da compra. WhatsApp cadastrado: ${escapeHtml(whatsapp)}.</p><hr style="border:0;border-top:1px solid rgba(9,39,75,.12);margin:24px 0"><p style="font-size:12px;color:#637083">Os materiais são educativos e não substituem avaliação ou acompanhamento individualizado.</p></div></div></body></html>`;

  const result = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email, name }],
      subject: `Seu acesso: ${offer?.name || 'Coleção Margareth Almeida'}`,
      htmlContent,
      tags: ['apostila-promo', 'entrega-automatica'],
      headers: {
        'X-Stripe-Event-Id': eventId,
        'X-Stripe-Session-Id': session.id,
      },
    }),
  });

  const data = await result.json().catch(() => ({}));
  if (!result.ok) {
    throw new Error(data?.message || 'Falha ao enviar o e-mail de entrega pelo Brevo.');
  }
  return data;
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const secret = String(process.env.STRIPE_WEBHOOK_SECRET || '').trim();
    if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET não configurada.');

    const rawBody = await readRawBody(request);
    const signature = request.headers['stripe-signature'];
    if (!verifyStripeSignature(rawBody, signature, secret)) {
      return response.status(400).json({ error: 'Assinatura inválida.' });
    }

    const event = JSON.parse(rawBody.toString('utf8'));
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data?.object;
      if (session?.payment_status === 'paid') {
        await sendDeliveryEmail(session, event.id);
      }
    }

    return response.status(200).json({ received: true });
  } catch (error) {
    console.error('stripe_webhook_error', error);
    return response.status(500).json({
      error: error instanceof Error ? error.message : 'Erro no webhook.',
    });
  }
}
