import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Camera, Eye, EyeOff, Megaphone, ShoppingCart, BadgePercent } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { validateInviteForm, FOTO_MAX_BYTES, type InviteForm } from "@/lib/invite-form";
import { Button } from "@/components/ui/button";
import { acceptInvite, getInvitePublic } from "@/lib/invite.functions";

export const Route = createFileRoute("/convite/$codigo")({
  loader: async ({ params }) => {
    const c = params.codigo.toLowerCase();
    if (!/^[a-z0-9]{6,16}$/.test(c)) return { invite: null, codigo: c };
    return { invite: await getInvitePublic({ data: { codigo: c } }), codigo: c };
  },
  head: () => ({ meta: [
    { title: "Convite para o time · AfiliaPlace" },
    { name: "description", content: "Você foi convidado para fazer parte de um time de influenciadores AfiliaPlace." },
    { property: "og:title", content: "Convite para o time · AfiliaPlace" },
    { property: "og:description", content: "Crie sua conta de influenciador e entre para o time." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: ConvitePage,
});

function ConvitePage() {
  const { invite, codigo } = Route.useLoaderData();
  const accept = useServerFn(acceptInvite);
  const navigate = useNavigate();
  const [f, setF] = useState<InviteForm>({ foto: "", nome: "", sobrenome: "", email: "", whatsapp: "", senha: "", senha2: "", termos: false });
  const [ver, setVer] = useState(false);
  const [state, setState] = useState<{ busy: boolean; erro: string | null }>({ busy: false, erro: null });
  const set = (p: Partial<InviteForm>) => setF((x) => ({ ...x, ...p }));

  function escolherFoto(file?: File) {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return setState({ busy: false, erro: "Use uma foto JPG, PNG ou WEBP." });
    if (file.size > FOTO_MAX_BYTES) return setState({ busy: false, erro: "A foto pode ter no máximo 2 MB." });
    const r = new FileReader(); r.onload = () => { set({ foto: String(r.result) }); setState({ busy: false, erro: null }); }; r.readAsDataURL(file);
  }

  const body = !invite ? <><h1>Convite não encontrado</h1><p>Confira o link com quem te convidou.</p></>
    : !invite.valido ? <><h1>Convite indisponível</h1><p>Este convite expirou, foi desativado ou atingiu o limite. Peça um novo link a {invite.gerente ?? "quem te convidou"}.</p></>
    : <>
      <p className="onb-kicker">Convite</p>
      <h1>{invite.gerente ? <>Você foi convidado por {invite.gerente}{invite.time ? ` para o time ${invite.time}` : ""}</> : "Convite da equipe AfiliaPlace"}</h1>
      {invite.mensagem && <p className="onb-sub">“{invite.mensagem}”</p>}
      <form className="um-form" onSubmit={async (e) => {
        e.preventDefault();
        const erro = validateInviteForm(f); if (erro) return setState({ busy: false, erro });
        setState({ busy: true, erro: null });
        try {
          const r = await accept({ data: { codigo, nome: f.nome, sobrenome: f.sobrenome, email: f.email, whatsapp: f.whatsapp, senha: f.senha, foto: f.foto, termos: true } });
          if (!r.ok) return setState({ busy: false, erro: r.erro });
          const { error } = await supabase.auth.signInWithPassword({ email: f.email.trim().toLowerCase(), password: f.senha });
          if (error) { void navigate({ to: "/auth" }); return; }
          void navigate({ to: "/painel" });
        } catch { setState({ busy: false, erro: "Confira os dados e tente novamente." }); }
      }}>
        <label className="cv-foto">
          <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => escolherFoto(e.target.files?.[0])} />
          <span className="cv-foto-circle">{f.foto ? <img src={f.foto} alt="Sua foto" /> : <Camera />}</span>
          <span>{f.foto ? "Trocar foto" : "Adicionar foto de perfil *"}</span>
        </label>
        <div className="cv-row">
          <label>Nome<input required minLength={2} maxLength={40} placeholder="Rafael" value={f.nome} onChange={(e) => set({ nome: e.target.value })} /></label>
          <label>Sobrenome<input required minLength={2} maxLength={40} placeholder="Mathias" value={f.sobrenome} onChange={(e) => set({ sobrenome: e.target.value })} /></label>
        </div>
        <label>Gmail<input required type="email" maxLength={255} placeholder="voce@gmail.com" value={f.email} onChange={(e) => set({ email: e.target.value })} /></label>
        <label>WhatsApp<input required inputMode="tel" placeholder="(11) 99999-9999" value={f.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} /></label>
        <div className="cv-row">
          <label>Senha<span className="cv-pass"><input required minLength={8} maxLength={72} type={ver ? "text" : "password"} value={f.senha} onChange={(e) => set({ senha: e.target.value })} /><button type="button" onClick={() => setVer(!ver)} aria-label="Mostrar senha">{ver ? <EyeOff size={16} /> : <Eye size={16} />}</button></span></label>
          <label>Confirmar senha<input required minLength={8} maxLength={72} type={ver ? "text" : "password"} value={f.senha2} onChange={(e) => set({ senha2: e.target.value })} /></label>
        </div>
        <label className="um-check"><input type="checkbox" required checked={f.termos} onChange={(e) => set({ termos: e.target.checked })} /> Li e aceito os <Link to="/termos" target="_blank">termos</Link> e a <Link to="/privacidade" target="_blank">privacidade</Link></label>
        {state.erro && <p className="onb-alert" role="alert">{state.erro}</p>}
        <Button type="submit" className="um-primary" disabled={state.busy}>{state.busy ? "Criando conta…" : "Criar minha conta"}</Button>
      </form>
    </>;

  return <div className="onb v2-app">
    <header className="onb-top"><Link to="/" className="auth-gate-wordmark">Afilia<span>Place</span></Link><Button asChild variant="ghost"><Link to="/auth">Já tenho conta</Link></Button></header>
    <main className="onb-main">
      <section className="onb-card">{body}</section>
      {invite?.valido && <section className="cv-how">
        <h2>Como funciona</h2>
        <div className="cv-cards">
          <article><Megaphone /><h3>Você divulga</h3><p>Compartilhe seus links de checkout dos planos Mensal e Vitalício nas suas redes.</p></article>
          <article><ShoppingCart /><h3>Alguém compra</h3><p>A Applyfy registra automaticamente a venda feita pelo seu link.</p></article>
          <article><BadgePercent /><h3>Você ganha %</h3><p>Comissão inicial de 50% por venda, podendo ser negociada com a administração. O pagamento é feito pela Applyfy.</p></article>
        </div>
      </section>}
    </main>
  </div>;
}
