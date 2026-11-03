# Influenciadores: sem contagem de vendas, comissão inicial de 50%

## O que muda
1. **O AfiliaPlace para de contar vendas de influenciador.** A Applyfy já faz isso. Saem da aba Influenciadores:
   - a coluna "vendas do mês"
   - a parte "Vendas" na janela do influenciador
   - os totais de vendas e comissão
   As compras continuam liberando o acesso do cliente normalmente.
2. **Comissão:**
   - A comissão padrão passa a ser **50%**, como oferta de início.
   - Na janela de cada influenciador aparece "Comissão combinada" já com 50%. O admin pode aumentar quando negociar, e a mudança fica registrada no Histórico.
   - Esse número serve só para consulta. O pagamento acontece na Applyfy.
3. **Configurações:**
   - O campo "% do influenciador" vira "Comissão inicial (oferta de entrada)", com 50%.
   - Uma nota explica que valores maiores são negociados com a administração e precisam ser ajustados também na Applyfy.

## Detalhes técnicos
- Webhook Applyfy: remover a chamada `recordInfluencerSale` e o arquivo `influencer-sales.server.ts`. A tabela `vendas_influenciador` fica sem uso, marcada como DEPRECATED.
- Migração:
  - `config_admin.percentual_influenciador` passa a ter default 50, e a linha existente é atualizada para 50.
  - Nova coluna `influenciadores.comissao_percentual numeric NOT NULL DEFAULT 50`, com CHECK entre 0 e 100.
- `influencers.functions.ts`:
  - remover a leitura de vendas e os totais
  - `updateInfluencer` passa a aceitar `comissao_percentual` (de 0 a 100) e grava auditoria
- `influencers-manager.tsx`: remover a UI de vendas e adicionar o campo de comissão.
- `influencer-rules.ts` e testes: remover cálculo e atribuição de vendas. Novo teste: comissão padrão de 50% e rejeição de valor fora de 0 a 100.
- Salvar na memória do projeto: comissão inicial de 50%, valores maiores negociados com a administração, vendas contadas pela Applyfy.
