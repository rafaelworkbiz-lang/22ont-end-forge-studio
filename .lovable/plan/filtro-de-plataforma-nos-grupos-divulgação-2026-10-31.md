## Filtro de plataforma nos grupos (Divulgação)

O que vai mudar:
1. Ao lado de "Todos os nichos", entra uma seleção **Plataforma**: Todas, Facebook, WhatsApp.
2. A escolha filtra a lista de grupos na hora e funciona junto com a busca, as palavras-chave e o nicho.
3. A escolha fica guardada no endereço da página: recarregar ou voltar mantém o filtro.
4. Ao trocar a plataforma, a lista volta para a primeira página.
5. Conferir na tela com a conta de teste.

### Detalhes técnicos
- divulgacao.tsx: novo useUrlFilter("plataforma"), select com o mesmo estilo do nicho, incluído na queryKey e no reset de página.
- divulgacao.functions.ts: searchGroups aceita `rede: "facebook" | "whatsapp" | null` (zod) e aplica `.eq("rede", ...)`.
