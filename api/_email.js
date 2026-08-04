export const RESEND_FROM = 'Apostilas Margareth Almeida <noreply@adhdautism.online>';

function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, (char) => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;',
  }[char]));
}

export function buildLibraryEmail({ name, offerName, libraryUrl, preview = false }) {
  const safeName = escapeHtml(name || 'Cliente');
  const safeOffer = escapeHtml(offerName || 'Apostilas Margareth Almeida');
  const safeUrl = escapeHtml(libraryUrl);
  const previewLabel = preview
    ? '<div style="margin:0 0 18px;padding:12px 16px;border-radius:12px;background:#fff3cd;color:#624b00;font-size:13px;font-weight:700">ENVIO DE TESTE — esta mensagem mostra o modelo recebido pelo comprador.</div>'
    : '';

  return {
    subject: preview
      ? `Prévia do e-mail de compra — ${offerName || 'Apostilas Margareth Almeida'}`
      : `Sua biblioteca está liberada — ${offerName || 'Apostilas Margareth Almeida'}`,
    html: `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#fff8f3;font-family:Arial,sans-serif;color:#18283d"><div style="max-width:680px;margin:0 auto;padding:24px"><div style="background:#09274b;color:#fff;padding:30px;border-radius:22px 22px 0 0"><p style="margin:0 0 8px;color:#f3b69a;font-size:12px;font-weight:700;letter-spacing:.12em">COMPRA APROVADA EM APOSTILA-PROMO.VERCEL.APP</p><h1 style="margin:0;font-family:Georgia,serif;font-size:34px;line-height:1.1">Sua biblioteca está liberada.</h1></div><div style="background:#fff;padding:30px;border:1px solid rgba(9,39,75,.12);border-top:0;border-radius:0 0 22px 22px">${previewLabel}<p>Olá, <strong>${safeName}</strong>.</p><p>Recebemos a confirmação do pagamento de <strong>${safeOffer}</strong>, realizado no site <strong>apostila-promo.vercel.app</strong>.</p><p>Em um único lugar você encontrará tudo o que comprou, com os botões para visualizar e baixar cada apostila.</p><p style="margin:30px 0"><a href="${safeUrl}" style="display:inline-block;background:#a64b2a;color:#fff;text-decoration:none;padding:17px 26px;border-radius:999px;font-weight:700;font-size:16px">Abrir minha biblioteca completa</a></p><div style="padding:18px;border-radius:16px;background:#fff8f3;border-left:4px solid #a64b2a"><strong style="color:#09274b">Guarde este e-mail.</strong><p style="margin:7px 0 0;color:#637083;font-size:13px;line-height:1.55">O botão acima leva à página segura da sua compra. Nela estão somente os materiais vinculados ao pagamento confirmado.</p></div><hr style="border:0;border-top:1px solid rgba(9,39,75,.12);margin:26px 0"><p style="font-size:12px;color:#637083">Os materiais são educativos e não substituem avaliação ou acompanhamento individualizado.</p><p style="margin-top:20px;color:#405047">Com propósito e cuidado,<br><strong>Margareth Almeida</strong><br><span style="font-size:13px;color:#7a8490">Neuropsicopedagoga · Idealizadora do CAA Neuro</span></p></div></div></body></html>`,
  };
}

export async function sendLibraryEmail({ apiKey, to, name, offerName, libraryUrl, idempotencyKey, preview = false }) {
  if (!apiKey) throw new Error('RESEND_API_KEY não configurada.');
  if (!to) throw new Error('E-mail de destino não informado.');

  const message = buildLibraryEmail({ name, offerName, libraryUrl, preview });
  const result = await fetch('https://api.resend.com/emails', {
    method:'POST',
    headers:{
      Authorization:`Bearer ${apiKey}`,
      'Content-Type':'application/json',
      'Idempotency-Key':idempotencyKey,
    },
    body:JSON.stringify({
      from:RESEND_FROM,
      to:[to],
      subject:message.subject,
      html:message.html,
    }),
  });

  const data = await result.json().catch(() => ({}));
  if (!result.ok) throw new Error(data?.message || 'Falha ao enviar e-mail pelo Resend.');
  return data;
}
