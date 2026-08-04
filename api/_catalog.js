export const CAMPAIGN_ID = 'colecao-margareth-promocional-v2';

export const PRODUCTS = {
  calma: { id:'calma', name:'Apostila CALMA', shortName:'CALMA', description:'Um roteiro para compreender, acolher, manter limites possíveis, modelar comunicação e acompanhar padrões.', category:'Comportamento e regulação', amount:510, driveId:'1nkdWZ3nCIk4zkFsr3XolW8chM5QOBHsz', fileName:'apostila-calma-margareth-almeida.pdf' },
  'tdah-vida-real': { id:'tdah-vida-real', name:'Apostila TDAH na Vida Real', shortName:'TDAH na Vida Real', description:'Funções executivas, avaliação responsável, rotina, escola, estudo, regulação e registro para consultas.', category:'TDAH e desenvolvimento', amount:510, driveId:'19_slnxzXZc8GYXzZPXVs4cKu6lUgfs2V', fileName:'apostila-tdah-na-vida-real.pdf' },
  'durante-a-crise': { id:'durante-a-crise', name:'Apostila Durante a Crise', shortName:'Durante a Crise', description:'Plano de baixa exigência para proteger, comunicar e apoiar a recuperação nos momentos intensos.', category:'Comportamento e regulação', amount:510, driveId:'1c_dl51PdK94FeVA_5ng5TPdUExBLUSeU', fileName:'apostila-durante-a-crise.pdf' },
  'crise-protesto-frustracao': { id:'crise-protesto-frustracao', name:'Apostila Crise, Protesto ou Frustração?', shortName:'Crise ou Frustração?', description:'Um mapa de observação para responder sem rotular, com banco de frases e registro A-B-C ampliado.', category:'Comportamento e regulação', amount:510, driveId:'1ApHY6QFgLhFnT-kOe89lHm_c53nTDga9', fileName:'apostila-crise-protesto-frustracao.pdf' },
  'marcos-desenvolvimento': { id:'marcos-desenvolvimento', name:'Apostila Marcos do Desenvolvimento', shortName:'Marcos do Desenvolvimento', description:'Observação do nascimento aos 5 anos, ideias práticas, sinais de atenção e registro para consultas.', category:'TDAH e desenvolvimento', amount:510, driveId:'1Mo5KknjryiY6-9v3uIK6PDZoEEmQ7JYD', fileName:'apostila-marcos-do-desenvolvimento.pdf' },
  'antes-da-crise': { id:'antes-da-crise', name:'Apostila Antes da Crise', shortName:'Antes da Crise', description:'Protocolo A.N.T.E.S., mapa de sinais, kit de regulação, registro de 7 dias e plano preventivo.', category:'Comportamento e regulação', amount:510, driveId:'1j9-QkHXMmAl4LfNxjd48Usl652frVAr8', fileName:'apostila-antes-da-crise.pdf' },
  'estrategias-coletivas': { id:'estrategias-coletivas', name:'Apostila Estratégias Coletivas para Sala', shortName:'Estratégias Coletivas', description:'Seis pilares para uma sala previsível, acessível e participativa, com atividades e plano semanal.', category:'Escola e inclusão', amount:510, driveId:'1aZYxic5rBy_kOZUKW-z_V4cIRpYYwdr9', fileName:'apostila-estrategias-coletivas.pdf' },
  'quadro-emocoes': { id:'quadro-emocoes', name:'Apostila Quadro de Emoções da Semana', shortName:'Quadro de Emoções', description:'Ferramenta imprimível e preenchível para observar emoções, corpo, contexto e apoios que funcionam.', category:'Família e emoções', amount:510, driveId:'19_MYVZFkJ6CxI80P6EepPKw6QYFcCDl7', fileName:'apostila-quadro-de-emocoes.pdf' },
  'protocolo-luz': { id:'protocolo-luz', name:'Apostila Protocolo LUZ', shortName:'Protocolo LUZ', description:'Três movimentos para famílias organizarem o próximo passo após uma preocupação, suspeita ou diagnóstico.', category:'Família e emoções', amount:510, driveId:'1PnmMoATidxdAffjJd-oM-xdvKZ66LkIl', fileName:'apostila-protocolo-luz.pdf' },
  'protocolo-ensinar': { id:'protocolo-ensinar', name:'Apostila Protocolo ENSINAR', shortName:'Protocolo ENSINAR', description:'Sete movimentos para transformar barreiras em acesso, participação e aprendizagem possível.', category:'Escola e inclusão', amount:510, driveId:'1fjHevluwHJl0cDKRYx43L5a4hGhReroI', fileName:'apostila-protocolo-ensinar.pdf' },
  'protocolo-esperanca': { id:'protocolo-esperanca', name:'Apostila Protocolo ESPERANÇA', shortName:'Protocolo ESPERANÇA', description:'Nove movimentos de direção e acolhimento, com organização prática da rede de apoio.', category:'Família e emoções', amount:510, driveId:'1t6BdS9gbBlKoUv2izkwXnZxBGlcFE6m1', fileName:'apostila-protocolo-esperanca.pdf' },
  'protocolo-acolher': { id:'protocolo-acolher', name:'Apostila Protocolo ACOLHER', shortName:'Protocolo ACOLHER', description:'Roteiro curto para crise emocional, cartão rápido e plano individual para preparar antes de precisar.', category:'Comportamento e regulação', amount:510, driveId:'1DgDFP-sT-EmE7joxes3hW9KKxuBXsPp1', fileName:'apostila-protocolo-acolher.pdf' },
};

export const BONUSES = {
  'atencao-em-jogo': { id:'atencao-em-jogo', name:'Atenção em Jogo', type:'app', url:'https://estimular-aten-o-sustentada.vercel.app/' },
  'historia-maluca': { id:'historia-maluca', name:'História Maluca', type:'app', url:'https://narrative-play-magic.vercel.app/' },
  neurotriagem: { id:'neurotriagem', name:'NeuroTriagem Pro', type:'app', url:'https://teste-triagem-neurodesenvolvimental.vercel.app/' },
};

export const BUNDLE = { id:'colecao-completa', name:'Coleção Completa Margareth Almeida', description:'12 apostilas digitais organizadas por necessidade, com três recursos interativos de apoio.', amount:3700 };
export const ESSENTIAL_KIT = { id:'kit-essencial', name:'Kit Essencial — 3 apostilas', description:'Três apostilas para começar: CALMA, Marcos do Desenvolvimento e Quadro de Emoções.', amount:1290 };

export function getOffer(sku) {
  if (sku === BUNDLE.id) return BUNDLE;
  if (sku === ESSENTIAL_KIT.id) return ESSENTIAL_KIT;
  return PRODUCTS[sku] || null;
}

export function getEntitlements(sku) {
  if (sku === BUNDLE.id) return [...Object.keys(PRODUCTS), ...Object.keys(BONUSES)];
  if (sku === ESSENTIAL_KIT.id) return ['calma', 'marcos-desenvolvimento', 'quadro-emocoes'];
  return PRODUCTS[sku] ? [sku] : [];
}

export function getPublicItem(itemId) {
  const product = PRODUCTS[itemId];
  if (product) return { id:product.id, name:product.name, type:'pdf', category:product.category, fileName:product.fileName };
  const bonus = BONUSES[itemId];
  if (bonus) return { id:bonus.id, name:bonus.name, type:bonus.type };
  return null;
}
