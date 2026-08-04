const PALETTE = {
  navy: '#09274B',
  navyLight: '#123A6B',
  terracotta: '#A64B2A',
  terracottaLight: '#C88664',
  cream: '#FFF8F3',
  blush: '#F3DED0',
  sage: '#78866B',
  sageLight: '#9FAD8E',
  white: '#FFFFFF',
};

function escapeXml(value = '') {
  return String(value).replace(/[<>&'"]/g, (char) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
  }[char]));
}

function backdrop(w, h, flip) {
  const circleX = flip ? w - 140 : 140;
  const blobX = flip ? 120 : w - 120;
  return `
    <rect width="${w}" height="${h}" fill="${PALETTE.navy}"/>
    <circle cx="${circleX}" cy="${h * 0.12}" r="${h * 0.34}" fill="${PALETTE.navyLight}"/>
    <circle cx="${blobX}" cy="${h * 0.92}" r="${h * 0.4}" fill="${PALETTE.terracotta}" opacity=".9"/>
    <path d="M0 ${h * 0.78}Q${w * 0.25} ${h * 0.62} ${w * 0.5} ${h * 0.8}T${w} ${h * 0.7}V${h}H0Z" fill="${PALETTE.sage}" opacity=".85"/>
    <g opacity=".18" fill="${PALETTE.cream}">${Array.from({ length: 24 }, (_, i) => `<circle cx="${(i % 8) * (w / 8) + 20}" cy="${Math.floor(i / 8) * 26 + 22}" r="3"/>`).join('')}</g>
  `;
}

function adult(x, y, s, color) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="${color}"><circle cx="0" cy="0" r="30"/><path d="M-52 118c0-52 24-88 52-88s52 36 52 88Z"/></g>`;
}

function child(x, y, s, color) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="${color}"><circle cx="0" cy="0" r="22"/><path d="M-38 84c0-38 17-64 38-64s38 26 38 64Z"/></g>`;
}

function spiralBooklet(x, y, w, h, color, rings = 10) {
  const ringSpacing = h / rings;
  return `
    <g transform="translate(${x} ${y})">
      <rect x="10" y="0" width="${w}" height="${h}" rx="10" fill="${color}"/>
      <rect x="10" y="0" width="${w}" height="${h}" rx="10" fill="none" stroke="${PALETTE.cream}" stroke-opacity=".35" stroke-width="3"/>
      ${Array.from({ length: rings }, (_, i) => `<ellipse cx="10" cy="${ringSpacing / 2 + i * ringSpacing}" rx="9" ry="6" fill="none" stroke="${PALETTE.navy}" stroke-width="4"/>`).join('')}
    </g>
  `;
}

function heartIcon(x, y, s, color) {
  return `<path transform="translate(${x} ${y}) scale(${s})" fill="${color}" d="M0 34c-26-22-46-38-46-60 0-14 11-24 24-24 9 0 16 4 22 12 6-8 13-12 22-12 13 0 24 10 24 24 0 22-20 38-46 60Z"/>`;
}

function shieldIcon(x, y, s, color) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M0-58l58 22v50c0 46-26 82-58 100-32-18-58-54-58-100v-50Z"/>
    <path d="M-24 2l18 18 32-38"/>
  </g>`;
}

function starIcon(x, y, s, color) {
  return `<path transform="translate(${x} ${y}) scale(${s})" fill="${color}" d="M0-30 9-9l23 2-17 15 5 22-20-12-20 12 5-22-17-15 23-2Z"/>`;
}

function chatBubble(x, y, w, h, color, tailRight = false) {
  const tail = tailRight
    ? `<path d="M${w - 34} ${h}l0 20 22-20Z" fill="${color}"/>`
    : `<path d="M34 ${h}l0 20-22-20Z" fill="${color}"/>`;
  return `<g transform="translate(${x} ${y})"><rect width="${w}" height="${h}" rx="${h / 2}" fill="${color}"/>${tail}</g>`;
}

function deviceIcon(x, y, kind, color) {
  if (kind === 'phone') {
    return `<g transform="translate(${x} ${y})"><rect width="70" height="130" rx="14" fill="${color}"/><rect x="8" y="12" width="54" height="96" rx="4" fill="${PALETTE.navy}"/></g>`;
  }
  if (kind === 'tablet') {
    return `<g transform="translate(${x} ${y})"><rect width="120" height="150" rx="14" fill="${color}"/><rect x="10" y="12" width="100" height="118" rx="4" fill="${PALETTE.navy}"/></g>`;
  }
  return `<g transform="translate(${x} ${y})"><rect width="200" height="126" rx="10" fill="${color}"/><rect x="10" y="10" width="180" height="98" rx="4" fill="${PALETTE.navy}"/><rect x="-14" y="126" width="228" height="14" rx="6" fill="${color}"/></g>`;
}

function ribbon(x, y, label) {
  return `
    <rect x="${x}" y="${y}" width="${label.length * 12 + 56}" height="46" rx="23" fill="${PALETTE.cream}" fill-opacity=".95"/>
    <text x="${x + (label.length * 12 + 56) / 2}" y="${y + 30}" text-anchor="middle" fill="${PALETTE.terracotta}" font-family="Arial,sans-serif" font-size="19" font-weight="800" letter-spacing="1.5">${escapeXml(label)}</text>
  `;
}

const SCENES = {
  a1: { w: 1200, h: 675, kicker: 'COLEÇÃO COMPLETA', build: (w, h) => `
    ${backdrop(w, h, false)}
    ${adult(300, 430, 1.5, PALETTE.cream)}
    ${child(400, 470, 1.4, PALETTE.terracottaLight)}
    ${heartIcon(350, 260, 1.1, PALETTE.sageLight)}
    ${spiralBooklet(760, 150, 150, 220, PALETTE.terracotta)}
    ${spiralBooklet(840, 190, 150, 220, PALETTE.sage)}
    ${spiralBooklet(920, 150, 150, 220, PALETTE.terracottaLight)}
    ${ribbon(700, 50, '12 APOSTILAS PRÁTICAS')}
  ` },
  a2: { w: 1200, h: 675, kicker: 'BAIXE, IMPRIMA E ENCADERNE', build: (w, h) => `
    ${backdrop(w, h, true)}
    ${spiralBooklet(210, 90, 190, 300, PALETTE.terracotta)}
    ${spiralBooklet(430, 150, 190, 300, PALETTE.sage, 14)}
    ${spiralBooklet(650, 90, 190, 300, PALETTE.terracottaLight)}
    <g transform="translate(940 300)" fill="none" stroke="${PALETTE.cream}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="-46" y="-10" width="92" height="60" rx="8"/>
      <rect x="-32" y="-46" width="64" height="40" rx="4"/>
      <rect x="-26" y="20" width="52" height="46" rx="4" fill="${PALETTE.cream}"/>
    </g>
    ${ribbon(870, 430, 'IMPRESSO EM CASA')}
  ` },
  a3: { w: 1200, h: 675, kicker: 'USO EM FAMÍLIA', build: (w, h) => `
    ${backdrop(w, h, false)}
    <ellipse cx="600" cy="470" rx="230" ry="34" fill="${PALETTE.navyLight}"/>
    ${adult(430, 380, 1.55, PALETTE.cream)}
    ${child(600, 420, 1.35, PALETTE.terracottaLight)}
    ${child(760, 415, 1.2, PALETTE.sageLight)}
    <g transform="rotate(-6 595 380)">
      <rect x="520" y="330" width="150" height="105" rx="10" fill="${PALETTE.cream}"/>
      <line x1="540" y1="358" x2="650" y2="358" stroke="${PALETTE.sage}" stroke-width="4" stroke-linecap="round"/>
      <line x1="540" y1="380" x2="630" y2="380" stroke="${PALETTE.sage}" stroke-width="4" stroke-linecap="round"/>
      <line x1="540" y1="402" x2="645" y2="402" stroke="${PALETTE.sage}" stroke-width="4" stroke-linecap="round"/>
    </g>
    ${heartIcon(600, 190, 1.3, PALETTE.terracottaLight)}
    ${ribbon(430, 70, 'CASA • ESCOLA • ATENDIMENTO')}
  ` },
  a4: { w: 1200, h: 675, kicker: 'COMUNICAÇÃO ILUSTRATIVA', build: (w, h) => `
    ${backdrop(w, h, true)}
    ${chatBubble(150, 130, 340, 92, PALETTE.cream)}
    ${starIcon(230, 176, 1.3, PALETTE.terracotta)}
    ${starIcon(300, 176, 1.3, PALETTE.terracotta)}
    ${starIcon(370, 176, 1.3, PALETTE.terracotta)}
    ${chatBubble(660, 250, 380, 92, PALETTE.terracottaLight, true)}
    ${heartIcon(850, 296, 1.4, PALETTE.cream)}
    ${chatBubble(220, 420, 360, 92, PALETTE.sageLight)}
    <g transform="translate(370 466)" fill="none" stroke="${PALETTE.navy}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"><path d="M-22 0l14 14 30-30"/></g>
    ${ribbon(770, 500, 'ILUSTRATIVO')}
  ` },
  b1: { w: 1200, h: 675, kicker: 'COMPRA SEGURA', build: (w, h) => `
    ${backdrop(w, h, false)}
    ${shieldIcon(260, 340, 1.7, PALETTE.cream)}
    ${spiralBooklet(560, 190, 130, 190, PALETTE.terracotta)}
    ${spiralBooklet(630, 230, 130, 190, PALETTE.sage)}
    ${spiralBooklet(700, 190, 130, 190, PALETTE.terracottaLight)}
    ${ribbon(560, 60, 'DADOS PROTEGIDOS PELA STRIPE')}
  ` },
  b2: { w: 1200, h: 675, kicker: 'ACESSO EM QUALQUER TELA', build: (w, h) => `
    ${backdrop(w, h, true)}
    ${deviceIcon(200, 260, 'laptop', PALETTE.cream)}
    ${deviceIcon(560, 200, 'tablet', PALETTE.terracottaLight)}
    ${deviceIcon(770, 240, 'phone', PALETTE.sageLight)}
    ${ribbon(150, 470, 'CELULAR • TABLET • COMPUTADOR')}
  ` },
  b3: { w: 1200, h: 675, kicker: 'MATERIAIS PREMIUM', build: (w, h) => `
    ${backdrop(w, h, false)}
    ${spiralBooklet(430, 120, 170, 250, PALETTE.terracotta)}
    ${spiralBooklet(540, 170, 170, 250, PALETTE.terracottaLight)}
    ${starIcon(720, 220, 1.6, PALETTE.cream)}
    ${starIcon(800, 180, 1.2, PALETTE.sageLight)}
    ${ribbon(430, 450, 'OFERTA COMPLEMENTAR')}
  ` },
  b4: { w: 1200, h: 675, kicker: 'KIT ESSENCIAL', build: (w, h) => `
    ${backdrop(w, h, true)}
    ${spiralBooklet(360, 190, 140, 210, PALETTE.terracotta)}
    ${spiralBooklet(470, 150, 140, 210, PALETTE.sage)}
    ${spiralBooklet(580, 190, 140, 210, PALETTE.terracottaLight)}
    ${ribbon(390, 440, '3 APOSTILAS ESSENCIAIS')}
  ` },
};

export default function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).send('Método não permitido.');
  }

  const name = String(request.query.name || '');
  const scene = SCENES[name];
  if (!scene) return response.status(404).send('Banner não encontrado.');

  const { w, h, build, kicker } = scene;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(kicker)}">
    <title>${escapeXml(kicker)}</title>
    ${build(w, h)}
  </svg>`;

  response.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  return response.status(200).send(svg);
}
