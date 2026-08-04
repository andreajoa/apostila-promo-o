const PALETTE = {
  navy:'#09274B',
  terracotta:'#A64B2A',
  terracottaLight:'#C88664',
  cream:'#FFF8F3',
  blush:'#F3DED0',
  sage:'#78866B',
  white:'#FFFFFF',
};

const COVERS = {
  'calma': {
    kicker:'GUIA PRÁTICO', lines:['Apostila','CALMA'], subtitle:'Regulação, acolhimento e estratégias práticas', accent:'lotus', variant:0,
  },
  'tdah-vida-real': {
    kicker:'FUNÇÕES EXECUTIVAS', lines:['TDAH','na Vida Real'], subtitle:'Rotina, organização e apoio prático', accent:'clock', variant:1,
  },
  'durante-a-crise': {
    kicker:'PLANO DE APOIO', lines:['Durante','a Crise'], subtitle:'Segurança, baixa exigência e recuperação', accent:'shield', variant:2,
  },
  'crise-protesto-frustracao': {
    kicker:'GUIA DE DECISÃO', lines:['Crise, Protesto','ou Frustração?'], subtitle:'Leitura do comportamento e respostas mais assertivas', accent:'heart', variant:3,
  },
  'marcos-desenvolvimento': {
    kicker:'DO NASCIMENTO AOS 5 ANOS', lines:['Marcos do','Desenvolvimento'], subtitle:'Observação, apoio e próximos passos', accent:'sprout', variant:4,
  },
  'antes-da-crise': {
    kicker:'PREVENÇÃO', lines:['Antes da','Crise'], subtitle:'Sinais, previsibilidade e plano de apoio', accent:'hands', variant:5,
  },
  'estrategias-coletivas': {
    kicker:'ESCOLA E INCLUSÃO', lines:['Estratégias','Coletivas','para Sala'], subtitle:'Rotina, participação e acesso', accent:'people', variant:6,
  },
  'quadro-emocoes': {
    kicker:'MATERIAL PREENCHÍVEL', lines:['Quadro de','Emoções','da Semana'], subtitle:'Sentimentos, corpo e autorregulação', accent:'heart', variant:7,
  },
  'protocolo-luz': {
    kicker:'FAMÍLIAS', lines:['Protocolo','LUZ'], subtitle:'Primeiros passos com clareza e acolhimento', accent:'sun', variant:8,
  },
  'protocolo-ensinar': {
    kicker:'PROFESSORES', lines:['Protocolo','ENSINAR'], subtitle:'Acesso, participação e aprendizagem', accent:'book', variant:9,
  },
  'protocolo-esperanca': {
    kicker:'REDE DE APOIO', lines:['Protocolo','ESPERANÇA'], subtitle:'Orientação e caminhos possíveis', accent:'sprout', variant:10,
  },
  'protocolo-acolher': {
    kicker:'CRISE EMOCIONAL', lines:['Protocolo','ACOLHER'], subtitle:'Segurança e cuidado com presença', accent:'shield', variant:11,
  },
};

function escapeXml(value='') {
  return String(value).replace(/[<>&'\"]/g, (char) => ({
    '<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;',
  }[char]));
}

function icon(type, x, y) {
  const common = `fill="none" stroke="${PALETTE.cream}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"`;
  if (type === 'heart') return `<path ${common} d="M${x} ${y+22}c-40-42-94 9-46 54l46 42 46-42c48-45-6-96-46-54Z"/>`;
  if (type === 'shield') return `<path ${common} d="M${x} ${y}l62 23v50c0 46-28 82-62 101-34-19-62-55-62-101V${y+23}Z"/><path ${common} d="M${x} ${y+57}c-25-28-58 7-28 36l28 25 28-25c30-29-3-64-28-36Z"/>`;
  if (type === 'sprout') return `<path ${common} d="M${x} ${y+145}V${y+40}M${x} ${y+78}c-45 3-68-22-67-62 42-3 69 19 67 62Zm0 23c44 2 68-23 67-63-42-3-69 20-67 63Z"/>`;
  if (type === 'sun') return `<circle ${common} cx="${x}" cy="${y+78}" r="42"/><path ${common} d="M${x} ${y}v25m0 106v25m-78-78h25m106 0h25m-133-55 18 18m74 74 18 18m0-110-18 18m-74 74-18 18"/>`;
  if (type === 'book') return `<path ${common} d="M${x-82} ${y+40}c35-15 64-10 82 8 18-18 47-23 82-8v102c-35-15-64-10-82 8-18-18-47-23-82-8Z"/><path ${common} d="M${x} ${y+48}v102"/>`;
  if (type === 'people') return `<circle ${common} cx="${x}" cy="${y+35}" r="25"/><circle ${common} cx="${x-64}" cy="${y+58}" r="20"/><circle ${common} cx="${x+64}" cy="${y+58}" r="20"/><path ${common} d="M${x-42} ${y+145}c0-45 20-70 42-70s42 25 42 70m-130 0c0-34 13-54 24-61m152 61c0-34-13-54-24-61"/>`;
  if (type === 'hands') return `<path ${common} d="M${x-95} ${y+145}c18-50 42-83 82-102l13 34-39 29 39-11v50m95 0c-18-50-42-83-82-102l-13 34 39 29-39-11v50"/>`;
  if (type === 'clock') return `<circle ${common} cx="${x}" cy="${y+78}" r="66"/><path ${common} d="M${x} ${y+37}v48l35 22"/>`;
  return `<path ${common} d="M${x} ${y+145}c-44-42-65-74-65-105 0-23 18-40 40-40 13 0 23 7 25 17 2-10 12-17 25-17 22 0 40 17 40 40 0 31-21 63-65 105Z"/>`;
}

function titleMarkup(lines) {
  const count = lines.length;
  const startY = count === 2 ? 470 : 425;
  const sizes = count === 2 ? [88,96] : [72,80,68];
  return lines.map((line, index) => {
    const color = index === count - 1 ? PALETTE.terracottaLight : PALETTE.cream;
    return `<text x="450" y="${startY + index * 94}" text-anchor="middle" fill="${color}" font-family="Georgia,serif" font-size="${sizes[index]}" font-weight="700">${escapeXml(line)}</text>`;
  }).join('');
}

function designShapes(variant) {
  const flip = variant % 2 === 1;
  const circleX = flip ? 770 : 125;
  const bottomX = flip ? 105 : 790;
  return `
    <circle cx="${circleX}" cy="90" r="185" fill="${PALETTE.terracotta}"/>
    <circle cx="${bottomX}" cy="1050" r="240" fill="${PALETTE.sage}"/>
    <path d="M0 ${flip ? 900 : 850} Q260 ${flip ? 760 : 990} 510 ${flip ? 930 : 850} T900 ${flip ? 840 : 945}V1125H0Z" fill="${PALETTE.terracotta}" opacity=".96"/>
    <path d="M0 ${flip ? 1010 : 950} Q310 ${flip ? 880 : 1080} 585 ${flip ? 1030 : 920} T900 ${flip ? 970 : 1050}V1125H0Z" fill="${PALETTE.navy}"/>
    <g opacity=".45" fill="${PALETTE.cream}">${Array.from({length:20},(_,i)=>`<circle cx="${90+(i%5)*25}" cy="${130+Math.floor(i/5)*25}" r="4"/>`).join('')}</g>
    <path d="M690 130c55 8 97 47 112 99-54 4-102-26-125-75m40 18c-6 70-40 119-92 143-10-58 14-112 67-152" fill="none" stroke="${PALETTE.sage}" stroke-width="7" stroke-linecap="round"/>
  `;
}

export default function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow','GET');
    return response.status(405).send('Método não permitido.');
  }

  const id = String(request.query.id || '');
  const cover = COVERS[id];
  if (!cover) return response.status(404).send('Mockup não encontrado.');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1125" viewBox="0 0 900 1125" role="img" aria-label="${escapeXml(cover.lines.join(' '))}">
    <defs>
      <filter id="shadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="18" dy="24" stdDeviation="22" flood-color="#09274B" flood-opacity=".25"/></filter>
      <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="${PALETTE.blush}"/></linearGradient>
    </defs>
    <rect width="900" height="1125" fill="url(#paper)"/>
    <g filter="url(#shadow)">
      <rect x="92" y="42" width="752" height="1032" rx="28" fill="${PALETTE.navy}"/>
      ${designShapes(cover.variant)}
      <rect x="92" y="42" width="752" height="1032" rx="28" fill="none" stroke="${PALETTE.cream}" stroke-opacity=".5" stroke-width="4"/>
      <g>${Array.from({length:31},(_,i)=>`<ellipse cx="88" cy="${70+i*32}" rx="34" ry="12" fill="none" stroke="#111820" stroke-width="8"/>`).join('')}</g>
      <rect x="126" y="95" width="230" height="42" rx="21" fill="${PALETTE.cream}" fill-opacity=".95"/>
      <text x="241" y="123" text-anchor="middle" fill="${PALETTE.terracotta}" font-family="Arial,sans-serif" font-size="19" font-weight="800" letter-spacing="2">${escapeXml(cover.kicker)}</text>
      <g transform="translate(450 215)">${icon(cover.accent,0,0)}</g>
      ${titleMarkup(cover.lines)}
      <line x1="255" y1="${cover.lines.length===2?680:710}" x2="645" y2="${cover.lines.length===2?680:710}" stroke="${PALETTE.sage}" stroke-width="4"/>
      <circle cx="450" cy="${cover.lines.length===2?680:710}" r="9" fill="${PALETTE.terracottaLight}"/>
      <foreignObject x="185" y="${cover.lines.length===2?705:738}" width="530" height="115"><div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,sans-serif;font-size:29px;line-height:1.25;text-align:center;color:${PALETTE.cream};font-weight:600">${escapeXml(cover.subtitle)}</div></foreignObject>
      <rect x="255" y="930" width="390" height="68" rx="34" fill="${PALETTE.cream}" fill-opacity=".96"/>
      <text x="450" y="974" text-anchor="middle" fill="${PALETTE.navy}" font-family="Georgia,serif" font-size="30" font-weight="700">Margareth Almeida</text>
      <text x="450" y="1038" text-anchor="middle" fill="${PALETTE.cream}" font-family="Arial,sans-serif" font-size="18" letter-spacing="2">ARQUIVO DIGITAL • PRONTO PARA IMPRIMIR</text>
    </g>
  </svg>`;

  response.setHeader('Content-Type','image/svg+xml; charset=utf-8');
  response.setHeader('Cache-Control','public, max-age=31536000, immutable');
  response.setHeader('X-Content-Type-Options','nosniff');
  return response.status(200).send(svg);
}
