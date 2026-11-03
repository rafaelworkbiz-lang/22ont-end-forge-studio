# Etapa final: aguardando aprovação e boas-vindas

## O que muda
1. **Etapa 6 vira "Aguardando aprovação"** (no lugar de "Revisão"):
   - ícone de relógio animado e o texto "Recebemos seus links! Agora é só aguardar: {gerente ou a administração} vai conferir e liberar sua conta.";
   - prévia do endereço da página (afiliaplace.site/código), ainda marcada como "liberada após aprovação";
   - botões "Testar link Mensal" e "Testar link Vitalício" continuam;
   - a tela confere sozinha a cada 30 segundos e também tem o botão "Verificar agora".
2. **Tela de boas-vindas, que aparece uma vez assim que a conta é aprovada:**
   - "Bem-vindo(a), {nome}! Sua conta foi aprovada.";
   - caixa de copiar e colar com o link da página de vendas (afiliaplace.site/código) e o botão "Copiar link";
   - aviso: "Você encontra esse link sempre em Configurações › Meus links.";
   - 3 blocos explicativos: "Compartilhe seu link" (redes, grupos, WhatsApp) → "A pessoa compra pela sua página" (Mensal ou Vitalício) → "Você ganha comissão" (50% inicial, paga pela Applyfy);
   - botão "Ir para o meu painel". Depois de clicar, essa tela não aparece de novo.

## Detalhes técnicos
- `influencer-onboarding.tsx`: novo conteúdo do passo 5; `refetchInterval` de 30s na consulta de onboarding enquanto o status é `links_enviados`.
- Novo `influencer-welcome.tsx`; `painel.tsx` mostra essa tela quando o status é `ativo` e ainda não existe a marca "boas-vindas vista" salva no navegador para essa conta (lida depois de carregar).
- Confirmar que o cartão "Meus links" em Configurações mostra o link da página; ajustar o texto se for preciso.
- Estilos reaproveitam `.cv-cards` e os blocos do cadastro.
