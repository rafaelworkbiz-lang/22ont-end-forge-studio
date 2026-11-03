# Ajustes no topo da página de vendas ao vivo

Deixar a barra do topo da página secreta igual ao print enviado.

## O que muda
- **Foto/sigla:** um círculo branco com as iniciais da loja (ex.: "MA"), separado do nome por um pequeno espaço.
- **Nome da loja** com uma setinha para baixo ao lado.
- **Vender** e **Contato** com o mesmo espaçamento do print.
- **Sininho** de notificações depois de Contato.
- **Botão "ASSISTENTE":** uma pílula num amarelo um pouco mais escuro, com um ícone escuro arredondado à esquerda.
- Os itens ficam alinhados no centro, com o mesmo tamanho de letra.
- No celular ficam só a sigla, o sininho e o botão Assistente.

Esses itens são só visuais: clicar neles não abre nada.

## Detalhes técnicos
- Arquivo da página: `src/routes/ao-vivo-k7q9.tsx`. Ícones `ChevronDown`, `Bell` e `Bot` do lucide.
- Estilos `.mlv-bar` / `.mlv-av` / `.mlv-assist` no arquivo de estilos.
