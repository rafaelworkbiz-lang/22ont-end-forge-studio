import { createFileRoute, redirect } from "@tanstack/react-router";

// Link antigo: abre o editor em janela sobre Minhas lojas.
export const Route = createFileRoute("/painel/lojas/$id")({
  beforeLoad: ({ params, search }) => {
    const p = Number((search as Record<string, unknown>)["passo"]);
    throw redirect({ to: "/painel/lojas", search: { janela: "loja-editor", id: params.id, ...(Number.isInteger(p) && p >= 1 && p <= 5 ? { passo: String(p) } : {}) }, replace: true });
  },
});
