# Editor de loja: ordem das etapas, produtos de exemplo e IA mais rápida

## 1. Nova ordem das etapas
Nome → Identidade → **Layout** → **Tema** → Produtos.
Quem já estava no meio da edição continua na mesma etapa (pelo nome, não pelo número).

## 2. Produtos de exemplo na prévia (etapas 1 a 4)
Enquanto a loja ainda não tem produtos escolhidos, a prévia ao lado mostra 8 produtos de exemplo (foto, nome, preço, botão "Comprar"), com um selinho discreto "Exemplo". Assim dá para ver como layout e tema ficam de verdade. Na etapa Produtos, os exemplos somem e entram os produtos reais escolhidos. A página pública da loja nunca mostra exemplos.

## 3. Gerar logo/banner com IA mais rápido
Hoje cada geração faz 3 passos em sequência: um "diretor" escreve ideias, gera as imagens e depois o diretor revisa as imagens. Vamos:
- tirar o passo do diretor antes (as ideias saem direto do texto, cores e estilo que você escreveu);
- tirar a revisão depois;
- gerar as 2 opções ao mesmo tempo, em qualidade média;
- mostrar as opções aparecendo aos poucos com um desfoque enquanto carregam.
O bloqueio de marcas e pessoas continua.

## 4. Ao escolher a imagem, ela fica no bloco
Ao clicar numa das 2 opções, ela é aplicada na hora no quadro da Logo (ou do Banner) da etapa Identidade e na prévia, sem precisar recarregar nem procurar. A versão em alta qualidade é trocada por trás quando terminar.

## Detalhes técnicos
- `store-editor.tsx`: STEPS reordenado; mapa de passo antigo → novo em `passoAtual`/`?passo`; prévia recebe produtos fictícios locais quando `step < 4` e a lista está vazia.
- `store-ai.functions.ts`: remover `diretorConceitos` e `checarImagens` do fluxo de gerar; conceitos montados por `store-ai-art.ts` (puro); `Promise.allSettled` das 2 imagens.
- `store-ai-picker.tsx`: após `escolher`, chamar callback que atualiza logo/banner no estado do editor e invalida a query da loja.
- Ajustar testes do diretor de arte e rodar a suíte.
