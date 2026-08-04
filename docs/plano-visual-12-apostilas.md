# Plano visual das 12 apostilas

## Diagnostico do projeto

O catalogo da landing page usa os IDs do Google Drive para carregar a primeira pagina de cada PDF como capa. Cada apostila custa R$ 5,10 e a colecao completa inclui as 12 apostilas e tres recursos interativos.

Os PDFs atuais seguem uma identidade consistente e profissional, mas sao predominantemente compostos por texto, tabelas, caixas e grandes areas vazias. Para aumentar valor percebido, compreensao e ludicidade, o redesenho deve incluir ilustracoes editoriais, pictogramas, sequencias visuais e atividades graficas sem infantilizar o conteudo.

## Direcao de arte

- Paleta oficial: azul-marinho #09274B, terracota #A64B2A, terracota claro #C88664, bege rosado #F3DED0, bege amarronzado #B98B76 e branco suave #FFF8F3.
- Estilo: ilustracao editorial infantil elegante, acolhedora, inclusiva e com textura suave.
- Personagens: manter diversidade de pele, genero, idade, perfis de comunicacao e configuracoes familiares.
- Comunicacao: mostrar fala, gesto, apontar, escrita, imagens e CAA.
- Crises: representar sobrecarga e recuperacao com respeito, sem caricatura, violencia ou ideia de desobediencia.
- Autismo: nao usar peca de quebra-cabeca como simbolo central.
- Texto dentro das artes: somente palavras curtas e funcionais quando indispensaveis, como PAUSA, AJUDA, SAIR e DOR.
- Formato principal: WebP, 1600 x 2000 px, vertical 4:5, com versao de recorte horizontal quando a diagramacao exigir.

## Estrutura de arquivos

Todos os nomes definitivos estao em `assets/apostilas/image-manifest.json`.

```text
assets/apostilas/
  shared/
  calma/
  tdah-vida-real/
  durante-a-crise/
  crise-protesto-frustracao/
  marcos-desenvolvimento/
  antes-da-crise/
  estrategias-coletivas/
  quadro-emocoes/
  protocolo-luz/
  protocolo-ensinar/
  protocolo-esperanca/
  protocolo-acolher/
```

## Ordem de producao

### Lote 1 - validar identidade visual

1. Apostila CALMA
2. Antes da Crise
3. Durante a Crise

Esses tres materiais compartilham personagens, recursos sensoriais, CAA e cenas de regulacao. O primeiro lote deve definir o personagem-base, o cuidador-base, o estilo dos pictogramas e o tratamento visual das crises.

### Lote 2 - comportamento e leitura funcional

4. Crise, Protesto ou Frustracao?
5. Protocolo ACOLHER
6. Quadro de Emocoes da Semana

### Lote 3 - desenvolvimento e TDAH

7. TDAH na Vida Real
8. Marcos do Desenvolvimento

### Lote 4 - escola e inclusao

9. Estrategias Coletivas para Sala
10. Protocolo ENSINAR

### Lote 5 - familia e rede

11. Protocolo LUZ
12. Protocolo ESPERANCA

## Padrao minimo por apostila

- 1 capa ilustrada ou mockup principal;
- 3 a 5 cenas editoriais ligadas aos capitulos;
- 1 infografico do protocolo ou metodo;
- 1 recurso visual preenchivel ou sequencia pratica;
- pictogramas compartilhados quando houver comunicacao funcional;
- ao menos uma imagem grande a cada duas paginas de conteudo;
- nenhuma pagina inteira composta apenas por texto, salvo referencias e orientacoes legais.

## Integracao com o projeto

A landing page deve continuar usando a primeira pagina real do PDF como capa. Depois do redesenho, os mesmos IDs do Google Drive podem ser preservados por substituicao do arquivo, evitando quebrar catalogo, checkout e biblioteca pos-compra.

As imagens internas nao devem ser carregadas pela landing page. Elas devem ser incorporadas dentro de cada PDF final e, opcionalmente, seis recortes podem ser exportados para uma galeria de previa da colecao.

## Criterios de aprovacao

- leitura confortavel em A4 impresso e em tela de celular;
- contraste adequado e margens seguras;
- nenhuma imagem meramente decorativa sem relacao com o conteudo;
- figuras que explicam a estrategia antes de enfeitar a pagina;
- consistencia de personagens e pictogramas entre as 12 apostilas;
- nomes de arquivos exatamente iguais aos registrados no manifesto;
- revisao visual pagina por pagina antes de substituir os PDFs no Drive.
