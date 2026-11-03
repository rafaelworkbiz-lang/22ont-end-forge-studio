# Ajustes no card de produto e no pop-up de script

## O que muda para o usuário

1. **Cards de produto limpos**: somem os botões "Copiar link" e "Abrir no ML" de dentro dos cards. O card mostra só foto, nome, preço, frete e comissão. Clicar no card abre o pop-up, onde ficam os dois botões.
2. **Barra de rolagem invisível**: no pop-up (janela e caixa do texto do script) a rolagem continua funcionando com mouse/toque, mas a barra não aparece.
3. **Script do Facebook separado em partes**: dentro do pop-up, quando "Facebook" está selecionado, o script aparece em blocos distintos:
   - **Título da postagem** (chamada com emojis)
   - **Descrição** (nome do produto, preço, frete, benefícios, link de afiliado, chamada para comentar)
   - **Hashtags**
   Cada bloco tem seu próprio botão "Copiar", além do "Copiar script" que copia tudo junto. O botão "Trocar script" troca os 4 modelos, atualizando todos os blocos.
4. **WhatsApp** continua como texto único pronto para colar, com "Trocar script" e "Copiar script".

## Detalhes técnicos

- `src/components/products-catalog.tsx`: remover o bloco `.product-actions` do card (e o estado `copied` / função `copy` se ficarem sem uso, mantendo import de ícones limpo).
- `src/components/product-script-dialog.tsx`:
  - Os 4 modelos do Facebook passam a retornar `{ title, body, tags }`; WhatsApp segue como string.
  - Renderizar 3 caixas arredondadas rotuladas (Título, Descrição, Hashtags) com botão de copiar individual; texto completo = título + descrição + hashtags.
  - Manter botões "Copiar link" e "Abrir no ML" no topo do pop-up.
- `src/styles.css`: adicionar utilitário que esconde a barra (`scrollbar-width: none; -ms-overflow-style: none; ::-webkit-scrollbar { display: none }`) em `.script-dialog` e `.script-text`; estilos `.script-part`, `.script-part-head` para os blocos do Facebook; remover regras `.product-actions` não usadas.
- Verificar com Playwright: card sem botões, pop-up abre, alternância WhatsApp/Facebook, blocos separados, scroll sem barra visível (desktop e 390px), e build sem erros.

## Dúvida assumida

"Barra de scroll invisível" foi interpretada como valendo para o pop-up. Se quiser também na página inteira, é só avisar.
