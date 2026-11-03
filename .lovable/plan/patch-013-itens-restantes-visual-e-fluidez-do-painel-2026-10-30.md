# PATCH-013 — itens restantes (visual e fluidez do painel)

Mantém o painel claro com amarelo #FFE600, sem mudar regras de negócio, banco ou pagamentos.

## O que será feito
1. **Ctrl+K (busca rápida):** caixa para ir direto a abas, lojas e ações comuns (ex.: "Nova loja", "Meu Perfil"). Também abre por botão no topo no celular.
2. **Caminho no topo das janelas:** ex.: "Minhas lojas › Casa Achados › Editar".
3. **Pílula amarela deslizante no menu:** o destaque da aba atual desliza suavemente ao trocar de aba (sem animação para quem pede movimento reduzido).
4. **Esqueletos de carregamento:** blocos cinza no formato do conteúdo no lugar da rodinha, nas abas principais.
5. **Mudança na hora com "Desfazer":** salvar/remover produto, favoritar grupo e marcar postado aparecem na hora, com aviso "Desfazer" por alguns segundos; se der erro, volta ao estado anterior.
6. **Filtros no endereço:** filtros de Produtos validados, Meus produtos e Divulgação ficam guardados no endereço (recarregar/voltar mantém).
7. **Limpeza:** remover telas e estilos antigos que não são mais usados.
8. **Medições de velocidade:** medir antes e depois (tempo para abrir cada aba e travadas) e relatar.

## Como vou conferir
- Testes automáticos existentes + testes novos para filtros no endereço e desfazer.
- Navegador na conta de teste em 1366×657, 1920×1080 e celular 390px.
- Nada será publicado sem você pedir.

## Detalhes técnicos
- Ctrl+K: componente de comando (cmdk do shadcn) montado no PanelShell; ações reutilizam abrirJanela e rotas existentes.
- Breadcrumb: campo opcional no registro JANELAS.
- Pílula: elemento absoluto medido via ref no menu lateral, transform + transition.
- Otimista: onMutate/onError/rollback no React Query + toast sonner com ação.
- Filtros: validateSearch com zod + fallback nas rotas filhas de /painel.
- Limpeza: rg por componentes/classes sem referência antes de remover.
