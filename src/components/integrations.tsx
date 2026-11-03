import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { CheckCircle2, ExternalLink, Link2, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/components/auth-provider";
import { getPerfilState, saveAffiliateProfile } from "@/lib/perfil.functions";
import { getMeliAuthUrl, exchangeMeliCode, getMeliConnection, saveMeliTag, disconnectMeli } from "@/lib/meli-connect.functions";

const redirectUri = () => window.location.origin;
const AFFILIATE_SIGNUP = "https://www.mercadolivre.com.br/l/afiliados-home";

export function useMeliConnection() {
  const { user } = useAccount();
  const fetchConn = useServerFn(getMeliConnection);
  return useQuery({ queryKey: ["meli-connection", user?.id], queryFn: () => fetchConn(), enabled: !!user, staleTime: 15_000, refetchInterval: 15_000 });
}

/** Trata o retorno do Mercado Livre (?code=...&state=...) após o login. */
export function useMeliCallback(onDone: () => void) {
  const { user, ready } = useAccount();
  const exchange = useServerFn(exchangeMeliCode);
  const qc = useQueryClient();
  const ran = useRef(false);
  useEffect(() => {
    if (!ready || ran.current) return;
    const p = new URLSearchParams(window.location.search);
    const code = p.get("code"), state = p.get("state");
    if (!code) return;
    ran.current = true;
    window.history.replaceState({}, "", window.location.pathname);
    if (!user) { toast.error("Entre na sua conta para concluir a conexão."); return; }
    if (!state || state !== sessionStorage.getItem("meli-oauth-state")) { toast.error("Conexão expirada. Tente conectar de novo."); return; }
    sessionStorage.removeItem("meli-oauth-state");
    onDone();
    void exchange({ data: { code, redirectUri: redirectUri() } }).then(r => {
      if (r.ok) { toast.success("Conta do Mercado Livre conectada!"); void qc.invalidateQueries({ queryKey: ["meli-connection"] }); }
      else toast.error(r.error ?? "Não foi possível conectar.");
    });
  }, [ready, user, exchange, qc, onDone]);
}

export function Integrations() {
  const { user } = useAccount();
  const conn = useMeliConnection();
  const authUrl = useServerFn(getMeliAuthUrl);
  const save = useServerFn(saveMeliTag);
  const disconnect = useServerFn(disconnectMeli);
  const qc = useQueryClient();
  const [tag, setTag] = useState("");
  const [busy, setBusy] = useState(false);
  const fetchPerfil = useServerFn(getPerfilState);
  const saveProfile = useServerFn(saveAffiliateProfile);
  const perfil = useQuery({ queryKey: ["perfil-state", user?.id], queryFn: () => fetchPerfil(), enabled: !!user, staleTime: 60_000 });
  const [profileUrl, setProfileUrl] = useState("");
  useEffect(() => { setProfileUrl(perfil.data?.profileUrl ?? ""); }, [perfil.data?.profileUrl]);
  const tagConfirmed = !!perfil.data?.tagConfirmed;
  useEffect(() => { setTag(conn.data?.tag ?? ""); }, [conn.data?.tag]);
  const c = conn.data;

  async function connect() {
    setBusy(true);
    const state = crypto.randomUUID();
    sessionStorage.setItem("meli-oauth-state", state);
    const r = await authUrl({ data: { redirectUri: redirectUri(), state } }).catch(() => ({ url: null }));
    if (r.url) window.location.href = r.url; else { setBusy(false); toast.error("Integração indisponível no momento."); }
  }

  return <div className="integrations">
    <section className="page-heading"><div><h1>Integrações</h1><p>{c?.mode === 'admin' ? 'Acesso administrativo ao catálogo' : 'Conecte sua conta do Mercado Livre e confira sua tag de afiliado'}</p></div></section>
    <article className="integration-card">
      <div className="integration-head">
        <div className="integration-logo" aria-hidden>ML</div>
        <div><h2>Mercado Livre</h2><p>Programa de Afiliados</p></div>
        <span className={`integration-status ${c?.mode === 'admin' || c?.connected ? "on" : ""}`}>{c?.mode === 'admin' ? 'Acesso administrativo' : c?.connected ? 'Conectado' : 'Desconectado'}</span>
      </div>
      {!user ? <div className="integration-body"><p>Entre na sua conta AfiliaPlace para conectar o Mercado Livre.</p><Button asChild><Link to="/auth">Entrar</Link></Button></div>
        : conn.isLoading ? <div className="integration-body"><p>Carregando...</p></div>
        : conn.isError ? <div className="integration-body"><p>Não foi possível conferir seu acesso.</p><Button onClick={() => conn.refetch()}>Tentar novamente</Button></div>
        : c?.mode === 'admin' ? <div className="integration-body"><div className="integration-info"><div><span>Acesso</span><strong><CheckCircle2 />Administrativo</strong></div><div><span>Catálogo</span><strong>Liberado</strong></div></div><p>Não é necessário conectar uma conta pessoal para consultar os produtos.</p></div>
        : c?.connected ? <div className="integration-body">
          <div className="integration-info">
            <div><span>Conta</span><strong><CheckCircle2 />{c.nickname}</strong></div>
            <div><span>ID no Mercado Livre</span><strong>{c.meliUserId}</strong></div>
            <div><span>Conectado em</span><strong>{c.connectedAt ? new Date(c.connectedAt).toLocaleDateString("pt-BR") : "—"}</strong></div>
          </div>
          <label className="integration-tag">Sua tag de afiliado (aparece em todos os links)
            <div><input value={tag} onChange={e => setTag(e.target.value.replace(/[^\w.-]/g, ""))} placeholder="ex: suatag" />
              <Button disabled={busy || !tag || (tag === c.tag && tagConfirmed)} onClick={async () => { setBusy(true); const r = await save({ data: { tag } }); const r2 = r.ok ? await saveProfile({ data: { confirmTag: true } }) : r; setBusy(false); if (r.ok && r2.ok) { toast.success("Tag confirmada."); void qc.invalidateQueries({ queryKey: ["meli-connection"] }); void qc.invalidateQueries({ queryKey: ["perfil-state"] }); } else toast.error("Não foi possível salvar."); }}>{tag === c.tag && !tagConfirmed ? "Confirmar" : "Salvar"}</Button></div>
            {tagConfirmed ? <small><CheckCircle2 /> Tag confirmada por você.</small> : <small>Confirme sua tag para liberar o botão de copiar link nos produtos.</small>}
            <small>Confira a tag no painel de afiliados do Mercado Livre. A conexão não comprova atribuição de vendas ou pagamento de comissão.</small>
          </label>
          <label className="integration-tag">URL do meu perfil de afiliado no Mercado Livre (opcional)
            <div><input type="url" value={profileUrl} onChange={e => setProfileUrl(e.target.value)} placeholder="https://www.mercadolivre.com.br/..." />
              <Button disabled={busy || profileUrl === (perfil.data?.profileUrl ?? "")} onClick={async () => { setBusy(true); const r = await saveProfile({ data: { profileUrl: profileUrl.trim() } }).catch(() => ({ ok: false })); setBusy(false); if (r.ok) { toast.success("Perfil salvo."); void qc.invalidateQueries({ queryKey: ["perfil-state"] }); } else toast.error("Use um endereço do mercadolivre.com.br."); }}>Salvar</Button></div>
            <small>Usado para o botão “Ver meu perfil” depois de publicar um produto.</small>
          </label>
          <div className="integration-actions"><Button variant="outline" onClick={connect} disabled={busy}><Link2 />Reconectar</Button>
            <Button variant="ghost" disabled={busy} onClick={async () => { await disconnect(); toast.success("Conta desconectada."); void qc.invalidateQueries({ queryKey: ["meli-connection"] }); }}><Unplug />Desconectar</Button></div>
        </div>
        : <div className="integration-body">
          <ol className="integration-steps">
            <li><strong>Ative sua conta de afiliado</strong><span>Cadastre-se na Central de Afiliados do Mercado Livre. É rápido e gratuito.</span>
              <Button variant="outline" asChild><a href={AFFILIATE_SIGNUP} target="_blank" rel="noopener noreferrer"><ExternalLink />Cadastrar na Central de Afiliados</a></Button></li>
            <li><strong>Conecte sua conta</strong><span>Autorize a AfiliaPlace com a mesma conta do Mercado Livre.</span>
              <Button onClick={connect} disabled={busy}><Link2 />{busy ? "Abrindo..." : "Conectar com Mercado Livre"}</Button></li>
            <li><strong>Confirme sua tag</strong><span>Depois de conectar, confira a tag de afiliado que aparece nos seus links.</span></li>
          </ol>
          <small>O Mercado Livre não informa automaticamente se a conta já é afiliada; confirme o cadastro na Central de Afiliados.</small>
        </div>}
    </article>
  </div>;
}
