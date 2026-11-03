# Mais opções profissionais em Tema e Layout (editor de loja)

## Tema (etapa 3)
- **Paletas prontas:** passar de 10 para cerca de 20, com combinações tipo marca premium (Grafite & Ouro, Azul Marinho, Verde Floresta, Terracota, Preto Luxo, Lavanda Suave, Café, Oceano, Vinho, Menta…).
- **Fundo:** de 3 para 7 (Branco, Creme, Cinza claro, Areia, Gelo azulado, Grafite escuro, Preto). Fundos escuros ajustam o texto sozinhos para continuar legível.
- **Fontes:** de 3 para 7 (Moderna, Elegante, Divertida, Clássica, Geométrica, Minimal, Editorial).
- **Cantos:** acrescentar "Pílula" (bem redondo).
- **Novos ajustes:**
  - Estilo dos cartões: Sombra leve, Com borda, Plano, Elevado.
  - Estilo dos botões: Preenchido, Contorno, Pílula.
  - Espaçamento: Compacto, Normal, Arejado.
  - Topo da loja: Claro, Na cor da loja, Escuro.

## Layout (etapa 4)
- **Layouts de produtos:** de 8 para 12, somando Galeria grande (2 por linha, fotos grandes), Minimal (só foto e preço), Catálogo (3 colunas com descrição) e Boutique (destaque alternado).
- **Posição do banner:** somar "Lateral" e "Cartão flutuante".
- **Novos ajustes:**
  - Foto do produto: Quadrada, Retrato, Paisagem.
  - Mostrar ou esconder: selo do fornecedor, preço, botão.
  - Filtro de categorias: Pílulas, Abas ou Escondido.
  - Rodapé: Simples ou Completo.

Tudo aparece na hora na prévia ao lado (computador e celular), e a página pública da loja usa as mesmas escolhas. Lojas já criadas continuam iguais (valores padrão).

## Detalhes técnicos
- `store-theme.ts`: ampliar PALETAS, FUNDOS, FONTES (carregar novas fontes Google no `<link>` do root), CANTOS, LAYOUTS, BANNER_POS; novos campos opcionais no `Tema` (`cartao`, `botaoEstilo`, `espaco`, `topo`) e na `Aparencia` (`foto`, `mostrar`, `filtro`, `rodape`) com padrões; `temaVars` expõe as novas variáveis CSS.
- `stores.functions.ts`: ampliar os `z.enum` de tema e `preset`, aceitar campos novos opcionais (salvos no JSON de aparência existente; checar se a coluna `preset` tem restrição no banco e ajustar via migração se tiver).
- `loja-publica.tsx` e `styles.css`: renderização dos novos layouts/variações usando classes/data-atributos.
- `store-editor.tsx`: novos grupos de opção nas etapas Tema e Layout com miniaturas.
- Testes: padrões aplicados a lojas antigas e contraste em fundos escuros.
