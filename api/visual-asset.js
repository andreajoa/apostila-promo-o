import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = 'funnel-atlas-mini.b64';
const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));

function validateAndDecode(encoded) {
  const clean = String(encoded || '').replace(/\s+/g, '');
  if (clean.length < 1000) throw new Error('O arquivo base64 está vazio ou incompleto.');

  const image = Buffer.from(clean, 'base64');
  const riff = image.subarray(0, 4).toString('ascii');
  const webp = image.subarray(8, 12).toString('ascii');
  if (!image.length || riff !== 'RIFF' || webp !== 'WEBP') {
    throw new Error('O conteúdo decodificado não é um WebP válido.');
  }
  return image;
}

function requestOrigin(request) {
  const forwardedHost = String(request.headers['x-forwarded-host'] || '').split(',')[0].trim();
  const host = forwardedHost || String(request.headers.host || '').trim();
  const forwardedProto = String(request.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const protocol = forwardedProto || 'https';
  if (!host) throw new Error('Host do deploy não identificado.');
  return `${protocol}://${host}`;
}

async function readFromStaticDeployment(request) {
  const assetUrl = new URL(`/assets/${filename}?v=2026080404`, requestOrigin(request));
  const result = await fetch(assetUrl, {
    cache: 'no-store',
    headers: { accept: 'text/plain,application/octet-stream;q=0.9,*/*;q=0.8' },
  });
  if (!result.ok) {
    throw new Error(`Arquivo estático respondeu HTTP ${result.status}.`);
  }
  return validateAndDecode(await result.text());
}

async function readFromFunctionBundle() {
  const candidates = [
    new URL(`../assets/${filename}`, import.meta.url),
    path.join(process.cwd(), 'assets', filename),
    path.join(moduleDirectory, '..', 'assets', filename),
    path.join('/var/task', 'assets', filename),
  ];

  let lastError;
  for (const candidate of candidates) {
    try {
      return validateAndDecode(await readFile(candidate, 'utf8'));
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Arquivo não encontrado no pacote da função.');
}

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).send('Método não permitido.');
  }

  if (String(request.query.name || '') !== 'funnel') {
    return response.status(404).send('Imagem não encontrada.');
  }

  try {
    let image;
    let source = 'static-deployment';
    try {
      image = await readFromStaticDeployment(request);
    } catch (staticError) {
      console.error('visual_asset_static_error', staticError);
      source = 'function-bundle';
      image = await readFromFunctionBundle();
    }

    response.setHeader('Content-Type', 'image/webp');
    response.setHeader('Content-Length', String(image.byteLength));
    response.setHeader('Content-Disposition', 'inline; filename="apostilas-margareth.webp"');
    response.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=3600');
    response.setHeader('X-Visual-Asset-Source', source);
    response.setHeader('X-Content-Type-Options', 'nosniff');
    return response.status(200).send(image);
  } catch (error) {
    console.error('visual_asset_fatal_error', error);
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return response.status(500).send(`Falha ao carregar a imagem: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
  }
}
