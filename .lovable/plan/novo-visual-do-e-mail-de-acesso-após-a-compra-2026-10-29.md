# Novo visual do e-mail de acesso após a compra

O e-mail continua com o mesmo conteúdo: login, senha própria do cliente e botão de entrar. Só muda o visual e a organização, deixando-o com a cara da AfiliaPlace.

## Como vai ficar
1. **Topo da marca**: faixa em laranja dourado com a logo da AfiliaPlace (mascote + nome).
2. **Boas-vindas**: "Bem-vindo(a) à AfiliaPlace!" e um selo com o plano comprado (Mensal ou Vitalício). No Vitalício aparece também "sem vencimento".
3. **Cartão de acesso**: fundo cinza clarinho, com o login e a senha em letras grandes e fáceis de copiar.
   - Quem já tinha conta vê a frase "Use sua senha atual" e o link "Esqueci minha senha".
4. **Botão grande**: "Acessar minha conta", que leva para afiliaplace.site/auth.
5. **Primeiros passos** (3 itens curtos): conectar sua conta do Mercado Livre em Integrações, explorar Produtos e usar os grupos e scripts de divulgação.
6. **Aviso de segurança**: "Troque sua senha em Meu Perfil e não compartilhe estes dados."
7. **Rodapé**: AfiliaPlace e o endereço do site. O link de descadastro é adicionado automaticamente pelo sistema de envio.

Assunto: "Seu acesso à AfiliaPlace chegou 🎉 — login e senha dentro".

## Detalhes técnicos
- Editar somente `src/lib/email-templates/purchase-access.tsx`, sem alterar as propriedades (email, password, plan), o webhook ou o envio.
- Logo puxada por URL absoluta pública (https://afiliaplace.site/...), já que imagens embutidas não funcionam em e-mail. Fundo do corpo em branco e estilos inline, sem CSS externo.
- Dados de exemplo da pré-visualização: Vitalício com senha.
