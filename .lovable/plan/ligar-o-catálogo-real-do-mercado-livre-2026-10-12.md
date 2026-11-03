# Ligar o catálogo real do Mercado Livre

## 1. O que preencher na tela do Mercado Livre (você faz)

- **URIs de redirect:** `https://id-preview--8c1118b7-5e84-42d6-b963-d63329d0744c.lovable.app` (quando publicar, adicione também o endereço publicado).
- **Fluxos OAuth:** marque **Client Credentials** e **Refresh Token**. Authorization Code e PKCE podem ficar desmarcados.
- **Negócios:** marque só **Mercado Livre** (VIS não é necessário).
- **Permissões:** **Usuários = Leitura**. Todas as outras: **Sem acesso**. O catálogo só lê produtos públicos, não mexe em vendas nem anúncios.
- **Tópicos:** nenhum.
- **URL de notificação:** pode deixar em branco.
- Salve. A tela seguinte mostra o **App ID** e a **Secret Key**.

## 2. Guardar as chaves com segurança (eu faço)

- Abro um formulário seguro pedindo `MELI_APP_ID` e `MELI_CLIENT_SECRET`. As chaves ficam só no servidor, nenhum cliente vê.
- Você só precisa colar as duas e salvar. Desta vez é importante não fechar o formulário, porque sem elas o catálogo não puxa produtos.

## 3. Conferir que funciona (eu faço)

- Testo a busca do catálogo direto no servidor, com uma palavra como "fone".
- Abro a aba Produtos no preview e confiro fotos, preços, categorias, "Carregar mais" e "Copiar link" com a tag de afiliado.
- Se o Mercado Livre recusar a busca (algumas contas novas são bloqueadas para busca), ajusto o pedido. Se o bloqueio for do lado deles, explico o próximo passo.

## Detalhes técnicos
- O código do catálogo já existe (busca no servidor, token em cache, link com `matt_word` + `matt_tool`). Não precisa mudar a tela.
- Validar `/oauth/token` (client_credentials) e `/sites/MLB/search`. Se der 403, testar `/products/search` como alternativa e adaptar `src/lib/meli.functions.ts`.
