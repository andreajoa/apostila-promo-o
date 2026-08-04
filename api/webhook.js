import crypto from 'node:crypto';
import { getOffer } from './_catalog.js';

export const config = { api: { bodyParser: false } };

const RESEND_FROM = 'Apostilas Margareth Almeida <noreply@adhdautism.online>';

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

function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, (char) => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;',
  }[char]));
}

async function sendLibraryEmail(session, eventId) {
  const apiKey = String(process.env.RESEND_API_KEY || '').trim();
  const siteUrl = String(process.env.SITE_URL || 'https://apostila-promo.vercel.app').trim().replace(/\/$/, '');
  if (!apiKey) throw new Error('RESEND_API_KEY não configurada.');

  const email =
    session.metadata?.buyer_email ||
    session.customer_details?.email ||
    session.customer_email;
  if (!email) throw new Error('Compra sem e-mail para entrega.');

  const name = session.metadata?.buyer_name || session.customer_details?.name || 'Cliente';
  const sku = String(session.metadata?.sku || '');
  const offer = getOffer(sku);
  const libraryUrl = `${siteUrl}/sucesso.html?session_id=${encodeURIComponent(session.id)}`;

  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#fff8f3;font-family:Arial,sans-serif;color:#18283d"><div style="max-width:680px;margin:0 auto;padding:24px"><div style="background:#09274b;color:#fff;padding:30px;border-radius:22px 22px 0 0"><p style="margin:0 0 8px;color:#f3b69a;font-size:12px;font-weight:700;letter-spacing:.12em">COMPRA APROVADA EM APOSTILA-PROMO.VERCEL.APP</p><h1 style="margin:0;font-family:Georgia,serif;font-size:34px;line-height:1.1">Sua biblioteca está liberada.</h1></div><div style="background:#fff;padding:30px;border:1px solid rgba(9,39,75,.12);border-top:0;border-radius:0 0 22px 22px"><p>Olá, <strong>${escapeHtml(name)}</strong>.</p><p>Recebemos a confirmação do pagamento de <strong>${escapeHtml(offer?.name || 'seu material')}</strong>, realizado no site <strong>apostila-promo.vercel.app</strong>.</p><p>Em um único lugar você encontrará tudo o que comprou, com os botões para visualizar e baixar cada apostila.</p><p style="margin:30px 0"><a href="${libraryUrl}" style="display:inline-block;background:#a64b2a;color:#fff;text-decoration:none;padding:17px 26px;border-radius:999px;font-weight:700;font-size:16px">Abrir minha biblioteca completa</a></p><div style="padding:18px;border-radius:16px;background:#fff8f3;border-left:4px solid #a64b2a"><strong style="color:#09274b">Guarde este e-mail.</strong><p style="margin:7px 0 0;color:#637083;font-size:13px;line-height:1.55">O botão acima leva à página segura da sua compra. Nela estão somente os materiais vinculados ao pagamento confirmado.</p></div><hr style="border:0;border-top:1px solid rgba(9,39,75,.12);margin:26px 0"><p style="font-size:12px;color:#637083">Os materiais são educativos e não substituem avaliação ou acompanhamento individualizado.</p><p style="margin-top:20px;color:#405047">Com propósito e cuidado,<br><strong>Margareth Almeida</strong><br><span style="font-size:13px;color:#7a8490">Neuropsicopedagoga · Idealizadora do CAA Neuro</span></p></div></div></body></html>`;

  const result = await fetch('https://api.resend.com/emails', {
    method:'POST',
    headers:{
      Authorization:`Bearer ${apiKey}`,
      'Content-Type':'application/json',
      'Idempotency-Key':`${eventId}-biblioteca`,
    },
    body:JSON.stringify({
      from:RESEND_FROM,
      to:[email],
      subject:`Sua biblioteca está liberada — ${offer?.name || 'Apostilas Margareth Almeida'}`,
      html,
    }),
  });

  const data = await result.json().catch(() => ({}));
  if (!result.ok) throw new Error(data?.message || 'Falha ao enviar e-mail pelo Resend.');
  return data;
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
          await sendLibraryEmail(session, event.id);
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
