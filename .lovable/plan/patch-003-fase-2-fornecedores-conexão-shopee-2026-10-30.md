# PATCH-003 · Fase 2 — Fornecedores: conexão Shopee

Mantém o visual da Fase 1. Não mexe na conexão/tabelas do Mercado Livre, catálogo, pagamentos nem admin.

## O que o usuário vai ver
- Aba Fornecedores com cabeçalho "X/2 conectados" real (ML + Shopee).
- Card Mercado Livre redesenhado: selo de status, 4 blocos (Conta, Tag + confirmação, Produtos em Meus produtos ou "—", Perfil de afiliado), botões "Ver produtos validados" e "Gerenciar conexão" (menu: Reconfirmar tag, Editar link do perfil, Desconectar com confirmação). Reaproveita as ações que já existem hoje.
- Card Shopee com 4 estados: não conectado (aviso + App ID/Secret com Mostrar/Ocultar + "Testar e conectar" / "Ainda não sou afiliado"), verificando, erro com causa e solução, conectado (faixa verde, App ID mascarado, último teste, "Testar de novo", "Desconectar").
- Card "Novos fornecedores em breve" com formulário "Sugerir fornecedor".
- Regras de UI: uma ação amarela por card, labels visíveis, erros com aria, carregando nos botões, AlertDialog em ações destrutivas, status com texto/ícone.

## Banco (uma migration)
- `fornecedor_conexoes` conforme especificado, único (user_id, fornecedor). Sem acesso direto do navegador à tabela (nenhum grant para authenticated); leitura só por função security-definer `minhas_conexoes_fornecedor()` que devolve id, fornecedor, status, app_id mascarado, ultimo_teste_em, ultimo_erro do próprio `auth.uid()`.
- `sugestoes_fornecedor` (id, user_id, nome, site, observacao, criado_em): usuário insere/lê só as próprias.
- `fornecedor_rate` (user_id, janela, contagem) para o limite de 30 chamadas/minuto, gravado pelo servidor.

## Servidor
- Novo segredo `FORNECEDOR_CRYPTO_KEY` gerado automaticamente (AES-GCM, nunca exibido).
- `src/lib/shopee.server.ts`: assinatura SHA256(AppId+Timestamp+Payload+Secret), POST GraphQL, timeout 10s, 1 nova tentativa só em erro de rede, mapeamento de erros legíveis (credencial inválida, sem permissão, limite, Shopee fora do ar), logs sem secret, cifra/decifra.
- `src/lib/shopee.functions.ts` (autenticadas): `testShopee`, `searchShopee`, `shortlinkShopee`, `disconnectShopee`, `getShopeeStatus`, `suggestSupplier`. Escrita via cliente admin só depois de verificar o usuário. search/shortlink ficam prontos, sem tela.

## Testes (conta de teste)
1. Credenciais falsas → erro claro, nenhuma linha gravada (consulta no banco).
2. Sem credenciais reais: sucesso testado com mock da resposta Shopee em teste automático (assinatura, mascaramento, cifra ida/volta) — relatado como mock. Se você me passar App ID/Secret reais, testo de verdade.
3. Navegador: resposta da consulta de status sem `secret_cifrado`.
4. Isolamento: leitura direta da tabela negada e função só devolve linhas do próprio usuário.
5. Desconectar apaga a linha e o card volta a Não conectado.
6. Card ML mostra dados reais; link copiado no catálogo mantém a tag.
7. Celular 390px: cards empilhados, nada cortado.

## Pendência conhecida
- Conectar de verdade depende de credenciais Shopee aprovadas na Open API.
