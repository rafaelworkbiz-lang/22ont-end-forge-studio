# Confirmar a tag em Integrações

## O que já conferi
- 7 clientes conectaram o Mercado Livre e têm tag salva, mas **nenhum** conseguiu confirmar: a confirmação ficou vazia para todos. Então o problema é geral, não de uma conta só.
- As permissões do banco para guardar a confirmação estão corretas. Ou seja, a causa está no caminho entre o botão e o servidor, e ainda **não está confirmada**.
- Hoje, se der erro, aparece só "Não foi possível salvar.", sem dizer em qual parte falhou.

## O que vou fazer
1. **Reproduzir com a conta de teste** (teste@afiliaplace.com.br): colocar nela uma conexão do Mercado Livre falsa e temporária, entrar com ela e clicar em Confirmar, observando a resposta do servidor. Não toco em nenhuma conta real.
2. **Corrigir a causa encontrada** para que o botão Confirmar grave a confirmação e mostre "Tag confirmada" na hora.
3. **Mensagens de erro claras**: dizer se o problema foi salvar a tag, a tag ser inválida ou a conta não estar conectada.
4. **Testar de novo** com a conta de teste: confirmar, recarregar a página e ver que continua confirmado. Na aba Produtos, conferir que o botão de copiar link fica liberado.
5. Apagar a conexão falsa da conta de teste no final.

## Detalhes técnicos
- O fluxo chama `saveMeliTag` e depois `saveAffiliateProfile({confirmTag:true})`. Esta última função chama `resolveMeliAccess` → `getUserRoles` (`db.auth.getUser()`) e faz upsert em `meli_affiliate_profile`. Vou registrar o erro real de cada etapa e devolver um código de motivo.
- Vou adicionar um teste para a regra: com a conta conectada e uma tag válida, a confirmação é gravada.
