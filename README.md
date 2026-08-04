# Coleção Margareth Almeida — Landing promocional

Projeto independente para vender 12 apostilas digitais por **R$ 5,10** cada, a coleção completa por **R$ 37,00** e o downsell Kit Essencial por **R$ 12,90**.

## Fluxo implementado

- imagens da campanha distribuídas no hero, demonstração, uso em família e prova visual;
- Stripe Embedded Checkout dentro da página;
- cadastro obrigatório de nome, e-mail e WhatsApp antes do cartão;
- dados vinculados aos metadados da sessão e do pagamento na Stripe;
- parcelamento habilitado para a coleção quando disponível na conta e no cartão;
- downsell do Kit Essencial ao abandonar o checkout da coleção;
- biblioteca protegida após a confirmação do pagamento;
- upsell opcional de Pequenos Gigantes e Descubra os Sentidos;
- cross-sell dos recursos Atenção em Jogo e História Maluca;
- webhook para envio automático do link da biblioteca por e-mail.

## Variáveis de ambiente na Vercel

```env
SITE_URL=https://apostila-promo.vercel.app
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
EMAIL_FROM=Margareth Almeida <acesso@seudominio.com>
```

A chave `EMAIL_FROM` precisa usar um remetente autorizado no provedor de e-mail.

## Configuração do webhook da Stripe

Crie um endpoint no Dashboard da Stripe apontando para:

```text
https://apostila-promo.vercel.app/api/webhook
```

Selecione estes eventos:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

Copie o segredo de assinatura do endpoint, iniciado por `whsec_`, para a variável `STRIPE_WEBHOOK_SECRET` na Vercel e faça um novo deploy.

## Arquitetura

- `index.html`: página de vendas;
- `app.js`: catálogo, imagens, cadastro, checkout e downsell;
- `funnel.css`: apresentação do funil e do checkout;
- `assets/funnel-atlas.webp`: imagens otimizadas da campanha;
- `sucesso.html` + `success.js`: biblioteca, upsell e cross-sell;
- `api/create-checkout-session.js`: cria a sessão Stripe e registra o comprador;
- `api/session.js`: confirma a compra e devolve os acessos;
- `api/access.js`: valida a sessão antes de liberar cada item;
- `api/webhook.js`: verifica a assinatura da Stripe e envia a entrega pelo Resend;
- `api/_catalog.js`: catálogo e regras de entitlement.

## Testes obrigatórios antes de anunciar

1. Realizar uma compra em modo de teste.
2. Confirmar a abertura da biblioteca.
3. Confirmar a chegada do e-mail de entrega.
4. Testar apostila avulsa, coleção e Kit Essencial.
5. Testar fechamento do checkout e apresentação do downsell.
6. Verificar os links do upsell e do cross-sell.
7. Repetir em celular e computador.

## Segurança e limites

A chave secreta da Stripe e as chaves de e-mail ficam somente nas variáveis da Vercel. O acesso é validado pela sessão paga. Como alguns PDFs também existem em links públicos do Google Drive, esta camada controla a biblioteca da compra, mas não constitui DRM absoluto.
