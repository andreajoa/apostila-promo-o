export default function handler(request, response) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="16" fill="#09274B"/>
    <circle cx="49" cy="15" r="11" fill="#A64B2A"/>
    <path d="M14 46V18h8l10 14 10-14h8v28h-8V30L32 43 22 30v16Z" fill="#FFF8F3"/>
    <path d="M46 47c-5-5-10 2-5 7l5 4 5-4c5-5 0-12-5-7Z" fill="#C88664"/>
  </svg>`;

  response.setHeader('Content-Type','image/svg+xml; charset=utf-8');
  response.setHeader('Cache-Control','public, max-age=31536000, immutable');
  return response.status(200).send(svg);
}
