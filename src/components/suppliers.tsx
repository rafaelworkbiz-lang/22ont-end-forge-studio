import { useEffect, useId, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, ChevronDown, Circle, ExternalLink, Eye, EyeOff, Lightbulb, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAccount } from "@/components/auth-provider";
import { useMeliConnection } from "@/components/integrations";
import { useJanela } from "@/components/janela";
import { disconnectMeli } from "@/lib/meli-connect.functions";
import { getPerfilState, saveAffiliateProfile } from "@/lib/perfil.functions";
import { getShopeeStatus, testShopee, disconnectShopee, suggestSupplier } from "@/lib/shopee.functions";
import mlLogo from "@/assets/fornecedor-mercadolivre.png.asset.json";
import shopeeLogo from "@/assets/fornecedor-shopee.png.asset.json";

const SHOPEE_HELP = "https://affiliate.shopee.com.br/open_api";
const fmt = (iso: string | null) => iso ? new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

type Tone = "ok" | "pending" | "error";
function StatusBadge({ tone, children }: { tone: Tone; children: ReactNode }) {
  const Icon = tone === "ok" ? CheckCircle2 : tone === "error" ? XCircle : Circle;
  return <span className={`v2-sstatus v2-sstatus-${tone}`}><Icon aria-hidden="true" />{children}</span>;
}

function Confirm({ open, onOpenChange, title, text, action, onConfirm }: { open: boolean; onOpenChange: (v: boolean) => void; title: string; text: string; action: string; onConfirm: () => void }) {
  return <AlertDialog open={open} onOpenChange={onOpenChange}><AlertDialogContent>
    <AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{text}</AlertDialogDescription></AlertDialogHeader>
    <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={onConfirm}>{action}</AlertDialogAction></AlertDialogFooter>
  </AlertDialogContent></AlertDialog>;
}

export function useShopeeStatus() {
  const { user } = useAccount();
  const fetchStatus = useServerFn(getShopeeStatus);
  return useQuery({ queryKey: ["shopee-status", user?.id], queryFn: () => fetchStatus(), enabled: !!user, staleTime: 30_000 });
}

export function MeliSupplierCard() {
  const { user } = useAccount();
  const conn = useMeliConnection();
  const fetchPerfil = useServerFn(getPerfilState);
  const perfil = useQuery({ queryKey: ["perfil-state", user?.id], queryFn: () => fetchPerfil(), enabled: !!user, staleTime: 60_000 });
  const disconnect = useServerFn(disconnectMeli);
  const saveProfile = useServerFn(saveAffiliateProfile);
  const qc = useQueryClient();
  const { abrir } = useJanela();
  const [confirmOff, setConfirmOff] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [busy, setBusy] = useState(false);
  const c = conn.data; const p = perfil.data;
  const connected = !!c?.connected;
  const tone: Tone = conn.isError ? "error" : connected ? "ok" : "pending";

  async function reconfirmTag() {
    setBusy(true); const r = await saveProfile({ data: { confirmTag: true } }).catch(() => ({ ok: false })); setBusy(false);
    if (r.ok) { toast.success("Tag confirmada."); void qc.invalidateQueries({ queryKey: ["perfil-state"] }); } else toast.error("Sua conexão não tem uma tag válida para confirmar.");
  }

  return <article className="v2-card v2-scard" aria-busy={conn.isLoading}>
    <div className="v2-supplier-head"><img src={mlLogo.url} alt="" width={64} height={64} /><div><h2>Mercado Livre</h2><p>Programa de Afiliados e Criadores</p></div>
      <StatusBadge tone={tone}>{tone === "ok" ? "Conectado" : tone === "error" ? "Erro" : "Pendente"}</StatusBadge></div>
    {conn.isLoading ? <Skeleton className="h-28 w-full" /> : <>
      <dl className="v2-sblocks">
        <div><dt>Conta</dt><dd>{connected ? c!.nickname : "—"}</dd></div>
        <div><dt>Tag de afiliado</dt><dd>{connected && c!.tag ? c!.tag : "—"}{connected && <small className={p?.tagConfirmed ? "ok" : ""}>{p?.tagConfirmed ? <><CheckCircle2 aria-hidden="true" />Confirmada</> : <><AlertCircle aria-hidden="true" />Não confirmada</>}</small>}</dd></div>
        <div><dt>Produtos em Meus produtos</dt><dd>—</dd></div>
        <div><dt>Perfil de afiliado</dt><dd>{p?.profileUrl ? <a href={p.profileUrl} target="_blank" rel="noopener noreferrer">Ver perfil <ExternalLink aria-hidden="true" /></a> : "—"}</dd></div>
      </dl>
      <div className="v2-sactions">
        {connected ? <Button asChild><Link to="/painel/produtos">Ver produtos validados</Link></Button>
          : <Button onClick={() => abrir("fornecedor", { f: "ml" })}>Usar esse fornecedor</Button>}
        {connected && <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" disabled={busy}>Gerenciar conexão<ChevronDown /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={reconfirmTag}>Reconfirmar tag</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setEditProfile(true)}>Editar link do perfil</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setConfirmOff(true)} className="text-destructive">Desconectar</DropdownMenuItem>
          </DropdownMenuContent></DropdownMenu>}
      </div>
    </>}
    <Confirm open={confirmOff} onOpenChange={setConfirmOff} title="Desconectar Mercado Livre?" text="Seus links deixarão de usar sua tag até você conectar de novo." action="Desconectar"
      onConfirm={async () => { await disconnect(); toast.success("Conta desconectada."); void qc.invalidateQueries({ queryKey: ["meli-connection"] }); }} />
    <ProfileDialog open={editProfile} onOpenChange={setEditProfile} current={p?.profileUrl ?? ""} />
  </article>;
}

function ProfileDialog({ open, onOpenChange, current }: { open: boolean; onOpenChange: (v: boolean) => void; current: string }) {
  const save = useServerFn(saveAffiliateProfile); const qc = useQueryClient();
  const [url, setUrl] = useState(current); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const id = useId();
  useEffect(() => { if (open) { setUrl(current); setErr(""); } }, [open, current]);
  const valid = (v: string) => v === "" || /^https:\/\/([a-z0-9-]+\.)*mercadolivre\.com\.br\//i.test(v);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent>
    <DialogHeader><DialogTitle>Link do perfil de afiliado</DialogTitle><DialogDescription>Usado no botão "Ver meu perfil" depois de publicar.</DialogDescription></DialogHeader>
    <div className="v2-field"><label htmlFor={id}>URL do perfil</label>
      <input id={id} type="url" value={url} onChange={e => setUrl(e.target.value)} onBlur={() => setErr(valid(url.trim()) ? "" : "Use um endereço do mercadolivre.com.br.")} aria-invalid={!!err} aria-describedby={err ? `${id}-e` : undefined} placeholder="https://www.mercadolivre.com.br/..." />
      {err && <p id={`${id}-e`} className="v2-field-error">{err}</p>}</div>
    <div className="v2-sactions"><Button disabled={busy || !!err} onClick={async () => { if (!valid(url.trim())) { setErr("Use um endereço do mercadolivre.com.br."); return; } setBusy(true); const r = await save({ data: { profileUrl: url.trim() } }).catch(() => ({ ok: false })); setBusy(false); if (r.ok) { toast.success("Perfil salvo."); void qc.invalidateQueries({ queryKey: ["perfil-state"] }); onOpenChange(false); } else setErr("Não foi possível salvar. Tente de novo."); }}>{busy && <Loader2 className="animate-spin" />}Salvar</Button></div>
  </DialogContent></Dialog>;
}

export function ShopeeSupplierCard() {
  const { isAdmin } = useAccount();
  if (!isAdmin) return <article className="v2-card v2-scard">
    <div className="v2-supplier-head"><img src={shopeeLogo.url} alt="" width={64} height={64} /><div><h2>Shopee</h2><p>Programa de Afiliados Shopee</p></div></div>
    <div className="v2-sactions"><Button onClick={() => {}}>Usar esse fornecedor</Button></div>
  </article>;
  return <ShopeeAdminCard />;
}

function ShopeeAdminCard() {
  const status = useShopeeStatus();
  const test = useServerFn(testShopee); const disconnect = useServerFn(disconnectShopee);
  const qc = useQueryClient();
  const [appId, setAppId] = useState(""); const [secret, setSecret] = useState(""); const [show, setShow] = useState(false);
  const [errs, setErrs] = useState<{ appId?: string | undefined; secret?: string | undefined; form?: string | undefined }>({});
  const [busy, setBusy] = useState(false); const [confirmOff, setConfirmOff] = useState(false);
  const { abrir } = useJanela();
  const s = status.data; const id = useId();
  const tone: Tone = s?.connected ? "ok" : s?.status === "erro" || errs.form ? "error" : "pending";
  const vApp = (v: string) => /^\d{4,20}$/.test(v.trim()) ? undefined : "Informe o App ID (somente números).";
  const vSec = (v: string) => v.trim().length >= 8 ? undefined : "Cole o Secret completo da Open API.";
  const refresh = () => qc.invalidateQueries({ queryKey: ["shopee-status"] });

  async function run(withCreds: boolean) {
    if (withCreds) { const e = { appId: vApp(appId), secret: vSec(secret) }; setErrs(e); if (e.appId || e.secret) return; }
    setBusy(true); setErrs({});
    const r = await test({ data: withCreds ? { appId: appId.trim(), secret: secret.trim() } : {} }).catch(() => ({ ok: false as const, error: "Falha de conexão. Verifique sua internet e tente de novo." }));
    setBusy(false);
    if (r.ok) { setSecret(""); setAppId(""); toast.success("Shopee conectada."); } else setErrs({ form: r.error });
    void refresh();
  }

  return <article className="v2-card v2-scard" aria-busy={busy || status.isLoading}>
    <div className="v2-supplier-head"><img src={shopeeLogo.url} alt="" width={64} height={64} /><div><h2>Shopee</h2><p>Programa de Afiliados Shopee</p></div>
      <StatusBadge tone={tone}>{tone === "ok" ? "Conectado" : tone === "error" ? "Erro" : "Não conectado"}</StatusBadge></div>
    {status.isLoading ? <Skeleton className="h-28 w-full" />
    : busy ? <div className="v2-sverify" role="status"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-2/3" /><p><Loader2 className="animate-spin" aria-hidden="true" />Verificando credenciais com a Shopee…</p></div>
    : s?.connected ? <>
      <p className="v2-sok" role="status"><CheckCircle2 aria-hidden="true" />Shopee conectada.</p>
      <dl className="v2-sblocks"><div><dt>App ID</dt><dd className="tabular-nums">{s.appIdMasked}</dd></div><div><dt>Último teste</dt><dd>{fmt(s.lastTestAt)}</dd></div></dl>
      {errs.form && <p className="v2-field-error" role="alert">{errs.form}</p>}
      <div className="v2-sactions"><Button onClick={() => run(false)}>Testar de novo</Button><Button variant="outline" onClick={() => setConfirmOff(true)}>Desconectar</Button></div>
    </> : <>
      <div className="v2-snote"><Lightbulb aria-hidden="true" /><p>Você precisa estar aprovado no programa de afiliados da Shopee. As credenciais ficam no portal de afiliados, em Open API. <a href={SHOPEE_HELP} target="_blank" rel="noopener noreferrer">Como encontrar ↗</a></p></div>
      {s?.status === "erro" && s.lastError && !errs.form && <p className="v2-field-error">Último teste falhou: {s.lastError}</p>}
      <div className="v2-field"><label htmlFor={`${id}-a`}>App ID</label>
        <input id={`${id}-a`} inputMode="numeric" autoComplete="off" value={appId} onChange={e => setAppId(e.target.value)} onBlur={() => appId && setErrs(x => ({ ...x, appId: vApp(appId) }))} aria-invalid={!!errs.appId} aria-describedby={errs.appId ? `${id}-ae` : undefined} placeholder="ex.: 18300000092" />
        {errs.appId && <p id={`${id}-ae`} className="v2-field-error">{errs.appId}</p>}</div>
      <div className="v2-field"><label htmlFor={`${id}-s`}>Secret</label>
        <div className="v2-field-row"><input id={`${id}-s`} type={show ? "text" : "password"} autoComplete="off" value={secret} onChange={e => setSecret(e.target.value)} onBlur={() => secret && setErrs(x => ({ ...x, secret: vSec(secret) }))} aria-invalid={!!errs.secret || !!errs.form} aria-describedby={`${id}-sh${errs.secret ? ` ${id}-se` : ""}${errs.form ? ` ${id}-fe` : ""}`} />
          <Button type="button" variant="outline" onClick={() => setShow(v => !v)} aria-pressed={show}>{show ? <EyeOff /> : <Eye />}{show ? "Ocultar" : "Mostrar"}</Button></div>
        <small id={`${id}-sh`}>Guardado criptografado. Nunca aparece de novo depois de salvo.</small>
        {errs.secret && <p id={`${id}-se`} className="v2-field-error">{errs.secret}</p>}
        {errs.form && <p id={`${id}-fe`} className="v2-field-error" role="alert">{errs.form}</p>}</div>
      <div className="v2-sactions"><Button onClick={() => run(true)}>{errs.form ? "Tentar de novo" : "Testar e conectar"}</Button>
        <Button variant="outline" onClick={() => abrir("fornecedor", { f: "shopee" })}>Usar esse fornecedor</Button></div>
    </>}
    <Confirm open={confirmOff} onOpenChange={setConfirmOff} title="Desconectar Shopee?" text="Os produtos da Shopee deixarão de aparecer nas suas lojas." action="Desconectar"
      onConfirm={async () => { const r = await disconnect(); if (r.ok) toast.success("Shopee desconectada."); else toast.error("Não foi possível desconectar."); void refresh(); }} />
  </article>;
}

export function SuggestSupplierCard() {
  const suggest = useServerFn(suggestSupplier);
  const [open, setOpen] = useState(false); const [nome, setNome] = useState(""); const [site, setSite] = useState(""); const [obs, setObs] = useState("");
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const id = useId();
  return <article className="v2-card v2-scard v2-ssoon">
    <h2>Novos fornecedores em breve</h2><p>Estamos preparando mais marketplaces. Conte qual você quer ver aqui.</p>
    <div className="v2-sactions"><Button onClick={() => setOpen(true)}>Sugerir fornecedor</Button></div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent>
      <DialogHeader><DialogTitle>Sugerir fornecedor</DialogTitle><DialogDescription>Sua sugestão chega direto para a equipe AfiliaPlace.</DialogDescription></DialogHeader>
      <form className="v2-sform" onSubmit={async e => { e.preventDefault(); if (nome.trim().length < 2) { setErr("Informe o nome do fornecedor."); return; } setBusy(true); const r = await suggest({ data: { nome: nome.trim(), site: site.trim() || undefined, observacao: obs.trim() || undefined } }).catch(() => ({ ok: false })); setBusy(false); if (r.ok) { toast.success("Obrigado pela sugestão!"); setOpen(false); setNome(""); setSite(""); setObs(""); } else setErr("Não foi possível enviar. Tente de novo."); }}>
        <div className="v2-field"><label htmlFor={`${id}-n`}>Nome do fornecedor</label><input id={`${id}-n`} value={nome} maxLength={80} onChange={e => setNome(e.target.value)} onBlur={() => setErr(nome.trim().length < 2 ? "Informe o nome do fornecedor." : "")} aria-invalid={!!err} aria-describedby={err ? `${id}-ne` : undefined} />{err && <p id={`${id}-ne`} className="v2-field-error">{err}</p>}</div>
        <div className="v2-field"><label htmlFor={`${id}-w`}>Site (opcional)</label><input id={`${id}-w`} value={site} maxLength={200} onChange={e => setSite(e.target.value)} /></div>
        <div className="v2-field"><label htmlFor={`${id}-o`}>Observação (opcional)</label><textarea id={`${id}-o`} value={obs} maxLength={500} rows={3} onChange={e => setObs(e.target.value)} /></div>
        <div className="v2-sactions"><Button type="submit" disabled={busy}>{busy && <Loader2 className="animate-spin" />}Enviar sugestão</Button></div>
      </form>
    </DialogContent></Dialog>
  </article>;
}
