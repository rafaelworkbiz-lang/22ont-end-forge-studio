import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addMarca, getIaAdmin, removeMarca, setIaLimite, setIaModelo } from "@/lib/store-ai.functions";

export function IaAdmin() {
  const get = useServerFn(getIaAdmin); const setLim = useServerFn(setIaLimite); const add = useServerFn(addMarca); const rm = useServerFn(removeMarca); const setMod = useServerFn(setIaModelo); const [modelo, setModelo] = useState<string | null>(null);
  const q = useQuery({ queryKey: ["ia-admin"], queryFn: () => get() });
  const [termo, setTermo] = useState(""); const [lim, setLimState] = useState<Record<string, string>>({});
  const d = q.data;
  return <div className="ia-admin">
    <section className="v2-card pub-sec"><h2>Modelo de imagem (OpenAI)</h2>
      <p className="pub-hint">{d?.temChave === false ? "A conexão com o GPT do Lovable ainda não está pronta: as gerações vão falhar (e não contam no limite)." : `Gerações usam o GPT de imagens do Lovable (${d?.modelo ?? ""}); o custo sai dos créditos de IA do espaço.`}</p>
      {d && <p className="pub-hint">Custo neste mês (texto + imagem): US$ {d.custoMes.toFixed(2)} · média por geração US$ {d.custoMedioGeracao.toFixed(3)} · média por loja US$ {d.custoMedioLoja.toFixed(2)}</p>}
      <form className="pub-res-form" onSubmit={async e => { e.preventDefault(); const v = (modelo ?? d?.modelo ?? "").trim(); const r = await setMod({ data: { modelo: v } }).catch(() => null); if (r?.ok) { toast.success("Modelo salvo."); void q.refetch(); } else toast.error("Nome de modelo inválido."); }}>
        <input value={modelo ?? d?.modelo ?? ""} onChange={e => setModelo(e.target.value)} aria-label="Modelo de imagem" placeholder="gpt-image-1" maxLength={42} /><Button type="submit">Salvar</Button></form></section>
    <section className="v2-card pub-sec"><h2>Limite mensal de gerações</h2><p className="pub-hint">1 geração = 1 clique em gerar. Bloqueios e falhas não contam.</p>
      <div className="ia-lims">{(d?.config ?? []).map(c => <form key={c.plano} className="pub-res-form" onSubmit={async e => { e.preventDefault(); const v = Number(lim[c.plano] ?? c.limite_mensal); const r = await setLim({ data: { plano: c.plano as "mensal", limite: v } }).catch(() => null); if (r?.ok) { toast.success("Limite salvo."); void q.refetch(); } else toast.error("Não foi possível salvar."); }}>
        <label>{c.plano === "mensal" ? "Mensal" : "Vitalício"} <input type="number" min={0} max={1000} value={lim[c.plano] ?? c.limite_mensal} onChange={e => setLimState(s => ({ ...s, [c.plano]: e.target.value }))} aria-label={`Limite ${c.plano}`} /></label><Button type="submit">Salvar</Button></form>)}</div></section>
    <section className="v2-card pub-sec"><h2>Gerações deste mês</h2>
      {!d?.uso.length ? <p className="pub-hint">Nenhuma geração ainda.</p> : <table className="ia-table"><thead><tr><th>Usuário</th><th>Concluídas</th><th>Falhas</th><th>Bloqueadas</th></tr></thead><tbody>{d.uso.map(u => <tr key={u.email}><td>{u.email}</td><td>{u.ok}</td><td>{u.erro}</td><td>{u.bloqueado}</td></tr>)}</tbody></table>}</section>
    <section className="v2-card pub-sec"><h2>Bloqueios recentes</h2>
      {!d?.bloqueios.length ? <p className="pub-hint">Nenhum bloqueio.</p> : <ul className="ia-bloq">{d.bloqueios.map((b, i) => <li key={i}><strong>{b.motivo}</strong> · {b.tipo} · {b.email} · {new Date(b.criadoEm).toLocaleString("pt-BR")}{b.descricao ? ` — “${b.descricao}”` : ""}</li>)}</ul>}</section>
    <section className="v2-card pub-sec"><h2>Marcas e nomes bloqueados</h2><p className="pub-hint">Pedidos de logo ou banner com estes termos no nome, nicho ou descrição são recusados.</p>
      <form className="pub-res-form" onSubmit={async e => { e.preventDefault(); const t = termo.trim().toLowerCase(); if (t.length < 2) return; const r = await add({ data: { termo: t } }).catch(() => null); if (r?.ok) { setTermo(""); void q.refetch(); } else toast.error("Não foi possível incluir."); }}>
        <input value={termo} onChange={e => setTermo(e.target.value)} placeholder="ex.: nome de uma marca" maxLength={60} aria-label="Novo termo bloqueado" /><Button type="submit">Incluir</Button></form>
      <ul className="pub-res">{(d?.marcas ?? []).map(x => <li key={x}>{x}<button type="button" aria-label={`Remover ${x}`} onClick={async () => { await rm({ data: { termo: x } }); void q.refetch(); }}><X /></button></li>)}</ul></section>
  </div>;
}
