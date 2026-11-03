# Adicionar produto sem sair da aba Produtos

## O que muda
- Ao clicar em "Adicionar a Meus produtos" na janela de detalhes do produto, a escolha "Onde adicionar" (Meus produtos ou uma loja) aparece **dentro da mesma janela**, sem abrir outra janela e sem trocar de aba.
- Ao confirmar, o produto é salvo e a janela mostra "Adicionado" ali mesmo; o botão vira "Em Meus produtos" (verde/marcado).
- Você continua na aba Produtos, navegando no catálogo. Um aviso pequeno no canto oferece "Ver Meus produtos" para quem quiser ir até lá.
- Remove o pulo automático para a aba Meus produtos feito no ajuste anterior.

## Detalhes técnicos
- `library.tsx`: o modal de detalhes ganha um estado local `etapa: "detalhe" | "adicionar"`; `onAdd` passa a trocar a etapa em vez de chamar `abrir("adicionar-produto")`.
- Reaproveitar o conteúdo do `AddContent` de `library-shared.tsx` como componente embutido (props `product`, `onDone`), sem o `navigate` para `/painel/meus-produtos`; no sucesso, volta à etapa "detalhe" e invalida a lista de salvos para atualizar o selo.
- A janela `?janela=adicionar-produto` continua existindo para links antigos, mas sem redirecionar de aba.
