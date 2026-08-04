# Coleção Margareth Almeida — Landing promocional

Projeto novo e independente para vender 12 apostilas digitais individualmente por **R$ 5,10** ou no combo por **R$ 37,00**, com três recursos interativos incluídos no combo.

Nenhum repositório, checkout ou domínio existente é alterado por este projeto.

## Oferta implementada

- 12 apostilas avulsas: R$ 5,10 cada.
- Coleção completa: R$ 37,00.
- Bônus do combo: Atenção em Jogo, História Maluca e NeuroTriagem Pro.
- Produtos premium e livros aparecem na mesma página, mas mantêm seus links e preços atuais.

## Arquitetura

- `index.html`: página de vendas.
- `app.js`: catálogo, filtros e abertura do checkout.
- `sucesso.html` + `success.js`: biblioteca pós-compra.
- `api/create-checkout-session.js`: cria sessão Stripe por SKU.
- `api/session.js`: confirma pagamento e devolve somente os itens adquiridos.
- `api/access.js`: valida a sessão antes de redirecionar ao PDF ou atividade.
- `api/_catalog.js`: catálogo privado do servidor.
- `termos.html` e `privacidade.html`: páginas legais.

## Variáveis de ambiente na Vercel

Cadastre em **Settings → Environment Variables**:

```env
STRIPE_SECRET_KEY=sk_test_...
SITE_URL=https://seu-novo-dominio.vercel.app
```

A chave secreta nunca deve ser colocada no HTML, JavaScript do navegador ou GitHub.

## Deploy na Vercel

1. Importe este repositório na Vercel.
2. Mantenha o Framework Preset como `Other`.
3. Não informe Build Command.
4. Não informe Output Directory.
5. Cadastre `STRIPE_SECRET_KEY` e `SITE_URL`.
6. Faça o primeiro deploy.
7. Troque `SITE_URL` pelo endereço final criado pela Vercel.
8. Faça um novo deploy.
9. Teste primeiro com uma chave `sk_test_...`.
10. Depois substitua pela chave `sk_live_...` e publique novamente.

## Pagamento

O Checkout está configurado para pagamento único com cartão pela Stripe. A integração valida a campanha, o SKU, o valor total, a moeda e o estado do pagamento antes de liberar a biblioteca.

## Testes antes de anunciar

- compra de uma apostila avulsa;
- compra do combo;
- retorno para `sucesso.html`;
- download de cada PDF;
- abertura dos três recursos interativos;
- tentativa de acesso com sessão inválida;
- teste em celular, tablet e computador.

## Observação sobre os arquivos

Alguns guias já foram disponibilizados em campanhas gratuitas. A página deixa isso transparente no FAQ. A compra oferece a coleção organizada, biblioteca pós-compra e os bônus descritos.

## Segurança

O acesso é validado pela sessão paga antes do redirecionamento. Como alguns PDFs atuais também existem em links públicos do Google Drive, esta camada organiza e controla a biblioteca da compra, mas não funciona como DRM absoluto. Futuras edições premium podem ser armazenadas de forma privada e liberadas por links temporários.
