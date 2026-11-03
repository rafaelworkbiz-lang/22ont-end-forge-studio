# Etapa "Aguardando aprovação" mais limpa

## O que muda
1. **Saem os botões "Testar link Mensal" e "Testar link Vitalício"** da etapa 6. A tela fica só com:
   - o relógio e o texto "Recebemos seus links! Agora é só aguardar a aprovação";
   - o botão "Verificar aprovação" (e a conferência automática a cada 30 segundos).
   - Também sai a caixa com o endereço da página, que só aparece depois de aprovado.
2. **Depois de aprovado**, continua abrindo a tela própria de boas-vindas que já foi criada: link da página para copiar, aviso de que ele fica em Configurações e os 3 blocos explicando como ganhar.
3. **Página de vendas com código (afiliaplace.site/código):** já usa os links de checkout Mensal e Vitalício que a pessoa colou no cadastro. Os botões de compra dessa página levam para esses links, e não para os links padrão. Isso continua igual e vai ser conferido abrindo uma página de influenciador ativo.

## Detalhes técnicos
- `influencer-onboarding.tsx`: remover os `ext(...)` e a caixa `onb-explain` do passo 5.
- Conferir: abrir `/{codigo}` de um influenciador ativo e confirmar que os botões dos planos levam a `link_mensal` e `link_vitalicio` dele.
