import { readFile } from 'node:fs/promises';
import path from 'node:path';

const ASSETS = {
  funnel: 'assets/funnel-atlas-mini.b64',
};

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).send('Método não permitido.');
  }

  const name = String(request.query.name || '');
  const relativePath = ASSETS[name];
  if (!relativePath) return response.status(404).send('Imagem não encontrada.');

  try {
    const encoded = await readFile(path.join(process.cwd(), relativePath), 'utf8');
    const image = Buffer.from(encoded.trim(), 'base64');

    response.setHeader('Content-Type', 'image/webp');
    response.setHeader('Content-Length', String(image.byteLength));
    response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    return response.status(200).send(image);
  } catch (error) {
    console.error('visual_asset_error', error);
    return response.status(500).send('Não foi possível carregar a imagem.');
  }
}
