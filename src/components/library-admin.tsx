import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminLibraryStatus, adminRefreshStep } from "@/lib/library.functions";

export function LibraryAdmin() {
  const status = useServerFn(adminLibraryStatus), step = useServerFn(adminRefreshStep);
  const s = useQuery({ queryKey: ["admin-library"], queryFn: () => status(), refetchInterval: 15_000 });
  const [busy, setBusy] = useState<string | null>(null);
  async function refreshAll() {
    setBusy("Iniciando…");
    for (let i = 0; i < 40; i++) {
      const r = await step().catch(() => null);
      if (!r?.ok) { toast.error("A atualização falhou. Tente de novo."); break; }
      setBusy(r.done ? "Concluído" : `${r.category ?? "Categoria"} pronta · faltam ${r.remaining}`);
      if (r.done) { toast.success("Biblioteca atualizada."); break; }
    }
    setBusy(null); void s.refetch();
  }
  const run = s.data?.run;
  return <section className="lib-admin">
    <h2>Biblioteca de produtos validados</h2>
    <p>Atualiza sozinha todo dia às 06:00 (Brasília). {s.data ? `${s.data.validados} produtos validados no ar.` : ""}</p>
    {s.data && !s.data.shopeeConfigured && <p className="lib-admin-warn" role="status"><AlertTriangle aria-hidden="true" />Shopee pulada: faltam as credenciais da plataforma (SHOPEE_PLATFORM_APP_ID e SHOPEE_PLATFORM_SECRET).</p>}
    {run && <ul>
      <li>Última atualização: {new Date(run.iniciadoEm).toLocaleString("pt-BR")} {run.concluidoEm ? "· concluída" : `· em andamento (${run.feitas}/${run.total} categorias)`}</li>
      <li>Mercado Livre: {run.ml} · Shopee: {run.shopee} · Saíram do ar: {run.foraDoAr}</li>
      {run.avisos.map(a => <li key={a} className="lib-admin-warn"><AlertTriangle aria-hidden="true" />{a}</li>)}
    </ul>}
    <Button onClick={() => void refreshAll()} disabled={!!busy}><RefreshCw className={busy ? "animate-spin" : ""} />{busy ?? "Atualizar agora"}</Button>
  </section>;
}
