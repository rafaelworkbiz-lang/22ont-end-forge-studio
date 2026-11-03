# Login e criação de conta — Afiliasplace

## Visual
- Criar uma tela de acesso seguindo a identidade atual da plataforma: cinza muito claro, texto em carvão e destaques em laranja dourado.
- Dar protagonismo à logo do Canarinho e ao nome Afiliasplace, mantendo as proporções da imagem.
- Formulário central, composição limpa, tipografia da plataforma e efeitos discretos em dourado nos contornos e interações. Sem excesso de brilho, bolhas decorativas ou aparência genérica de IA.
- Alternar entre **Entrar** e **Criar conta** na mesma tela, com acabamento consistente no celular e no computador.

## Acesso funcional
- **Entrar:** e-mail, senha, mostrar/ocultar senha e botão de acesso.
- **Criar conta:** e-mail, senha e confirmação de senha, sem solicitar nome, foto ou outros dados de perfil.
- Disponibilizar **Continuar com Google** nos dois modos.
- Exibir validações, carregamento, mensagens de erro compreensíveis e confirmação de envio do e-mail de cadastro.
- Manter a confirmação de e-mail: criar conta não significa estar conectado antes de confirmar.
- Incluir **Esqueci minha senha**, envio do link e uma tela para definir a nova senha.
- Após entrar, abrir o painel existente; mostrar o e-mail da conta conectada e tornar **Sair** funcional, limpando os dados da sessão.

## Limites desta etapa
- Não criar tabela de perfis, conforme sua escolha.
- Não alterar cobrança, planos, vencimentos ou funções de influenciadores.
- Cadastro não concede papel de administrador e não será vinculado automaticamente aos cadastros de “Gerenciar Usuários”.
- Esta etapa implementa o acesso e suas telas; a restrição das áreas administrativas por permissões é uma etapa separada. O login sozinho não torna os cadastros administrativos privados.

## Detalhes técnicos
- Criar as rotas públicas `/auth` e `/reset-password`, com títulos e descrições próprios; preservar a estrutura atual do painel.
- Usar o Lovable Cloud para e-mail/senha e Google, habilitando os métodos durante a implementação, sem ativar confirmação automática.
- Usar os componentes compartilhados e definir os efeitos e cores como tokens no stylesheet global.
- Centralizar as atualizações de sessão, validar a identidade com `getUser()` e usar o fluxo gerenciado do Google com retorno para uma URL pública da mesma origem.
- Na recuperação de senha, tratar o retorno `type=recovery` e atualizar a senha sem pedir a senha antiga.
- Registrar a decisão de arquitetura e atualizar a documentação e a lista de tarefas.

## Verificação
- Conferir alternância dos formulários, validações, mostrar senha e estados de envio.
- Testar entrar, ler a conta conectada no painel, sair e recuperar senha no que for possível sem acessar a caixa de e-mail do usuário.
- Verificar a configuração dos métodos de acesso e distinguir testes reais de etapas que dependem de confirmação por e-mail ou autorização no Google.
- Conferir o visual em computador e celular, sem cortes ou sobreposição.