import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/painel/integracoes")({
  beforeLoad: ({ search }) => { throw redirect({ to: "/painel/fornecedores", search: { code: search.code, state: search.state }, replace: true }); },
});
