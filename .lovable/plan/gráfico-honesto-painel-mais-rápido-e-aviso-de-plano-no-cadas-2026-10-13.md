# Gráfico honesto, painel mais rápido e aviso de plano no cadastro

## 1. Gráfico de "Hoje" só sobe quando a venda cai
Hoje o gráfico desenha as 24 horas de uma vez e também mostra a linha do período anterior (ontem) inteira, então aparecem picos em horários que ainda não chegaram.
- A linha de hoje termina na hora atual; horas futuras ficam vazias (sem linha nem área).
- Pontos e marcadores de pico aparecem só nas horas que tiveram venda.
- A linha de comparação (ontem) fica mais discreta e também para na hora atual, para não parecer venda de hoje.
- O tooltip em horas futuras mostra "Ainda não chegou".
- Mesma regra nos filtros de dias: dias futuros (ex.: no Mensal) ficam vazios.

## 2. Painel mais fluido e carregando mais rápido
- Primeiro investigar com medição no navegador o que atrasa a abertura (dados de vendas, imagens, Três abas carregadas juntas).
- Mostrar o esqueleto do painel na hora, enquanto os dados chegam.
- Carregar as abas pesadas (Produtos, Grupos, Gerenciar Usuários) só quando abertas.
- Imagens de produtos com carregamento preguiçoso.
- Evitar recálculos repetidos das vendas ao trocar filtros.

## 3. Mensagem de "sem plano" ao criar conta
Depois de "Criar conta" → e-mail e senha → Continuar:
- Se o e-mail não tem plano ativo: mensagem clara "Sua conta foi criada, mas você ainda não tem um plano ativo", com botões Mensal (R$ 179,90) e Vitalício (R$ 297,00) abrindo o checkout, e a dica de usar o mesmo e-mail da compra.
- Se já comprou com esse e-mail: mensagem de conta criada normalmente.
- Administradores e influenciadores não são afetados.

## Detalhes técnicos
- `demo-sales-overview.tsx`: cortar `points/area/previousPoints` no índice da hora/dia atual; renderizar círculos apenas em bins com `cents > 0`.
- Nova server function pública mínima que, dado um e-mail, retorna só `hasPlan: boolean` (sem expor dados), chamada após `signUp`.
- `React.lazy` para abas pesadas, `loading="lazy"` em imagens, `staleTime` maior nas consultas do painel.
