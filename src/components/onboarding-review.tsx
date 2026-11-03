import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adminReviewOnboarding } from "@/lib/influencers.functions";

export const PENDENTES = ["conta_applyfy", "afiliacao_pedida", "links_enviados"];

/** Botões de aprovar/recusar conforme a etapa do cadastro. */
export function ReviewButtons({ id, status, onDone }: { id: string; status: string; onDone: () => unknown }) {
  const review = useServerFn(adminReviewOnboarding);
  const [busy, setBusy] = useState(false);
  const run = async (acao: "aprovar_afiliacao" | "aprovar_links" | "recusar", ok: string) => {
    let motivo: string | undefined;
    if (acao === "recusar") { motivo = prompt("Motivo da recusa (a pessoa vai ver):")?.trim(); if (!motivo) return; }
    setBusy(true);
    try { await review({ data: { id, acao, motivo } }); toast.success(ok); await onDone(); } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };
  const aprovar = status === "links_enviados" ? <Button size="sm" className="um-primary" disabled={busy} onClick={() => void run("aprovar_links", "Links aprovados. Conta ativa.")}>Aprovar links</Button>
    : status === "afiliacao_pedida" || status === "conta_applyfy" ? <Button size="sm" className="um-primary" disabled={busy} onClick={() => void run("aprovar_afiliacao", "Afiliação aprovada")}>Aprovar afiliação</Button> : null;
  if (!aprovar) return null;
  return <span className="links-row">{aprovar}<Button size="sm" variant="outline" disabled={busy} onClick={() => void run("recusar", "Cadastro recusado")}>Recusar</Button></span>;
}
