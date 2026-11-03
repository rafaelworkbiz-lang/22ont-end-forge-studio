# Publicar o PATCH-014 e seguir para o PATCH-013

## 1. Publicar
- Rodar o verificador de segurança antes de publicar e mostrar se aparecer algo grave.
- Publicar o site (afiliaplace.site) com o PATCH-014: cadastro fechado, convite por e-mail, Histórico no admin e F12 só no painel.

## 2. PATCH-013 — visual e fluidez (só tela, sem mexer em banco)
1. Novo bloco amarelo igual em todas as abas: sobrelinha, título grande, palavra gigante de fundo bem clarinha, até 2 botões e um número de destaque, com os textos da tabela do documento. Versão compacta no notebook, versão celular e barra fina branca no topo ao rolar.
2. Peças únicas reaproveitadas: cartão de produto, cartão de loja, estado vazio, esqueleto de carregamento, barra de filtros, selo e botões.
3. Abas mais rápidas: guardar o que já foi carregado, pré-carregar ao passar o mouse no menu, carregar as telas grandes só quando abrir.
4. Troca de aba suave (fade curto), esqueletos no lugar de rodinha, mudanças na hora com "Desfazer" se falhar, filtros guardados no endereço, imagens com espaço reservado.
5. Pílula amarela deslizante no menu, atalho Ctrl+K para ir a abas, lojas e ações, caminho no topo das janelas, foco visível e Esc fecha.
6. Limpar rotas antigas e estilos escuros sem uso.
7. Medir antes e depois e testar na conta de teste em 1366×657, 1280×690 e celular 390px.

O PATCH-013 não será publicado sem você pedir.

## Detalhes técnicos
- security--run_security_scan, depois preview_ui--publish.
- `TabHeader` reescrito (Bricolage Grotesque 800 + Plus Jakarta, link no __root), mantendo `.v2-compact`; `defaultPreload: "intent"`; paleta com `ui/command`; breadcrumb no JanelaHost; testes existentes rodados.
