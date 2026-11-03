# PATCH-001.1 – Ajustes do modal + verificação do banco

## 1. Diagnóstico das 3 atualizações puladas (nada aplicado ainda)

Motivo comum: as três tinham data anterior a uma atualização já aplicada (0011, trava do admin), e o sistema só roda as que têm data mais nova. Elas ficaram registradas, mas nunca executaram.

| # | Nome | O que faz | Existe hoje no banco? |
|---|------|-----------|------------------------|
| 0008 | applyfy_processing_history | Cria a tabela `applyfy_events` (histórico de cada aviso da Applyfy) e as funções `claim_applyfy_event` / `finish_applyfy_event` (processamento sem duplicar e com nova tentativa em caso de falha) | **Não.** Tabela e funções não existem |
| 0009 | applyfy_processing_history | Cópia idêntica da 0008 (duplicada) | Mesma coisa; não deve rodar de novo |
| 0010 | avatars_policies | Regras do arquivo de fotos de perfil: cada usuário só lê/envia/substitui/apaga arquivos na própria pasta `<id>/...` | **Não.** Zero regras no armazenamento |

**Fotos de perfil hoje:** o arquivo `avatars` é privado e não tem nenhuma regra. Na prática, ninguém logado consegue ler, enviar, substituir ou apagar fotos. O envio em Meu Perfil falha. Não há vazamento, mas a função está quebrada.

**Histórico de pagamentos (/admin > Assinaturas):** a tabela não existe. O webhook usa o caminho de compatibilidade: libera e bloqueia acesso normalmente, mas **não grava histórico**. A aba Assinaturas fica vazia/indisponível.

### SQL que pretendo rodar (uma nova atualização, depois da sua aprovação)
- Conteúdo da **0008** como está (tabela + RLS + 2 funções com permissão só para o servidor).
- Conteúdo da **0010** como está (4 regras de fotos por pasta do usuário).
- As antigas 0008/0009/0010 ficam comentadas com a nota "aplicada na atualização 0013", para não rodarem duas vezes.
- Depois: conferir que tabela, funções e regras existem, e testar envio de foto e um evento de teste do webhook.

## 2. Elegibilidade com 3 estados
- `elegivel`: novo + ativo + reputação amarela/verde-clara/verde.
- `nao_elegivel`: usado, inativo ou reputação vermelha/laranja → botão desativado com motivo.
- `nao_verificado`: reputação não informada → botão **liberado**, com aviso discreto: "Não conseguimos verificar a reputação do vendedor. O Mercado Livre pode não aceitar este produto no seu perfil."
- Consulta ao vendedor no servidor com cache de 24h por vendedor; se falhar, cai em `nao_verificado`.
- O atalho "Publicar" do card segue a mesma regra.

## 3. Confirmação da tag sem travar
- Ao abrir o /painel com tag salva e não confirmada: aviso pequeno, uma vez por sessão, com a tag atual e os botões "Confirmar minha tag" e "Corrigir em Integrações".
- Formato da tag validado antes de confirmar (letras, números, ponto, hífen, sublinhado; de 2 a 60 caracteres).
- Se adiar: faixa fina no topo do catálogo até confirmar. Copiar e Publicar ficam desativados com explicação. Ao confirmar, eles liberam na hora, sem recarregar.

## 4. Testes que vou rodar e reportar item a item
- Celular 390px: abrir modal, arrastar para fechar, trocar de produto, copiar link, abrir WhatsApp.
- "Marcar como publicado": grava, selo "No perfil" aparece no card, continua após recarregar e outro usuário não vê a linha (consulta com sessão de outra conta).
- Os 3 estados de elegibilidade: testes automáticos com reputação verde, vermelha e ausente, mais tentativa real no navegador. Se nenhum produto real vier sem reputação, eu aviso.
- Usuário sem tag confirmada: aviso aparece e confirmar libera os botões sem recarregar.

## Detalhes técnicos
- `profileEligibility` passa a retornar `{ state: 'elegivel'|'nao_elegivel'|'nao_verificado', reason }`; `eligible` = state !== 'nao_elegivel'. Os testes em `src/test/product-share.test.ts` são atualizados.
- Cache de vendedor: `Map<sellerId, {level, expires}>` no worker, válido por 24h, mais um cache curto para falhas. Sem tabela nova.
- Validação da tag: `^[A-Za-z0-9._-]{2,60}$` no `saveAffiliateProfile` (servidor) e no cliente.
- Aviso da tag: componente no catálogo, controlado por `sessionStorage`, usando a query `perfil-state` (invalidada ao confirmar).
