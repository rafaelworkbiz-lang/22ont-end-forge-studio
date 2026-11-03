import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, ExternalLink, Lock, LogOut, ArrowLeft, ClipboardPaste, AlertTriangle, Handshake, MousePointerClick, BadgeCheck, Hourglass, CalendarDays, Infinity as InfinityIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useAccount } from "@/components/auth-provider";
import { advanceStep, submitLinks, type MyOnboarding } from "@/lib/influencer-onboarding.functions";

type Ob = Extract<MyOnboarding, { isInfluencer: true }>;
const PASSOS = ["Criar conta na Applyfy", "Pedir afiliação", "Aguardar aprovação", "Onde pegar os links", "Colar links e código", "Aguardando aprovação"];

/** Passo atual (0–5) a partir do status do cadastro. */
function passoDoStatus(s: string): number {
  return ({ convidado: 0, recusado: 0, conta_applyfy: 1, afiliacao_pedida: 2, afiliacao_aprovada: 4, links_enviados: 5 } as Record<string, number>)[s] ?? 0;
}

export function InfluencerOnboarding({ ob }: { ob: Ob }) {
  const { signOut } = useAccount();
  const qc = useQueryClient();
  const maxPasso = passoDoStatus(ob.status);
  const travado = ob.status === "links_enviados";
  const voltar = <Button type="button" variant="ghost" className="onb-back" onClick={() => setPasso((p) => Math.max(0, p - 1))}><ArrowLeft /> Voltar</Button>;
  const [passo, setPasso] = useState(ob.status === "afiliacao_aprovada" ? 3 : maxPasso);
  const adv = useServerFn(advanceStep), send = useServerFn(submitLinks);
  const refresh = () => qc.invalidateQueries({ queryKey: ["onboarding"] });
  const step = useMutation({ mutationFn: (p: "conta" | "afiliacao") => adv({ data: { passo: p } }), onSuccess: async (_r, p) => { await refresh(); setPasso(p === "conta" ? 1 : 2); }, onError: (e: Error) => toast.error(e.message) });
  const [f, setF] = useState({ codigo: ob.codigo ?? "", mensal: ob.link_mensal ?? "", vitalicio: ob.link_vitalicio ?? "" });
  const links = useMutation({ mutationFn: () => send({ data: f }), onSuccess: async () => { toast.success("Links enviados para revisão"); await refresh(); setPasso(5); }, onError: (e: Error) => toast.error(e.message) });
  const ext = (href: string, label: string) => <Button asChild className="um-primary"><a href={href} target="_blank" rel="noopener noreferrer"><ExternalLink /> {label}</a></Button>;

  return <div className="onb v2-app">
    <Toaster />
    <header className="onb-top"><div className="auth-gate-wordmark">Afilia<span>Place</span></div><Button variant="ghost" onClick={() => void signOut()}><LogOut /> Sair</Button></header>
    <main className="onb-main">
      <p className="onb-kicker">Cadastro de influenciador</p>
      <h1>Conclua seu cadastro para liberar o painel</h1>
      {ob.gerente && <p className="onb-sub">Você faz parte do time de <b>{ob.gerente.nome}</b>.</p>}
      {ob.status === "recusado" && ob.motivo_recusa && <p className="onb-alert">Seu cadastro precisa de ajuste: {ob.motivo_recusa}</p>}
      <ol className="onb-steps">{PASSOS.map((t, i) => <li key={t}><button type="button" disabled={travado ? i !== 5 : i > maxPasso} className={i === passo ? "on" : i < maxPasso ? "done" : ""} onClick={() => setPasso(i)}>
        <span>{i < maxPasso ? <Check size={14} /> : (travado ? i !== 5 && i > maxPasso : i > maxPasso) ? <Lock size={12} /> : i + 1}</span>{t}</button></li>)}</ol>
      <section className="onb-card">
        {passo === 0 && <><h2>1. Crie sua conta na Applyfy</h2><p>A Applyfy é a plataforma que processa as vendas e paga sua comissão. Crie sua conta grátis e volte aqui.</p>
          <div className="onb-actions">{ext(ob.links.cadastro, "Abrir Applyfy")}<Button variant="outline" disabled={step.isPending} onClick={() => step.mutate("conta")}>Já criei minha conta</Button></div></>}
        {passo === 1 && <AfiliacaoPasso mensal={ob.gerente?.mensal && ob.gerente.vitalicio ? ob.gerente.mensal : ob.links.afiliacao_mensal} vitalicio={ob.gerente?.mensal && ob.gerente.vitalicio ? ob.gerente.vitalicio : ob.links.afiliacao_vitalicio} doGerente={!!(ob.gerente?.mensal && ob.gerente.vitalicio)} busy={step.isPending} onContinue={() => step.mutate("afiliacao")} back={voltar} />}
        {passo === 2 && <><h2>3. Aguardando aprovação</h2><p>Seu pedido está em análise na Applyfy. {ob.gerente ? "Seu gerente" : "A administração"} vai marcar aqui quando for aprovado. Volte mais tarde.</p>
          <div className="onb-actions">{voltar}<Button variant="outline" onClick={() => void refresh()}>Verificar de novo</Button></div></>}
        {passo === 3 && <><h2>4. Onde pegar seus links de venda</h2>
          <div className="onb-explain"><b>O que é o link de oferta?</b><p>É o seu link de venda pessoal na Applyfy. Toda pessoa que comprar por ele gera comissão para você. Você precisa de dois: um do plano Mensal e um do Vitalício.</p></div>
          <ol className="onb-howto">
            <li><span>1</span><div><b>Entre na Applyfy</b><p>Acesse app.applyfy.com.br com a conta que você criou.</p></div></li>
            <li><span>2</span><div><b>Abra Meus produtos › Afiliações</b><p>No menu da esquerda, clique em <b>Meus produtos</b> e depois em <b>Afiliações</b>.</p></div></li>
            <li><span>3</span><div><b>Entre em AfiliaPlace Mensal › Ofertas</b><p>Abra o produto e vá na aba <b>Ofertas</b>. Clique no botão de copiar ao lado do link.</p></div></li>
            <li><span>4</span><div><b>Repita no AfiliaPlace Vitalício</b><p>Faça o mesmo no produto Vitalício e copie o segundo link.</p></div></li>
          </ol>
          <div className="onb-explain"><b>Como o link se parece</b><code>https://checkout.applyfy.com.br/checkout/…?offer=…</code><p className="onb-warn"><AlertTriangle size={14} /> Não use o link da página inicial do AfiliaPlace. Ele precisa ser o seu.</p></div>
          <div className="onb-actions">{voltar}<Button className="um-primary" onClick={() => setPasso(4)}>Já copiei os dois links</Button></div></>}
        {passo === 4 && <LinksForm f={f} setF={(v) => { links.reset(); setF(v); }} pending={links.isPending} erro={links.error?.message ?? null} onSubmit={() => links.mutate()} back={voltar} />}
        {passo === 5 && <div className="onb-wait">
          <span className="onb-wait-ic"><Hourglass /></span>
          <h2>6. Aguardando aprovação</h2>
          <p>Recebemos seus links! Agora é só aguardar a aprovação: {ob.gerente ? <>seu gerente <b>{ob.gerente.nome}</b></> : "a administração"} vai conferir e liberar sua conta.</p>
          <div className="onb-actions"><Button className="um-primary" onClick={() => void refresh()}>Verificar aprovação</Button></div>
          <p className="onb-aff-hint">Esta tela confere sozinha a cada 30 segundos. Seus links já foram enviados e não podem mais ser alterados; se algo estiver errado, o cadastro será recusado e você poderá corrigir.</p>
        </div>}
      </section>
    </main>
  </div>;
}

function AfiliacaoPasso({ mensal, vitalicio, doGerente, busy, onContinue, back }: { back: ReactNode; mensal: string; vitalicio: string; doGerente: boolean; busy: boolean; onContinue: () => void }) {
  const { user } = useAccount(); const key = `onb-afiliacao-${(user?.email ?? "").toLowerCase()}`;
  const [feito, setFeito] = useState<{ mensal: boolean; vitalicio: boolean }>({ mensal: false, vitalicio: false });
  useEffect(() => { try { const v = JSON.parse(localStorage.getItem(key) ?? "{}"); setFeito({ mensal: !!v.mensal, vitalicio: !!v.vitalicio }); } catch { /* vazio */ } }, [key]);
  const marcar = (k: "mensal" | "vitalicio") => setFeito((f) => { const n = { ...f, [k]: true }; localStorage.setItem(key, JSON.stringify(n)); return n; });
  const ok = feito.mensal && feito.vitalicio;
  const card = (k: "mensal" | "vitalicio", titulo: string, desc: string, Icon: typeof CalendarDays, href: string) =>
    <article className={`onb-aff-card ${feito[k] ? "done" : ""}`}>
      <span className="onb-aff-ic"><Icon /></span>
      <h3>{titulo}</h3><p>{desc}</p>
      {feito[k] && <span className="onb-aff-ok"><Check size={14} /> Pedido aberto</span>}
      <Button asChild className={feito[k] ? "" : "um-primary"} variant={feito[k] ? "outline" : "default"}><a href={href} target="_blank" rel="noopener noreferrer" onClick={() => marcar(k)}><ExternalLink /> {feito[k] ? "Abrir de novo" : "Se afiliar"}</a></Button>
    </article>;
  return <div className="onb-aff">
    <div className="onb-aff-head"><span className="onb-aff-ic big"><Handshake /></span><div><h2>2. Peça afiliação ao AfiliaPlace</h2><p>{doGerente ? "Use os links do seu gerente para se afiliar debaixo do time dele." : "Peça afiliação aos dois produtos: Mensal e Vitalício."}</p></div></div>
    <div className="onb-aff-grid">
      {card("mensal", "Plano Mensal", "Produto de assinatura mensal do AfiliaPlace.", CalendarDays, mensal)}
      {card("vitalicio", "Plano Vitalício", "Produto de acesso vitalício do AfiliaPlace.", InfinityIcon, vitalicio)}
    </div>
    {!ok && <p className="onb-aff-hint">Clique em <b>se afiliar</b> nos dois planos para continuar.</p>}
    <div className="onb-actions">{back}<Button className="um-primary onb-aff-next" disabled={!ok || busy} onClick={onContinue}>{busy ? "Salvando…" : "Continuar"}</Button></div>
    <div className="cv-cards onb-aff-how">
      <article><MousePointerClick /><h3>Clique em se afiliar</h3><p>Abre a página do produto na Applyfy em uma nova aba.</p></article>
      <article><BadgeCheck /><h3>Confirme na Applyfy</h3><p>Dentro da Applyfy, clique em pedir afiliação. Faça isso nos dois planos.</p></article>
      <article><Hourglass /><h3>Aguarde a aprovação</h3><p>{doGerente ? "Seu gerente" : "A administração"} aprova e você recebe seus links de venda.</p></article>
    </div>
  </div>;
}

type LF = { codigo: string; mensal: string; vitalicio: string };
const linkErro = (v: string) => !v ? null : !/^https:\/\/checkout\.applyfy\.com\.br\//i.test(v.trim()) ? "Este não parece um link de checkout da Applyfy." : null;
function LinksForm({ f, setF, pending, erro, onSubmit, back }: { f: LF; setF: (v: LF) => void; pending: boolean; erro: string | null; onSubmit: () => void; back: ReactNode }) {
  const colar = async (k: "mensal" | "vitalicio") => { try { const t = await navigator.clipboard.readText(); setF({ ...f, [k]: t.trim() }); } catch { toast.error("Não foi possível colar. Use Ctrl+V no campo."); } };
  const iguais = !!f.mensal && f.mensal.trim() === f.vitalicio.trim();
  const campo = (k: "mensal" | "vitalicio", n: number, titulo: string, preco: string) => <div className="onb-field">
    <div className="onb-field-top"><span className="onb-field-n">{n}</span><div><b>{titulo} <em>{preco}</em></b><small>Cole aqui o link copiado da oferta do <b>{titulo.replace("Link ", "")}</b> na Applyfy.</small></div></div>
    <div className="onb-field-in"><input required type="url" value={f[k]} placeholder="https://checkout.applyfy.com.br/checkout/…" onChange={(e) => setF({ ...f, [k]: e.target.value })} /><Button type="button" variant="outline" onClick={() => void colar(k)}><ClipboardPaste /> Colar</Button></div>
    {linkErro(f[k]) && <small className="onb-warn"><AlertTriangle size={13} /> {linkErro(f[k])}</small>}
  </div>;
  return <form className="um-form onb-links" onSubmit={(e) => { e.preventDefault(); if (iguais) return; onSubmit(); }}>
    <h2>5. Cole seus links e escolha seu código</h2>
    <div className="onb-field">
      <div className="onb-field-top"><span className="onb-field-n">A</span><div><b>Seu código</b><small>É o final do endereço da sua página pessoal. Use 3 a 20 letras minúsculas, números ou hífen.</small></div></div>
      <input required value={f.codigo} placeholder="ex.: rafa" onChange={(e) => setF({ ...f, codigo: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} />
      <small>Sua página: <b>afiliaplace.site/{f.codigo || "seucodigo"}</b></small>
    </div>
    {campo("mensal", 1, "Link Mensal", "R$ 172,00")}
    {campo("vitalicio", 2, "Link Vitalício", "R$ 297,00")}
    {iguais && <p className="onb-alert">Os dois links estão iguais. O Mensal e o Vitalício precisam ser diferentes.</p>}
    <p className="onb-explain onb-warn"><AlertTriangle size={14} /> Depois de enviar, não dá para voltar. Confira os dois links antes.</p>
    {erro && <p className="onb-alert" role="alert">{erro}</p>}
    <div className="onb-actions">{back}<Button type="submit" className="um-primary" disabled={pending || iguais}>{pending ? "Enviando…" : "Enviar para revisão"}</Button></div>
  </form>;
}
