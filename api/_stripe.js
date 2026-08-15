export async function stripeRequest(path, options = {}) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error('STRIPE_SECRET_KEY não configurada.');

  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Erro ao comunicar com a Stripe.');
  }
  return data;
}

export function resolveSiteUrl(request) {
  const configured = String(process.env.SITE_URL || '').trim().replace(/\/$/, '');
  if (configured) return configured;
  const host = String(request.headers['x-forwarded-host'] || request.headers.host || '');
  const protocol = String(request.headers['x-forwarded-proto'] || 'https');
  return host ? `${protocol}://${host}` : '';
}

export function validSessionId(value) {
  return /^cs_(test_|live_)?[A-Za-z0-9]+$/.test(String(value || ''));
}
