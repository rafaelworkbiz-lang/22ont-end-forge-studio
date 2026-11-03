# Fechamento do PATCH-017

O PATCH-017 tinha três etapas e as três estão prontas. Não existe uma Etapa 4 no arquivo. O que falta é fechar as pontas abaixo.

## 1. Corrigir o destaque amarelo do menu
Na aba Administração, o destaque amarelo aparece um pouco abaixo do item. Ele vai passar a ficar exatamente sobre o item escolhido, também com o menu recolhido e no celular.

## 2. Revisão final das três etapas
Vou passar pela lista "Testes e decisões do dono" do arquivo e conferir na tela, em computador e celular:
- Usuários
- Influenciadores
- Gerentes
- Meu time
- Assinaturas
- Recuperação
- Página de convite

Também vou fazer um teste da rotina das 06:00 com uma conta de teste: vencer de mentira um Mensal, conferir se as lojas pausam e se o item entra na Recuperação. Depois desfaço tudo. Nenhuma conta real será tocada.

## 3. Ajustes pequenos
- Os filtros da Recuperação ficam numa linha só no computador.

## 4. Verificação de segurança e publicação
Vou rodar a verificação de segurança e corrigir o que aparecer. Só publico com o seu OK.

## Depende de você (não dá para fazer sozinho)
- **Domínio de e-mail verificado:** sem ele, os e-mails de acesso e de aviso de vencimento não saem.
- **Avisos reais da Applyfy:** um pagamento recusado ou um Pix não pago, para confirmar os nomes que ela envia.
- **Chave do Cloudflare Turnstile:** é o anti-robô da página de convite e ainda está opcional.
- **App ID e Secret da Shopee:** para ativar a Shopee de verdade.
