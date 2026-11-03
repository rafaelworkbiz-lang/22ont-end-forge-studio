# PATCH-014 (segurança) e depois PATCH-013 (fluidez e visual)

Ordem pedida: 014 primeiro, testado na conta de teste; 013 só depois que o 014 passar. Ao fim de cada um, relatório com o que mudou, mudanças no banco e resultado de cada teste da lista final.

## Como o projeto está hoje (conferido)

- Existe 1 único admin. Papéis do admin ficam numa tabela própria, com trava no banco que impede criar outro admin ou mexer no papel pelo app.
- Não existe uma tabela "profiles". Plano, status, vencimento e "conta de teste" ficam na tabela de membros (só o servidor lê e grava, o navegador não tem acesso). O papel de influenciador fica em uma tabela separada de papéis de membro, também só servidor.
- Credenciais de Mercado Livre e Shopee já não chegam ao navegador.
- O webhook da Applyfy já confere o token e não processa o mesmo evento duas vezes.
- A tela de login ainda tem "Criar conta".
- Algumas regras do banco permitem leitura aberta para qualquer logado (ex.: configuração de IA).

Por isso o plano adapta o documento ao que existe, sem criar uma tabela "profiles" duplicada: os "campos protegidos" já estão numa tabela que o navegador não consegue alterar.

## PATCH-014 — o que vou fazer

1. Backup: exportar papéis, membros e a lista atual de regras de acesso para um arquivo antes de mudar.
2. Admin único: manter a trava atual e adicionar o índice único "só um admin" no banco, além da função de checagem de papel usada pelas regras.
3. Cadastro público desligado: desligar cadastro aberto, tirar "Criar conta" da tela de login e da landing. Login e "Esqueci minha senha" continuam.
4. Admin › Usuários › Novo usuário (janela): nome, e-mail, plano, influenciador, conta de teste. O servidor confere o admin, cria a conta e manda convite por e-mail para a pessoa definir a senha. O admin deixa de definir senha.
5. Ações do admin no servidor (tornar/remover influenciador, mudar plano, marcar teste, bloquear) passam a gravar um histórico. Nova lista "Histórico" (só leitura) no Admin.
6. Revisão de regras do banco: confirmar regras ligadas em todas as tabelas, trocar leituras abertas por regras com dono/admin, conferir pastas de fotos por usuário, rodar o verificador de segurança e zerar os avisos.
7. Webhook Applyfy: manter token e proteção contra duplicados; trocar a senha enviada por convite para definir senha.
8. F12: o bloqueio já existe; restringir só ao painel logado e só no site publicado; remover mensagens de console no build e sem mapas de código públicos. Sem bloquear botão direito, copiar ou colar.

Ponto para você confirmar: hoje o e-mail pós-compra manda uma senha individual. O documento pede convite com link para definir senha. Vou trocar para convite (mais seguro).

## PATCH-013 — o que vou fazer (só visual e fluidez)

1. Novo bloco amarelo único para todas as abas (sobrelinha, título, palavra gigante de fundo a 6%, até 2 botões, número de destaque), com textos da tabela do documento, versão compacta no notebook, versão celular e barra fina branca ao rolar.
2. Componentes compartilhados: cartões de produto e loja, estado vazio, esqueleto, barra de filtros, selo e botões.
3. Abas guardadas em cache, pré-carregamento ao passar o mouse no menu, carregamento sob demanda das telas grandes.
4. Troca de aba com fade curto, esqueletos no lugar de spinner, mudanças na hora com desfazer se falhar, filtros na URL, imagens com espaço reservado.
5. Pílula amarela deslizante no menu, Ctrl+K com busca de abas, lojas e ações, caminho no topo das janelas, foco visível e Esc.
6. Limpeza de rotas antigas, estilos escuros e componentes sem uso.
7. Medir antes e depois (tamanho do código inicial e pulos de tela).

## Detalhes técnicos

- 014: migration com `CREATE UNIQUE INDEX one_admin ON user_roles(role) WHERE role='admin'` (após confirmar 1 admin), `has_role(uuid,text)` SECURITY DEFINER; tabela `admin_audit_log` (GRANT só service_role + SELECT authenticated com política has_role admin); revisar `config_ia_read` e políticas `true`; `supabase--configure_auth` com signup desligado; `members.functions.ts` ganha createUser via `inviteUserByEmail` + audit; `purchase-access.server.ts` passa a gerar link de convite/recuperação; `devtools-guard.ts` restrito a `/painel` e `import.meta.env.PROD` fora do host de preview; `vite` `esbuild.drop` e `build.sourcemap=false`.
- 013: `TabHeader` reescrito (Bricolage Grotesque 800, Plus Jakarta) mantendo `.v2-compact`; React Query com chaves padronizadas; `preload="intent"` nos links do menu; `cmdk` (já existe em ui/command) para a paleta; breadcrumb no JanelaHost; remover `painel.integracoes/grupos/scripts/lojas.nova/lojas.$id` se só redirecionam (mantendo os redirecionamentos de links antigos).
- Testes: admin único (segundo admin falha), cliente não cria usuário (403), cadastro aberto falha, histórico gravado; Playwright na conta de teste em 1366×657, 1280×690 e 390px.
