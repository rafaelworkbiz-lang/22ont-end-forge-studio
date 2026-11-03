# PATCH-012 — IA sem cara de genérico + painel encaixado no notebook

Mantém tudo dos patches anteriores. Mexe só na geração de logo/banner e na densidade do painel.

## Parte A — IA de logo e banner

1. **Briefing** no passo Identidade: público, 3 palavras de personalidade, símbolo/ideia, cores que gosta, o que evitar. Tudo opcional, com sugestões clicáveis por nicho. Fica salvo na loja e volta preenchido na próxima geração.
2. **Contexto automático**: nome, nicho, cores e fonte do tema e os 6 principais produtos da loja (título, categoria, foto).
3. **Diretor de arte** (GPT de texto no servidor): devolve 4 conceitos de tipos diferentes (símbolo geométrico, mascote original, monograma, ilustração do produto-chave), cada um com uma frase em português ("Folha + casa: lar natural e acolhedor") e um pedido detalhado para a imagem. Aplica as regras de cada estilo (tabela do patch) e a lista do que nunca gerar. Conceitos repetidos são descartados.
4. **Geração**: um pedido por conceito. Logo 1024×1024 com fundo transparente. Banner usa as fotos dos produtos da loja como referência (até 4), na proporção da posição escolhida e com espaço livre para o texto, em 3 conceitos. Cada opção mostra sua frase embaixo.
5. **Checagem antes de mostrar**: o diretor de arte olha as imagens e descarta as que têm texto embaralhado, clichês ou ficaram quase iguais. Se sobrarem menos de 3, gera as que faltam uma única vez, sem contar no limite.
6. **Refinar**: na opção escolhida, campo de texto livre que gera 2 variações. Conta como meia geração.
7. **Acabamento**: ao confirmar, gera a versão final em qualidade alta, com o logo recortado. Cria também ícone 512, favicon 64 e versão horizontal (símbolo + nome escrito pelo app com a fonte da loja).
8. **Admin**: custo real por geração (texto + imagem) e custo médio por loja. O limite mensal por plano continua, e o bloqueio de marcas e pessoas reais também.

## Parte B — Densidade notebook

9. Modo compacto quando a largura é menor que 1600px ou a altura menor que 800px. Telas-alvo: 1366×657, 1536×730 e 1280×690.
10. Ajustes do modo compacto:
    - Moldura sem a borda externa; painel com 20px de espaço interno e 14px entre blocos.
    - Cabeçalho amarelo em uma linha, com no máximo 120px de altura e "ver mais" na descrição. Ao rolar, vira uma barra fina fixa de 56px.
    - Grades com colunas automáticas (cartão mínimo de 240px).
    - Fotos dos cartões em 4:3, textos de 13–14px, botões de 40px (44px em telas de toque).
    - Linha de números com 88px de altura.
    - Menu recolhido abaixo de 1440px, com itens de 40px.
    - Janela grande em 96% × 94% da tela. No editor de loja, 38% para configuração e 62% para a prévia, que encolhe para caber inteira.
    - Tamanhos de texto fluidos.
11. **Regra de ouro**: nas 3 telas-alvo, cada aba mostra o cabeçalho e uma fileira inteira de conteúdo sem rolar, sem rolagem lateral e sem nada cortado. Em 1920×1080 o layout fica igual ao de hoje.

## Verificação
- Testes automáticos de briefing, meia geração, descarte e geração extra sem cobrança, e bloqueio de marca e pessoa real.
- Na conta de teste: gerar logo e banner, refinar e confirmar, com prints.
- Prints de cada aba nas 3 telas-alvo e em 1920×1080.
- Cada geração completa gasta créditos de IA, e o teste roda várias delas (o patch pede 5 seguidas). O custo médio fica registrado no admin.

## Detalhes técnicos
- Migration: `lojas.briefing jsonb`; em `ia_geracoes`, as colunas `conceitos jsonb`, `custo_real numeric`, `peso numeric default 1` (refino = 0.5) e `variacoes jsonb`. O contador passa a somar `peso`.
- `store-ai-core.ts`: orquestra contexto → diretor (`/v1/responses`, `openai/gpt-6-astra`, saída em json_schema, com visão para a checagem) → imagens (`/v1/images/generations` para o logo, `/v1/images/edits` com as fotos dos produtos para o banner e o refino) → checagem → uma nova tentativa sem cobrança. As regras de estilo e a lista proibida ficam em `store-ai-art.ts` (sem código de servidor), com teste.
- Variações (512, 64, horizontal) montadas com canvas no navegador e enviadas para `lojas/{user}/{loja}/`.
- Densidade: hook `useCompactPanel` (innerWidth/innerHeight) põe a classe `.v2-compact` no PanelShell; regras em `styles.css`. O cabeçalho usa IntersectionObserver para virar a barra fina.
