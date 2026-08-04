export default function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Método não permitido.' });
  }

  const publishableKey = String(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    process.env.STRIPE_PUBLISHABLE_KEY ||
    ''
  ).trim();

  if (!publishableKey.startsWith('pk_')) {
    return response.status(500).json({
      error: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY não configurada corretamente.',
    });
  }

  response.setHeader('Cache-Control', 'private, no-store, max-age=0');
  return response.status(200).json({ publishableKey });
}
