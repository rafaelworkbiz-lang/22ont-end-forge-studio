import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, KeyRound, Bell, Trash2 } from "lucide-react";

type Prefs = { sales: boolean; daily: boolean; products: boolean; news: boolean };
const DEFAULT_PREFS: Prefs = { sales: true, daily: true, products: false, news: false };
const PREF_LABELS: Record<keyof Prefs, [string, string]> = {
  sales: ["Novas vendas", "Aviso quando uma venda entrar no painel"],
  daily: ["Resumo diário", "Total de vendas e comissões do dia"],
  products: ["Produtos em alta", "Novidades no ranking de mais vendidos"],
  news: ["Novidades da AfiliaPlace", "Recursos novos e melhorias"],
};

export function ProfileSettings() {
  const { user } = useAccount();
  const meta = (user?.user_metadata ?? {}) as { avatar_path?: string; notifications?: Partial<Prefs> };
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | undefined>(meta.avatar_path);
  const [uploading, setUploading] = useState(false);
  const [pwd, setPwd] = useState(""); const [pwd2, setPwd2] = useState(""); const [savingPwd, setSavingPwd] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({ ...DEFAULT_PREFS, ...meta.notifications });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!avatarPath) { setAvatarUrl(null); return; }
    let active = true;
    supabase.storage.from("avatars").createSignedUrl(avatarPath, 3600).then(({ data }) => { if (active) setAvatarUrl(data?.signedUrl ?? null); });
    return () => { active = false; };
  }, [avatarPath]);

  if (!user) return null;
  const initials = (user.email ?? "?").slice(0, 2).toUpperCase();

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Escolha um arquivo de imagem."); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("A imagem deve ter até 2 MB."); return; }
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (!error) {
      const { error: e2 } = await supabase.auth.updateUser({ data: { avatar_path: path } });
      if (!e2) { if (avatarPath) await supabase.storage.from("avatars").remove([avatarPath]); setAvatarPath(path); toast.success("Foto atualizada."); }
      else toast.error("Não foi possível salvar a foto.");
    } else toast.error("Não foi possível enviar a foto.");
    setUploading(false);
  };
  const removeAvatar = async () => {
    if (!avatarPath) return;
    await supabase.storage.from("avatars").remove([avatarPath]);
    await supabase.auth.updateUser({ data: { avatar_path: null } });
    setAvatarPath(undefined); toast.success("Foto removida.");
  };
  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 8) { toast.error("A senha precisa ter pelo menos 8 caracteres."); return; }
    if (pwd !== pwd2) { toast.error("As senhas não conferem."); return; }
    setSavingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setSavingPwd(false);
    if (error) toast.error(error.message.includes("weak") || error.message.includes("pwned") ? "Senha fraca ou já vazada. Escolha outra." : "Não foi possível alterar a senha.");
    else { setPwd(""); setPwd2(""); toast.success("Senha alterada."); }
  };
  const togglePref = async (key: keyof Prefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    const { error } = await supabase.auth.updateUser({ data: { notifications: next } });
    if (error) { setPrefs(prefs); toast.error("Não foi possível salvar."); }
  };

  return <section className="profile-page">
    <header className="profile-head"><h1>Meu perfil</h1><p>Gerencie sua foto, senha e notificações.</p></header>
    <div className="profile-grid">
      <article className="profile-card profile-identity">
        <div className="profile-avatar">{avatarUrl ? <img src={avatarUrl} alt="Sua foto" /> : <span>{initials}</span>}
          <button type="button" aria-label="Alterar foto" onClick={() => fileRef.current?.click()} disabled={uploading}><Camera /></button></div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
        <strong>{user.email}</strong>
        <small>Conta desde {new Date(user.created_at).toLocaleDateString("pt-BR")}</small>
        <div className="profile-actions"><Button onClick={() => fileRef.current?.click()} disabled={uploading}>{uploading ? "Enviando..." : "Alterar foto"}</Button>
          {avatarPath && <Button variant="ghost" onClick={removeAvatar}><Trash2 /> Remover</Button>}</div>
        <small>JPG, PNG ou WebP até 2 MB.</small>
      </article>
      <article className="profile-card">
        <h2><KeyRound /> Alterar senha</h2>
        <form onSubmit={savePassword} className="profile-form">
          <label>Nova senha<input type="password" autoComplete="new-password" value={pwd} onChange={e => setPwd(e.target.value)} /></label>
          <label>Confirmar nova senha<input type="password" autoComplete="new-password" value={pwd2} onChange={e => setPwd2(e.target.value)} /></label>
          <Button type="submit" disabled={savingPwd || !pwd}>{savingPwd ? "Salvando..." : "Salvar senha"}</Button>
        </form>
      </article>
      <article className="profile-card profile-wide">
        <h2><Bell /> Notificações</h2>
        <ul className="profile-prefs">{(Object.keys(PREF_LABELS) as (keyof Prefs)[]).map(k => <li key={k}>
          <div><strong>{PREF_LABELS[k][0]}</strong><small>{PREF_LABELS[k][1]}</small></div>
          <button type="button" role="switch" aria-checked={prefs[k]} aria-label={PREF_LABELS[k][0]} className={`profile-switch ${prefs[k] ? "on" : ""}`} onClick={() => togglePref(k)}><span /></button>
        </li>)}</ul>
      </article>
    </div>
  </section>;
}
