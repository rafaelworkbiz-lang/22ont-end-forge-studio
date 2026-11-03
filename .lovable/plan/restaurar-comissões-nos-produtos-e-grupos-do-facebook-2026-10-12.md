# Restaurar comissões nos produtos e grupos do Facebook

## Produtos
- Voltar a mostrar a porcentagem de comissão nos cards, **somente quando confirmada por uma fonte oficial do Mercado Livre**, conforme sua escolha.
- Verificar a disponibilidade dessa informação para a conta e os produtos. Hoje, o catálogo recebe preço e categoria, mas não recebe porcentagem de comissão.
- Quando não houver confirmação, mostrar **“Comissão não informada”**, sem inventar taxas por categoria nem usar a porcentagem do saldo de teste.
- Restaurar o filtro deslizante por porcentagem para produtos com comissão confirmada, usando as taxas realmente disponíveis. Sem taxas confirmadas, mantê-lo indisponível, sem esconder os produtos do catálogo padrão.
- Preservar fotos, preços, acesso ao catálogo e o pop-up de scripts.

## Grupos do Facebook
- A aba e seus controles continuam presentes, mas a lista fornecida pela plataforma está vazia. Repor a lista com grupos reais de vendas, ofertas e achadinhos pesquisados em fontes públicas.
- Buscar até 500 grupos distintos, adicionando apenas os encontrados com nome e link reais; não garantir 500 nem restaurar registros fictícios.
- Manter busca, nichos, ordenação, **Copiar link**, **Acessar grupo** e **Adicionar grupo por URL**, preservando os grupos adicionados pelo usuário.
- Informar membros somente quando houver uma fonte; caso contrário, manter **“Membros não informados”**. Não garantir que o grupo permita divulgação ou esteja ativo.

## Detalhes técnicos
- Verificar a fonte oficial de comissão antes de ampliar o retorno do catálogo; qualquer consulta ao Mercado Livre permanece no servidor.
- Manter informações pesquisadas dos grupos separadas da apresentação, com fonte e sem duplicatas.
- Validar a cópia antes de exibir sucesso e impedir novas adições duplicadas ou com domínio inválido.

## Verificação
- Testar comissão confirmada, ausência de comissão e filtro sem misturar taxas de teste.
- Conferir os links e fontes dos grupos; testar busca, filtros, cópia, acesso e preservação das adições existentes.
- Verificar as duas abas no navegador e confirmar ausência de erros.

## Limite
Se o Mercado Livre não fornecer uma taxa oficial acessível, os produtos continuarão disponíveis com “Comissão não informada”; nenhuma porcentagem estimada será apresentada como confirmada.