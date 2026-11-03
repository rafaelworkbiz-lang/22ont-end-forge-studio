## Configurações › Links e convites: mostrar só o link do site

### O que muda
- Saem as duas linhas que mostram os links de checkout da Applyfy (Mensal e Vitalício).
- Fica em destaque só o link da sua página (afiliaplace.site/seu-código), com o botão Copiar e o QR code.
- Entra um texto curto explicando: "Este é o link da sua página de vendas. Os botões de compra dela já usam os seus links de checkout Mensal e Vitalício, então quem comprar por ela gera comissão para você. Compartilhe sempre este link."
- O botão "Pedir troca de links" continua, mas o formulário abre com os campos vazios (sem mostrar os links atuais).

### Detalhes técnicos
- Só em `src/components/my-links-card.tsx`: remover as linhas de `link_mensal`/`link_vitalicio`, adicionar o texto explicativo e iniciar `edit` com strings vazias.
