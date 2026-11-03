import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/painel/assinaturas")({
  beforeLoad: () => { throw redirect({ to: "/painel/usuarios", search: { aba: "assinaturas" } as never, replace: true }); },
});
