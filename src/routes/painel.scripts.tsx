import { createFileRoute, redirect } from "@tanstack/react-router";

// Endereço antigo de scripts: agora é a aba Mensagem e arte de Divulgação.
export const Route = createFileRoute("/painel/scripts")({
  beforeLoad: () => { throw redirect({ to: "/painel/divulgacao", search: { aba: "mensagem" }, replace: true }); },
});
