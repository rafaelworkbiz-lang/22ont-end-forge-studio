import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/components/auth-provider";

function authError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/invalid login credentials/i.test(message)) return "E-mail ou senha incorretos. Tente novamente.";
  if (/email not confirmed/i.test(message)) return "Confirme seu e-mail antes de entrar. Confira também a caixa de spam.";
  if (/already registered/i.test(message)) return "Este e-mail já tem uma conta. Entre ou recupere sua senha.";
  if (/rate limit|too many|after .*seconds/i.test(message)) return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  if (/password/i.test(message)) return "A senha não atende aos requisitos de segurança. Use uma senha mais forte.";
  return "Não foi possível concluir agora. Confira sua conexão e tente novamente.";
}

export function AuthFrame({ children }: { children: ReactNode }) {
  return <div className="saas-theme auth-page">
    <header className="auth-header"><Link to="/" className="saas-logo auth-wordmark">Afilia<span>Place</span></Link><span className="auth-header-note"><LockKeyhole size={13} /> Acesso seguro</span></header>
    <main className="auth-main"><div className="auth-content">{children}</div></main>
    <footer className="auth-footer"><span>AfiliaPlace</span><span>Feito para conectar oportunidades.</span></footer>
  </div>;
}

export function PasswordField({ id, label, value, onChange, autoComplete = "current-password" }: { id: string; label: string; value: string; onChange: (value: string) => void; autoComplete?: string }) {
  const [visible, setVisible] = useState(false);
  return <label className="auth-field" htmlFor={id}><span>{label}</span><div className="auth-input"><LockKeyhole size={17} /><input id={id} type={visible ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)} autoComplete={autoComplete} required minLength={8} maxLength={128} placeholder="Sua senha" /><Button type="button" variant="ghost" size="icon" aria-label={visible ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`} title={visible ? "Ocultar senha" : "Mostrar senha"} onClick={() => setVisible(!visible)}>{visible ? <EyeOff /> : <Eye />}</Button></div></label>;
}

export function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [first, setFirst] = useState(false);
  const { user, ready } = useAccount();
  const navigate = useNavigate();
  useEffect(() => { if (ready && user) void navigate({ to: "/painel", replace: true }); }, [ready, user, navigate]);

  function changeMode(next: typeof mode, firstAccess = false) { setFirst(firstAccess); setMode(next); setError(""); setSent(false); setPassword(""); setConfirm(""); }
  async function submit(e: FormEvent) {
    e.preventDefault(); setError("");
    if (mode === "signup" && password !== confirm) { setError("As senhas não coincidem."); return; }
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setSent(true);
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: `${window.location.origin}/auth` } });
        if (error) throw error;
        setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        const { data, error: identityError } = await supabase.auth.getUser();
        if (identityError || !data.user) throw identityError ?? new Error("Unable to validate identity");
        await navigate({ to: "/painel", replace: true });
      }
    } catch (e) { setError(authError(e)); } finally { setBusy(false); }
  }
  return <AuthFrame>
    <div className="auth-intro"><div className="auth-mascot" role="img" aria-label="Canarinho AfiliaPlace" /><p className="auth-eyebrow">SEU PRÓXIMO PASSO COMEÇA AQUI</p><h1>{sent ? "Confira seu e-mail" : mode === "signup" ? "Faça parte da AfiliaPlace" : mode === "forgot" ? (first ? "Crie sua senha de acesso" : "Vamos recuperar seu acesso") : "Bom ter você de volta."}</h1><p>{sent ? "Falta só mais um passo para continuar." : mode === "signup" ? "Novas oportunidades, a partir da sua conta." : mode === "forgot" ? (first ? "Use o e-mail da compra para receber o link e escolher sua senha." : "Receba um link para criar uma nova senha.") : "Entre na sua conta e siga de onde parou."}</p></div>
    {sent ? <div className="auth-sent"><span className="auth-success-icon"><Check /></span><p>{mode === "forgot" ? "Se houver uma conta com este e-mail, você receberá um link para redefinir sua senha." : "Enviamos as instruções para confirmar seu cadastro. Se você já tem uma conta, entre com sua senha."}</p>{mode === "signup" && <div className="auth-plan-notice" role="status"><b>Você ainda não tem um plano ativo</b><p>Para acessar o painel, assine um plano usando este mesmo e-mail.</p><div><Button asChild size="sm"><a href="https://checkout.applyfy.com.br/checkout/cmv5qan5c116601pyslk4840p?offer=OBULDYP" target="_blank" rel="noopener noreferrer">Mensal R$ 172,00</a></Button><Button asChild size="sm" variant="outline"><a href="https://checkout.applyfy.com.br/checkout/cmv670zs13ndi01ps8gm04bsh?offer=B0QAGV6" target="_blank" rel="noopener noreferrer">Vitalício R$ 297,00</a></Button></div></div>}<small>Confira sua caixa de entrada e a pasta de spam.</small><Button variant="outline" onClick={() => changeMode("login")}><ArrowLeft /> Voltar para entrar</Button></div> : <>
            <form className="auth-form" onSubmit={submit}>
        <fieldset disabled={busy}><label className="auth-field" htmlFor="auth-email"><span>E-mail</span><div className="auth-input"><Mail size={17} /><input id="auth-email" type="email" autoComplete="email" required maxLength={254} placeholder="voce@exemplo.com" value={email} onChange={e => setEmail(e.target.value)} /></div></label>
        {mode !== "forgot" && <PasswordField id="auth-password" label="Senha" value={password} onChange={setPassword} autoComplete={mode === "signup" ? "new-password" : "current-password"} />}
        {mode === "signup" && <><small className="auth-password-hint">Use pelo menos 8 caracteres.</small><PasswordField id="auth-confirm" label="Confirmar senha" value={confirm} onChange={setConfirm} autoComplete="new-password" /></>}
        </fieldset>
        {mode === "login" && <div className="auth-forgot-row"><Button type="button" variant="link" className="auth-forgot" disabled={busy} onClick={() => changeMode("forgot")}>Esqueci minha senha</Button></div>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        <Button type="submit" className="auth-submit" disabled={busy}>{busy ? <><LoaderCircle className="refresh-spin" /> Aguarde...</> : <>{mode === "signup" ? "Criar minha conta" : mode === "forgot" ? (first ? "Enviar link para criar senha" : "Enviar link de recuperação") : "Entrar na minha conta"}<ArrowRight /></>}</Button>
      </form>
      {mode === "forgot" ? <Button variant="ghost" className="auth-back" disabled={busy} onClick={() => changeMode("login")}><ArrowLeft /> Voltar para entrar</Button> : <p className="auth-bottom">Ainda não é assinante? <a href="/#planos">Ver planos</a></p>}
    </>}
  </AuthFrame>;
}

export function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [validRecovery, setValidRecovery] = useState(false);
  const [checked, setChecked] = useState(false);
  const { signOut } = useAccount();
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const marker = window.sessionStorage.getItem("afiliasplace-recovery");
    const fromRecovery = hash.get("type") === "recovery";
    if (fromRecovery) window.sessionStorage.setItem("afiliasplace-recovery", String(Date.now()));
    const recent = marker !== null && Date.now() - Number(marker) < 30 * 60 * 1000;
    let alive = true;
    void supabase.auth.getUser().then(({ data, error }) => {
      if (alive) { setValidRecovery((fromRecovery || recent) && !error && !!data.user); setChecked(true); }
    });
    return () => { alive = false; };
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault(); setError("");
    if (!validRecovery) return;
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      window.sessionStorage.removeItem("afiliasplace-recovery"); setDone(true);
    } catch (e) { setError(authError(e)); } finally { setBusy(false); }
  }
  return <AuthFrame><div className="auth-intro"><div className="auth-mascot" role="img" aria-label="Canarinho AfiliaPlace" /><p className="auth-eyebrow">UM NOVO COMEÇO</p><h1>{done ? "Senha atualizada." : "Crie sua nova senha"}</h1><p>{done ? "Seu acesso está pronto novamente." : "Escolha uma senha segura para sua conta."}</p></div>
    {!checked ? <p className="auth-status"><LoaderCircle className="refresh-spin" /> Conferindo seu link...</p> : done ? <Button className="auth-submit" onClick={async () => { try { await signOut(); } catch (e) { setError(authError(e)); } }}>Voltar para entrar <ArrowRight /></Button> : !validRecovery ? <div className="auth-sent"><p>Este link é inválido ou expirou. Solicite um novo link de recuperação.</p><Button asChild variant="outline"><Link to="/auth"><ArrowLeft /> Voltar para o acesso</Link></Button></div> : <form className="auth-form" onSubmit={submit}><fieldset disabled={busy}><PasswordField id="new-password" label="Nova senha" value={password} onChange={setPassword} autoComplete="new-password" /><small className="auth-password-hint">Use pelo menos 8 caracteres.</small><PasswordField id="confirm-password" label="Confirmar senha" value={confirm} onChange={setConfirm} autoComplete="new-password" /></fieldset>{error && <p className="auth-error" role="alert">{error}</p>}<Button className="auth-submit" disabled={busy}>{busy ? <LoaderCircle className="refresh-spin" /> : <>Salvar nova senha <ArrowRight /></>}</Button></form>}
    {done && error && <p className="auth-error" role="alert">{error}</p>}
  </AuthFrame>;
}