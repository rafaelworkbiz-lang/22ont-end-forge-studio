import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowRight, Check, ExternalLink, RotateCcw, UserPlus, BadgeCheck, Link2, Loader2, PlugZap, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/components/auth-provider";
import { getMeliAuthUrl } from "@/lib/meli-connect.functions";
import type { JanelaProps } from "@/components/janela";

/** Perguntas por fornecedor, abertas em janela pelo botão "Usar esse fornecedor". */
type Step = "conta" | "criar" | "afiliado" | "cadastrar" | "pronto";
export type Fornecedor = "ml" | "shopee";
const INFO: Record<Fornecedor, { nome: string; conta: string; afiliado: string }> = {
  ml: { nome: "Mercado Livre", conta: "https://www.mercadolivre.com.br/registration", afiliado: "https://www.mercadolivre.com.br/l/afiliados-home" },
  shopee: { nome: "Shopee", conta: "https://shopee.com.br/buyer/signup", afiliado: "https://affiliate.shopee.com.br/" },
};
const key = (id: string, f: Fornecedor) => `afp-fornecedor-onboarding:${id}:${f}`;
const ORDER: Step[] = ["conta", "afiliado", "pronto"];

export function resetSupplierOnboarding(userId: string) {
  (["ml", "shopee"] as const).forEach(f => window.localStorage.removeItem(key(userId, f)));
}

export function FornecedorJanela({ params, fechar }: JanelaProps) {
  const f: Fornecedor = params["f"] === "shopee" ? "shopee" : "ml";
  const i = INFO[f];
  const { user } = useAccount();
  const [step, setStep] = useState<Step>("conta");
  const [busy, setBusy] = useState(false);
  const authUrl = useServerFn(getMeliAuthUrl);
  useEffect(() => { if (user && window.localStorage.getItem(key(user.id, f)) === "pronto") setStep("pronto"); }, [user, f]);
  const go = (s: Step) => { setStep(s); if (user && s === "pronto") window.localStorage.setItem(key(user.id, f), "pronto"); };
  const idx = step === "criar" ? 0 : step === "cadastrar" ? 1 : ORDER.indexOf(step);

  async function connect() {
    setBusy(true);
    const state = crypto.randomUUID(); sessionStorage.setItem("meli-oauth-state", state);
    const r = await authUrl({ data: { redirectUri: window.location.origin, state } }).catch(() => ({ url: null }));
    if (r.url) window.location.href = r.url; else { setBusy(false); toast.error("Integração indisponível no momento."); }
  }

  return <section className="sob sob-in-janela" aria-live="polite">
    <div className="sob-dots" aria-hidden="true">{[0, 1, 2].map(n => <span key={n} className={n <= idx ? "is-on" : ""} />)}</div>
    <div className="sob-card" key={step}>
      {step === "conta" && <>
        <span className="sob-ico"><UserPlus /></span>
        <h2>Você já tem conta no {i.nome}?</h2>
        <p>Para gerar links com a sua identificação, você precisa de uma conta no {i.nome}.</p>
        <div className="sob-actions"><Button onClick={() => go("afiliado")}><Check />Sim, já tenho</Button><Button variant="outline" onClick={() => go("criar")}>Ainda não</Button></div>
      </>}
      {step === "criar" && <>
        <span className="sob-ico"><UserPlus /></span>
        <h2>Crie sua conta primeiro</h2>
        <p>Abra o site, crie a conta e volte aqui. É grátis e leva poucos minutos.</p>
        <div className="sob-brands"><a className={`sob-brand is-${f}`} href={i.conta} target="_blank" rel="noopener noreferrer"><strong>{i.nome}</strong><span>Criar conta <ExternalLink /></span></a></div>
        <div className="sob-actions"><Button onClick={() => go("afiliado")}>Já criei minha conta<ArrowRight /></Button></div>
      </>}
      {step === "afiliado" && <>
        <span className="sob-ico"><BadgeCheck /></span>
        <h2>Você já é afiliado do {i.nome}?</h2>
        <p>O cadastro de afiliado é feito no próprio {i.nome}. Sem ele, não existe comissão.</p>
        <div className="sob-actions"><Button onClick={() => go("pronto")}><Check />Sim, sou afiliado</Button><Button variant="outline" onClick={() => go("cadastrar")}>Ainda não</Button></div>
      </>}
      {step === "cadastrar" && <>
        <span className="sob-ico"><BadgeCheck /></span>
        <h2>Cadastre-se como afiliado</h2>
        <p>Clique em cadastrar, entre com sua conta e aceite os termos do programa.</p>
        <div className="sob-brands"><a className={`sob-brand is-${f}`} href={i.afiliado} target="_blank" rel="noopener noreferrer"><strong>Afiliados {i.nome}</strong><span>Cadastrar <ExternalLink /></span></a></div>
        <div className="sob-actions"><Button onClick={() => go("pronto")}>Já me cadastrei<ArrowRight /></Button></div>
      </>}
      {step === "pronto" && <>
        <span className="sob-ico"><PlugZap /></span>
        <h2>Tudo pronto! Conecte sua conta</h2>
        {f === "ml" ? <>
          <p>Você vai entrar no Mercado Livre e autorizar. Sua tag de afiliado vem junto.</p>
          <div className="sob-actions"><Button onClick={connect} disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <PlugZap />}Conectar minha conta</Button><Button variant="outline" onClick={fechar}>Agora não</Button></div>
        </> : <>
          <p><Info aria-hidden="true" style={{ display: "inline", width: 16, height: 16, verticalAlign: "-3px" }} /> A ligação com a Shopee ainda está sendo preparada. Em breve você conecta por aqui.</p>
          <div className="sob-actions"><Button onClick={fechar}>Entendi</Button></div>
        </>}
      </>}
    </div>
  </section>;
}

export function SupplierGuide() {
  const { user } = useAccount();
  const steps = [
    { t: "Tenha uma conta", d: "Crie sua conta grátis no Mercado Livre ou na Shopee." },
    { t: "Vire afiliado", d: "Cadastre-se no programa de afiliados do site e aceite os termos." },
    { t: "Use o fornecedor", d: "Clique em Usar esse fornecedor e autorize. Sua tag de afiliado vem junto." },
    { t: "Confirme a tag", d: "Em Gerenciar conexão, use Reconfirmar tag e salve o link do seu perfil." },
    { t: "Comece a vender", d: "Abra Produtos validados e copie links com a sua identificação." },
  ];
  return <section className="v2-card sob-guide" aria-labelledby="sob-guide-t">
    <div className="sob-guide-head"><h2 id="sob-guide-t">Passo a passo</h2><Button variant="ghost" onClick={() => { if (user) { resetSupplierOnboarding(user.id); toast.success("Respostas apagadas."); } }}><RotateCcw />Refazer perguntas</Button></div>
    <ol>{steps.map((s, i) => <li key={s.t}><span className="sob-num">{i + 1}</span><div><strong>{s.t}</strong><p>{s.d}</p></div>{i < 2 ? null : <Link2 aria-hidden="true" className="sob-li-ico" />}</li>)}</ol>
  </section>;
}
