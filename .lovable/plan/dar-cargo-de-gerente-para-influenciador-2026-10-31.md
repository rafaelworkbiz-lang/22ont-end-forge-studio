# Dar cargo de Gerente para influenciador

## O que muda
- Na aba **Influenciadores**, cada linha ganha um botão com ícone de coroa: **"Tornar gerente"** ou **"Remover cargo de gerente"**.
- Na janela do influenciador, a parte **Dados** ganha a chave **"Gerente"**, ligada ou desligada.
- Quem é gerente mostra o selo **"Gerente"** ao lado do nome. Esse selo já existe na tela.
- Toda mudança de cargo fica registrada no **Histórico**.
- Remover a tag de influenciador também tira o cargo de gerente.
- O time do gerente, os convites e a área "Meu time" continuam para a Etapa 2. Por enquanto o cargo só fica marcado.

## Detalhes técnicos
- `influencers.functions.ts`: nova função `setInfluencerManager({ id, gerente })` com `requireAdmin`, que atualiza `influenciadores.is_gerente` e grava auditoria (`tornar_gerente` / `remover_gerente`).
- `updateInfluencer`: aceitar `is_gerente` opcional.
- `influencers-manager.tsx`: botão com ícone `Crown` na linha, chave no diálogo e invalidação da lista após salvar.
- Sem migração: a coluna `is_gerente` já existe.
