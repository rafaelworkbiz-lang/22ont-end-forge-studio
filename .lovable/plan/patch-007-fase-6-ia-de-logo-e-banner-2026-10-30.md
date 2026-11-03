# PATCH-007 · Fase 6 — IA de logo e banner

Escopo: só o passo 2 (Identidade) do editor de lojas, a prévia/página pública e uma nova aba "IA" no admin. Nada das Fases 1–5 muda.

## O que o usuário vai ver
- **Passo Identidade – Logo**: "Enviar meu logo", pílulas de estilo (Moderno, Divertido, Elegante, Minimalista), campo opcional de descrição, botão amarelo "Gerar logo com IA" → "Gerar outras opções". Enquanto gera: 4 quadrados de carregamento e "Criando opções…". Resultado: 4 cartões selecionáveis (setas do teclado, foco visível) mostrando a imagem no quadrado arredondado + nome da loja em texto ao lado.
- **Banner**: mesmo fluxo, 3 opções largas (16:6) com nome e frase da loja escritos por cima, "Enviar meu banner".
- Contador real "Gerações de IA este mês: X de Y"; com limite atingido o botão fica desligado e explica o motivo + data de renovação e botão de upgrade (só Mensal).
- Mensagens de bloqueio (marca/pessoa) e de erro abaixo do botão, com causa e o que fazer.
- Monogramas/banners automáticos da Fase 4 continuam como alternativa gratuita. Prévia ao vivo atualiza ao escolher.
- **Prévia e página pública**: logo da IA no quadrado + nome em texto; banner como fundo com nome/frase em texto sobre uma camada sólida translúcida (sem gradiente) para contraste.
- **Admin › IA**: limite por plano editável (20 Mensal / 40 Vitalício), gerações do mês por usuário, bloqueios recentes e gestão da lista de marcas bloqueadas.

## Regras
- A IA só gera imagem; todo prompt inclui "no text, no letters, no words, no logos of other brands, no real people". Nome e frase são sempre desenhados pelo app.
- 1 geração = 1 clique. Só gerações "ok" contam; bloqueadas e com erro não contam.
- Bloqueio antes de gerar se nome, nicho ou descrição tiverem marca bloqueada, endereço reservado, pessoa famosa ou pedido de "logo do/da …".
- Opções não escolhidas são apagadas após 24h; a escolhida é copiada para a pasta da loja.

## Detalhes técnicos
- Migration: `ia_geracoes` (RLS por dono, leitura admin), `config_ia` (plano, limite_mensal; leitura autenticada, escrita só admin via servidor), `marcas_bloqueadas` (semeada com mercado livre, mercadolivre, shopee, amazon, magalu, nike, adidas, apple, samsung, coca-cola, disney, cbf, principais times e personagens famosos). Grants + RLS no padrão do projeto.
- `src/lib/store-ai.functions.ts` (requireSupabaseAuth): `gerarIdentidade`, `escolherIdentidade`, `uso IA do mês`; funções admin com requireAdmin. Moderação pura em `src/lib/store-ai-moderation.ts` (testável). Lista de pessoas famosas fixa no código, complementada pela tabela.
- Geração via Lovable AI Gateway com modelo padrão de imagem (`openai/gpt-image-2.5-sunburst`), chamada sem streaming dentro da função de servidor (escolha simples, não há prévia parcial): logo 4×1024², banner 3 imagens no formato largo mais próximo suportado e recortadas/encaixadas em 16:6 na exibição. Timeout 60s; erro grava status "erro".
- Arquivos temporários em `ia/{user_id}/` no bucket privado de lojas, servidos por URL assinada; escolha copia para `lojas/{user_id}/{loja_id}/` e grava `logo_url`/`banner_url` (ficam públicos quando a loja é publicada, como na Fase 5).
- Rotina de limpeza: rota `/api/public/jobs/cleanup-ia` com `authenticateCronRequest`, agendada de hora em hora, apaga opções não escolhidas com mais de 24h.
- Testes: moderação (Shopee/famoso bloqueia), contagem do limite (só "ok"), limite 2 → 3ª bloqueada, falha simulada não conta, limpeza 24h simulada. Teste de navegador na conta de teste (desktop e 390px com opções em 2 colunas).

## Fora do escopo
Variações 1:1 e 9:16 para divulgação (Fase 7). Sem publicar o site.
