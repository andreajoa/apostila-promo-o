import { readFile } from 'node:fs/promises';

const ASSETS = {
  funnel: new URL('../assets/funnel-atlas-mini.b64', import.meta.url),
};

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow','GET');
    return response.status(405).send('Método não permitido.');
  }

  const name = String(request.query.name || '');
  const fileUrl = ASSETS[name];
  if (!fileUrl) return response.status(404).send('Imagem não encontrada.');

  try {
    const encoded = await readFile(fileUrl,'utf8');
    const image = Buffer.from(encoded.trim(),'base64');
    if (!image.length) throw new Error('Arquivo de imagem vazio.');

    response.setHeader('Content-Type','image/webp');
    response.setHeader('Content-Length',String(image.byteLength));
    response.setHeader('Cache-Control','public, max-age=31536000, immutable');
    response.setHeader('X-Content-Type-Options','nosniff');
    return response.status(200).send(image);
  } catch (error) {
    console.error('visual_asset_error',error);
    return response.status(500).send('Não foi possível carregar a imagem.');
  }
}
