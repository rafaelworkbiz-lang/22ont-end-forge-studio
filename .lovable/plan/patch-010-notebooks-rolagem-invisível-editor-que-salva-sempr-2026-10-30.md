# PATCH-010 — Notebooks, rolagem invisível, editor que salva sempre, IA com GPT e mais opções de loja

Não mexe em fornecedores, biblioteca, divulgação, pagamentos nem admin (exceto a configuração de IA).

## 0. Diagnóstico do editor (lido no código, a confirmar no navegador antes de corrigir)
Arquivo `src/components/store-editor.tsx`, função `StoreEditor`:
- **Etapa não é guardada**: `step` começa sempre em 0 (`useState(0)`), então recarregar volta ao início.
- **Dados antigos ao reabrir**: a loja é lida com cache permanente (`staleTime: Infinity`) e esse cache não é atualizado depois de salvar; ao sair e voltar, o editor mostra a versão antiga.
- **Últimas alterações se perdem**: o salvamento espera 1s; avançar etapa, sair da página ou trocar de aba não força o salvamento — só pergunta "sair mesmo assim?".
- **Sem proteção entre abas**: o último salvamento vence, mesmo que seja mais antigo.
Obs.: a loja já é criada no banco ao clicar em "Criar loja", então essa causa provável do patch não se aplica.

## 1. Responsivo em notebooks
- ≥1440px menu aberto 250px, 4 colunas, título 44px; 1280–1439 menu em ícones 76px com dica e abrindo por cima, 3 colunas, título 36px; 1024–1279 ícones, 2–3 colunas, resumo desce; <1024 barra inferior atual.
- clamp() em títulos/espaços, alturas com dvh, nenhuma rolagem horizontal.
- Menu aberto/recolhido salvo por usuário.
- Editor: painel 340px e prévia que encolhe para caber.

## 2. Barras de rolagem invisíveis
- Esconder barras no conteúdo, menu, carrosséis e painéis do editor, mantendo roda/toque/teclado.
- Listas horizontais: bordas esmaecidas + setas ‹ ›. Listas verticais longas: sombra suave no topo/rodapé.

## 3. Editor salva sempre
- Novos campos na loja: etapa atual e versão.
- "Criar loja" abre direto em `/painel/lojas/{id}?passo=1`; a etapa fica no endereço e no banco, e reabre nela.
- Um único estado para as 5 etapas, sempre lido fresco do banco.
- Salva 800ms após parar de digitar e na hora ao trocar de etapa, sair da página ou trocar de aba; imagens e escolha da IA gravam na hora.
- Versão: salvamento antigo é recusado no servidor; a aba desatualizada recebe aviso e recarrega.
- Indicador: "Salvando…" / "Salvo às hh:mm" / "Não foi possível salvar — Tentar de novo".
- Desfazer/refazer das últimas 20 alterações.

## 4. IA de logo e banner com GPT
- Gerar pela API de imagens da OpenAI, só no servidor. **Precisa da chave OPENAI_API_KEY** — vou pedir pelo formulário seguro antes de ativar.
- Modelo configurável no admin (padrão gpt-image-1).
- Logo: 4 opções 1024×1024, fundo transparente, PNG. Banner: 3 opções 1536×1024 recortadas para a posição escolhida, WebP. Qualidade média.
- Sem texto por padrão; opção "Logo com o nome escrito" com aviso para conferir a grafia.
- 8 estilos: Moderno, Divertido, Elegante, Minimalista, Mascote, 3D, Vintage, Orgânico.
- Bloqueios e limite mensal mantidos (recusa/erro não contam); custo estimado por geração registrado e exibido no admin.

## 5. Mais opções de loja
- Etapas: Nome · Identidade · Tema · Layout · Produtos, com miniaturas reais.
- 8 layouts: Vitrine, Grade compacta, Destaque, Lista, Oferta do dia, Carrossel por categoria, Mosaico, Revista.
- 6 posições de banner (Topo largo, Topo dividido, Faixa fina, Carrossel até 3, Entre seções, Sem banner), altura P/M/G, alinhamento, frase e botão editáveis.
- Tema: 10 paletas por nicho + cor própria, fundo branco/creme/cinza, cantos, 3 pares de fontes; contraste AA checado na hora com ajuste do texto e aviso.
- Tema vale na prévia, loja pública e artes de divulgação. Lojas atuais continuam iguais (valores padrão equivalentes).
- Prévia com zoom e computador/celular; troca suave até 200ms, respeitando movimento reduzido.

## Testes (conta de teste)
Os 12 critérios do patch, item a item: telas 1280×720 / 1366×768 / 1440×900, rolagem, recarregar e voltar etapas, duas abas, sem internet, geração GPT (depende da chave), bloqueio de marca, layouts/banners/tema no computador e celular, desfazer/refazer. Testes automáticos para versão, contraste e recorte de banner.

## Detalhes técnicos
- Migration aditiva em `lojas`: `passo_atual int default 0`, `versao int default 0`, `tema jsonb`, `banner_posicao`, `banner_altura`, `banner_alinhamento`, `banners jsonb`; `ia_geracoes.custo_estimado numeric`; `config_ia` ganha modelo.
- `saveStore` passa a receber `versao` esperada e faz update condicional (`where versao = ?`), retornando conflito.
- `store-ai-core.ts` mantém orquestração; troca só o provedor de imagem.
