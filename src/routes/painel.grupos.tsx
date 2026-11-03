import { createFileRoute, redirect } from "@tanstack/react-router";

// Endereço antigo de grupos: agora tudo fica em Divulgação.
export const Route = createFileRoute("/painel/grupos")({
  beforeLoad: () => { throw redirect({ to: "/painel/divulgacao", search: { aba: "buscar" }, replace: true }); },
});
