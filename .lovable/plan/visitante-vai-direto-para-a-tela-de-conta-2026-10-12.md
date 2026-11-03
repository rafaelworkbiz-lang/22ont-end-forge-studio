# Visitante vai direto para a tela de conta

## Comportamento novo
- Quem abrir o painel sem estar logado vai direto para a tela **Entrar / Criar conta** (`/auth`).
- A pessoa escolhe "Entrar" ou "Criar conta" na mesma tela, como já funciona hoje.
- Quem já está logado continua caindo direto no painel, sem mudança.
- Ao sair da conta, volta para a tela de conta (isso já funciona).

## Como fica
- Sem login: uma tela dourada de marca AfiliaPlace bem breve enquanto a sessão é verificada, seguida do redirecionamento — sem piscar o painel por trás.
- A tela `/auth` continua com a aba "Criar conta" como caminho visível; quem já tem conta entra pela aba "Entrar".
- Nada muda no painel, nas vendas, saldos ou grupos — só a porta de entrada.

## Detalhes técnicos
- `src/routes/index.tsx` passa a ler a sessão pelo `AuthProvider` (`useAccount`) e redirecionar com `useNavigate({ to: "/auth", replace: true })` quando `ready && !user`.
- Enquanto `ready` é falso (verificação da sessão no navegador), renderiza apenas o splash dourado — evita flash do painel e evita redirect falso durante a verificação.
- `/auth` já devolve quem está logado ao painel (efeito existente em `auth-screen.tsx`), então não há ciclo entre as duas telas.
- O restante do app (rotas públicas atuais, tema salvo por conta, modo teste) não é alterado.

## Validação
- Abrir `/` sem login → termina em `/auth`; criar conta/entrar → volta ao painel.
- Recarregar o painel logado permanece no painel sem redirecionamento.
- Sair → redireciona para `/auth`.
- Conferir que não há piscada do painel nem erros de página.
