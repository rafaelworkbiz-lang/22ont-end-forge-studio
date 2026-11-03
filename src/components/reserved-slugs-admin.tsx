import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addReserved, listReserved, removeReserved } from "@/lib/store-publish.functions";

export function ReservedSlugsAdmin() {
  const list = useServerFn(listReserved); const add = useServerFn(addReserved); const rm = useServerFn(removeReserved);
  const q = useQuery({ queryKey: ["reserved-slugs"], queryFn: () => list() });
  const [t, setT] = useState("");
  const submit = async () => {
    const termo = t.trim().toLowerCase(); if (!/^[a-z0-9-]{1,40}$/.test(termo)) { toast.error("Use letras minúsculas, números e hífens."); return; }
    const r = await add({ data: { termo } }).catch(() => null); if (r?.ok) { setT(""); void q.refetch(); } else toast.error("Não foi possível incluir.");
  };
  return <section className="v2-card pub-sec"><h2>Endereços reservados</h2>
    <p className="pub-hint">Ninguém pode usar estes termos como endereço de loja (termos do sistema e marcas).</p>
    <form className="pub-res-form" onSubmit={e => { e.preventDefault(); void submit(); }}><input value={t} onChange={e => setT(e.target.value)} placeholder="ex.: amazon" maxLength={40} aria-label="Novo termo reservado" /><Button type="submit">Incluir</Button></form>
    <ul className="pub-res">{(q.data?.termos ?? []).map(x => <li key={x}>{x}<button type="button" aria-label={`Remover ${x}`} onClick={async () => { await rm({ data: { termo: x } }); void q.refetch(); }}><X /></button></li>)}</ul>
  </section>;
}
