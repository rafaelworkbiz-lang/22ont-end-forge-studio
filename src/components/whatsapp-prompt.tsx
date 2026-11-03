import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { meuWhatsapp, salvarMeuWhatsapp, normalizeWhatsapp } from "@/lib/members.functions";

export function WhatsappPrompt({ enabled }: { enabled: boolean }) {
  const get = useServerFn(meuWhatsapp); const save = useServerFn(salvarMeuWhatsapp);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["meu-whatsapp"], queryFn: () => get(), enabled, staleTime: Infinity });
  const [v, setV] = useState(""); const [busy, setBusy] = useState(false);
  const open = enabled && !!q.data?.precisa;
  async function enviar() {
    if (!normalizeWhatsapp(v)) { toast.error("Digite o DDD + número, ex.: 11 91234-5678"); return; }
    setBusy(true);
    try { await save({ data: { whatsapp: v } }); toast.success("WhatsApp salvo!"); qc.setQueryData(["meu-whatsapp"], { precisa: false }); }
    catch (e: any) { toast.error(e?.message ?? "Erro ao salvar"); } finally { setBusy(false); }
  }
  return (
    <Dialog open={open}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} className="[&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Qual é o seu WhatsApp?</DialogTitle>
          <DialogDescription>Precisamos do seu número para falar com você sobre sua conta.</DialogDescription>
        </DialogHeader>
        <input className="v2-input" inputMode="tel" placeholder="(11) 91234-5678" value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && enviar()} autoFocus />
        <Button onClick={enviar} disabled={busy}>{busy ? "Salvando…" : "Salvar"}</Button>
      </DialogContent>
    </Dialog>
  );
}
