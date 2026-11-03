# Celular 100% + app instalável (PWA)

## O que você vai ver
- Todas as telas funcionando bem no celular (390px) e tablet: página inicial, entrar/cadastro, convite, painel (todas as abas), administração, lojas públicas e páginas de influenciador.
- No celular, o menu lateral vira um menu inferior/gaveta; janelas (pop-ups) abrem em tela cheia de baixo para cima; tabelas da administração viram cartões; nada corta ou estoura para o lado.
- Botão "Instalar app" (Android) e instrução "Adicionar à Tela de Início" (iPhone): o AfiliaPlace abre como aplicativo, com ícone próprio e tela de abertura amarela/clara.

## Etapas
1. Varredura no celular (390px) e tablet (768px) de cada página com fotos de tela, listando o que quebra.
2. Base global: corrigir rolagem lateral, tamanhos de texto/títulos, áreas de toque mínimas, margens seguras do iPhone (entalhe e barra inferior).
3. Menu do painel no celular (gaveta + barra inferior com as abas principais) e janelas em tela cheia.
4. Ajustes por página: Início, Produtos (grade 2 colunas), Lojas e editor de loja (passos empilhados, prévia abaixo), Divulgação/Grupos, Fornecedores, Perfil/Configurações, Administração (Usuários, Influenciadores, Membros de time, Gerentes, Assinaturas, Recuperação), onboarding e convite, loja pública e LP.
5. App instalável: ícones (192/512 e iPhone) a partir do logo, nome, cores da marca, abrir direto no painel.
6. Nova varredura com fotos para confirmar.

## Detalhes técnicos
- PWA apenas instalável (manifest + ícones + meta tags em `__root.tsx`), sem service worker — sem modo offline, para não causar telas presas/cache velho. Offline pode vir depois se você quiser.
- Ajustes de densidade continuam centralizados em `styles.css`; sem mudanças no banco nem nas regras.
- Verificação com Playwright em 390x844 e 768x1024, logado com a conta de teste e admin.
