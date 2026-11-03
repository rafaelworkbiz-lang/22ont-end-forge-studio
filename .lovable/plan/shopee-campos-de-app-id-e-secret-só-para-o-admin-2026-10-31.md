## Shopee: campos de App ID e Secret só para o admin

### O que muda
- **Admin:** o cartão da Shopee continua igual, com App ID, Secret, "Testar e conectar" e "Usar esse fornecedor".
- **Outras contas:** o cartão mostra só o logo, o nome, uma frase curta e o botão "Usar esse fornecedor". O aviso sobre credenciais e os campos de App ID e Secret deixam de aparecer.
- Para essas contas, clicar em "Usar esse fornecedor" da Shopee não faz nada: não abre janela, não troca de tela e não mostra mensagem.
- O Mercado Livre não muda.

### Detalhes técnicos
- Em `src/components/suppliers.tsx` (`ShopeeSupplierCard`), ler `isAdmin` de `useAuth` (auth-provider). Se a conta não for admin, mostrar apenas o cabeçalho e um `Button` com `onClick={() => {}}`.
- Não buscar o status da Shopee para quem não é admin.
- A proteção no servidor continua como está.
