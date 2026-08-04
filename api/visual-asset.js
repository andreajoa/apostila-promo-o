import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = 'funnel-atlas-mini.b64';
const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));

const candidates = [
  new URL(`../assets/${filename}`, import.meta.url),
  path.join(process.cwd(), 'assets', filename),
  path.join(moduleDirectory, '..', 'assets', filename),
  path.join('/var/task', 'assets', filename),
];

async function readEncodedAsset() {
  let lastError;
  for (const candidate of candidates) {
    try {
      const encoded = await readFile(candidate, 'utf8');
      if (encoded && encoded.trim().length > 100) return encoded.trim();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Arquivo de imagem não encontrado no pacote.');
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
    const encoded = await readEncodedAsset();
    const image = Buffer.from(encoded, 'base64');
    const riff = image.subarray(0, 4).toString('ascii');
    const webp = image.subarray(8, 12).toString('ascii');
    if (!image.length || riff !== 'RIFF' || webp !== 'WEBP') {
      throw new Error('O arquivo empacotado não é uma imagem WebP válida.');
    }

    response.setHeader('Content-Type', 'image/webp');
    response.setHeader('Content-Length', String(image.byteLength));
    response.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    return response.status(200).send(image);
  } catch (error) {
    console.error('visual_asset_error', error);
    response.setHeader('Cache-Control', 'no-store');
    return response.status(500).send('Não foi possível carregar a imagem do site.');
  }
}
