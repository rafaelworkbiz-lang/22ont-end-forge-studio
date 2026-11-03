# Novo visual de Influenciadores, Membros de time e Gerentes

## O que muda
1. **Cartão de cada pessoa redesenhado:** foto de perfil (ou inicial), nome completo, selo (Gerente / Membro de time / Sem time), status do cadastro colorido, código da página e WhatsApp clicável. Cartões alinhados, com o mesmo espaçamento.
2. **Botão "Ver ficha"** (o principal, em destaque). Abre uma janela só de leitura com tudo o que a pessoa cadastrou:
   - foto, nome, Gmail, WhatsApp, data do cadastro e último acesso
   - plano e lojas usadas
   - status do cadastro, motivo da recusa (se houver) e gerente/time
   - links Mensal e Vitalício com botão de copiar, e código da página
   - comissão combinada (só referência)
   - Dentro da ficha há um botão "Editar" que abre a edição que já existe hoje.
3. **Botões de ação com nome e ícone**, agrupados no menu "Mais ações" (⋯), cada um com uma linha explicando para que serve:
   - Aprovar / Recusar — aparece só quando a pessoa está aguardando.
   - Adicionar vendas — lança um valor demonstrativo no painel dela.
   - Vendas automáticas — liga ou desliga as vendas automáticas do dia.
   - Tornar gerente / Remover gerente.
   - Remover tag de influenciador — pede confirmação.
4. **Caixa "Como usar"** no topo de cada aba (pode ser fechada; fica fechada depois): três passos curtos explicando o fluxo daquela aba (convidar → aprovar links → acompanhar).
5. **Gerentes:** o mesmo cartão, com "Ver ficha" do gerente, quantidade de membros, usos do convite e botão "Abrir time" no lugar do lápis.

## Detalhes técnicos
- Novo `influencer-card.tsx` (cartão + menu de ações com `DropdownMenu`) e `influencer-ficha-dialog.tsx`, reaproveitados nas três abas.
- `listInfluencers` passa a devolver também `avatar_path` (metadados da conta), `created_at`, `last_sign_in_at`, `plan` e `lojas`, lidos no servidor de administração; a foto aparece por link assinado temporário.
- Caixa "Como usar" com estado salvo no navegador, lido depois de carregar a página.
- Estilos novos em `styles.css`, só com as cores do tema.
- Nenhuma mudança no banco nem nas regras de permissão.
