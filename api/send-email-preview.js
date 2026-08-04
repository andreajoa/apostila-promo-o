import { sendLibraryEmail } from './_email.js';

const PREVIEW_KEY = 'margareth-20260804-4f2d8a6c1e9b';
const PREVIEW_TO = 'andremuseu@gmail.com';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error:'Método não permitido.' });
  }

  if (String(request.query.key || '') !== PREVIEW_KEY) {
    return response.status(403).json({ error:'Acesso não autorizado.' });
  }

  try {
    const apiKey = String(process.env.RESEND_API_KEY || '').trim();
    const siteUrl = String(process.env.SITE_URL || 'https://apostila-promo.vercel.app').trim().replace(/\/$/, '');
    const result = await sendLibraryEmail({
      apiKey,
      to:PREVIEW_TO,
      name:'Margareth',
      offerName:'Coleção Completa Margareth Almeida',
      libraryUrl:`${siteUrl}/biblioteca-demo.html`,
      idempotencyKey:'preview-andremuseu-20260804-v1',
      preview:true,
    });

    return response.status(200).json({ sent:true, to:PREVIEW_TO, id:result?.id || null });
  } catch (error) {
    console.error('preview_email_error', error);
    return response.status(500).json({
      sent:false,
      error:error instanceof Error ? error.message : 'Falha ao enviar a prévia.',
    });
  }
}
