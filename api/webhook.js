import crypto from 'node:crypto';
import { getEntitlements, getOffer, getPublicItem } from './_catalog.js';

export const config = { api: { bodyParser: false } };

const RESEND_FROM = 'CAA Neuro <noreply@adhdautism.online>';

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

async function sendResendEmail({ apiKey, to, subject, html, idempotencyKey }) {
  const result = await fetch('https://api.resend.com/emails', {
    method:'POST',
    headers:{
      Authorization:`Bearer ${apiKey}`,
      'Content-Type':'application/json',
      'Idempotency-Key':idempotencyKey,
    },
    body:JSON.stringify({ from:RESEND_FROM, to:[to], subject, html }),
  });
  const data = await result.json().catch(() => ({}));
  if (!result.ok) throw new Error(data?.message || 'Falha ao enviar e-mail pelo Resend.');
  return data;
}

function materialLinksHtml(session, siteUrl, sku) {
  const items = getEntitlements(sku).map(getPublicItem).filter(Boolean);
  if (!items.length) return '';
  const rows = items.map((item) => {
    const href = `${siteUrl}/api/access?session_id=${encodeURIComponent(session.id)}&item=${encodeURIComponent(item.id)}`;
    const action = item.type === 'pdf' ? 'Baixar apostila' : 'Abrir recurso';
    return `<tr><td style="padding:14px 0;border-bottom:1px solid #eadfd7"><strong style="color:#09274b">${escapeHtml(item.name)}</strong><br><span style="font-size:12px;color:#6d7886">${item.type === 'pdf' ? 'Apostila digital' : 'Recurso interativo'}</span></td><td style="padding:14px 0;border-bottom:1px solid #eadfd7;text-align:right"><a href="${href}" style="display:inline-block;color:#a64b2a;font-weight:700;text-decoration:none">${action} →</a></td></tr>`;
  }).join('');
  return `<div style="margin-top:28px"><h2 style="margin:0 0 10px;font-family:Georgia,serif;color:#09274b;font-size:24px">Seus materiais</h2><p style="margin:0 0 8px;color:#637083;font-size:13px">Acesse cada item diretamente pelos links abaixo.</p><table role="presentation" style="width:100%;border-collapse:collapse">${rows}</table></div>`;
}

function emailShell(content) {
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#fff8f3;font-family:Arial,sans-serif;color:#18283d"><div style="max-width:680px;margin:0 auto;padding:24px">${content}</div></body></html>`;
}

async function sendPurchaseEmails(session, eventId) {
  const apiKey = String(process.env.RESEND_API_KEY || '').trim();
  const siteUrl = String(process.env.SITE_URL || '').trim().replace(/\/$/, '');
  if (!apiKey || !siteUrl) throw new Error('RESEND_API_KEY ou SITE_URL não configurada.');

  const email = session.metadata?.buyer_email || session.customer_details?.email || session.customer_email;
  if (!email) throw new Error('Compra sem e-mail para entrega.');

  const name = session.metadata?.buyer_name || session.customer_details?.name || 'Cliente';
  const whatsapp = session.metadata?.buyer_whatsapp || 'não informado';
  const sku = String(session.metadata?.sku || '');
  const offer = getOffer(sku);
  const libraryUrl = `${siteUrl}/sucesso.html?session_id=${encodeURIComponent(session.id)}`;
  const materials = materialLinksHtml(session, siteUrl, sku);

  const confirmationHtml = emailShell(`<div style="background:#09274b;color:white;padding:30px;border-radius:22px 22px 0 0"><p style="margin:0 0 8px;color:#f3b69a;font-size:12px;font-weight:700;letter-spacing:.12em">COMPRA APROVADA</p><h1 style="margin:0;font-family:Georgia,serif;font-size:34px">Pagamento confirmado com sucesso.</h1></div><div style="background:white;padding:30px;border:1px solid rgba(9,39,75,.12);border-top:0;border-radius:0 0 22px 22px"><p>Olá, <strong>${escapeHtml(name)}</strong>.</p><p>Seu pagamento de <strong>${escapeHtml(offer?.name || 'seu material')}</strong> foi confirmado pela Stripe.</p><p>Em seguida, você receberá outro e-mail com o acesso completo às apostilas. O acesso também já pode ser aberto pelo botão abaixo.</p><p style="margin:28px 0"><a href="${libraryUrl}" style="display:inline-block;background:#a64b2a;color:white;text-decoration:none;padding:16px 24px;border-radius:999px;font-weight:700">Acessar minha compra</a></p><p style="font-size:13px;color:#637083">WhatsApp cadastrado: ${escapeHtml(whatsapp)}.</p><p style="margin-top:24px;color:#405047">Com propósito e cuidado,<br><strong>Margareth Almeida</strong></p></div>`);

  const deliveryHtml = emailShell(`<div style="background:#09274b;color:white;padding:30px;border-radius:22px 22px 0 0"><p style="margin:0 0 8px;color:#f3b69a;font-size:12px;font-weight:700;letter-spacing:.12em">MATERIAIS LIBERADOS</p><h1 style="margin:0;font-family:Georgia,serif;font-size:34px">Suas apostilas estão prontas para baixar.</h1></div><div style="background:white;padding:30px;border:1px solid rgba(9,39,75,.12);border-top:0;border-radius:0 0 22px 22px"><p>Olá novamente, <strong>${escapeHtml(name)}</strong>.</p><p>Sua biblioteca digital está liberada. Use o botão principal ou escolha cada apostila individualmente abaixo.</p><p style="margin:28px 0"><a href="${libraryUrl}" style="display:inline-block;background:#a64b2a;color:white;text-decoration:none;padding:16px 24px;border-radius:999px;font-weight:700">Abrir minha biblioteca</a></p>${materials}<p style="margin-top:26px;font-size:13px;color:#637083">Guarde este e-mail. Os links contêm a identificação segura da sua compra.</p><hr style="border:0;border-top:1px solid rgba(9,39,75,.12);margin:24px 0"><p style="font-size:12px;color:#637083">Os materiais são educativos e não substituem avaliação ou acompanhamento individualizado.</p><p style="margin-top:20px;color:#405047">Com propósito e cuidado,<br><strong>Margareth Almeida</strong><br><span style="font-size:13px;color:#7a8490">Neuropsicopedagoga · Idealizadora do CAA Neuro</span></p></div>`);

  await sendResendEmail({
    apiKey,
    to:email,
    subject:`Compra aprovada — ${offer?.name || 'Coleção Margareth Almeida'}`,
    html:confirmationHtml,
    idempotencyKey:`${eventId}-confirmacao`,
  });
  await sendResendEmail({
    apiKey,
    to:email,
    subject:`Seus materiais estão liberados — ${offer?.name || 'apostilas'}`,
    html:deliveryHtml,
    idempotencyKey:`${eventId}-entrega`,
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
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data?.object;
      if (session?.payment_status === 'paid') await sendPurchaseEmails(session, event.id);
    }

    return response.status(200).json({ received:true });
  } catch (error) {
    console.error('stripe_webhook_error', error);
    return response.status(500).json({ error:error instanceof Error ? error.message : 'Erro no webhook.' });
  }
}
