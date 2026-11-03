# Novos links padrão da plataforma (Applyfy)

## O que muda
1. **Página inicial (sem código):** os botões "Assinar mensal" e "Quero o vitalício" passam a usar:
   - Mensal: `checkout/cmvv7ihvg0ciu01q6pofcauy2?offer=9uw4neg`
   - Vitalício: `checkout/cmvv7iqfj04ga01n60jjth2ss?offer=ggo7ayu`
   Os mesmos links valem para os botões de plano da tela de criar conta e da tela de quem está sem plano ativo.
2. **Liberação automática do acesso:** o sistema passa a reconhecer essas duas ofertas novas na Applyfy. Compra do Mensal libera 30 dias e compra do Vitalício libera sem vencimento. As ofertas antigas continuam valendo para quem já comprou por elas.
3. **Configurações do admin:** os links padrão salvos lá são trocados pelos novos. Também ficam guardados ali, e você pode editar:
   - Link para criar conta na Applyfy (`auth/register?code=4NC0PGWB`)
   - Link para pedir afiliação ao Mensal (`showcase/cmvv7ihvc0cit01q6n4ijsh7e`)
   - Link para pedir afiliação ao Vitalício (`showcase/cmvv7iqfg04g901n62syrnq46`)
4. **Influenciador sem time (que não veio por convite de gerente):** no passo a passo da Etapa 2, ele vai ver esses links padrão para criar a conta e pedir afiliação. Quem veio pelo convite de um gerente vai ver o link do gerente.
5. **Páginas com código (`/{codigo}`, como `/r234`):** continuam usando os links do próprio influenciador. Não mudam.

## Detalhes técnicos
- `landing-page.tsx`: `CHECKOUT_MENSAL`/`CHECKOUT_VITALICIO` atualizados; procurar com `rg` outras cópias dos links antigos (tela de auth e tela sem plano) e trocar.
- `applyfy-event.ts`: incluir `cmvv7ihvg0ciu01q6pofcauy2`, `9uw4neg`, `cmvv7ihvc0cit01q6n4ijsh7e` em `monthly` e `cmvv7iqfj04ga01n60jjth2ss`, `ggo7ayu`, `cmvv7iqfg04g901n62syrnq46` em `lifetime`; teste novo confirmando que cada oferta identifica o plano certo.
- Migração: adicionar a `config_admin` as colunas `link_cadastro_applyfy`, `link_afiliacao_mensal` e `link_afiliacao_vitalicio`, com esses valores como padrão. Atualizar a linha existente com os novos links padrão de checkout (`UPDATE` de backfill na mesma migração).
- Formulário de Configurações e `getAdminConfig`/`saveAdminConfig`: incluir os três campos novos.
