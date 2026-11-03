import { useState } from "react";
import { Check, Copy, TicketPercent } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useJanela } from "@/components/janela";
import { useAccount } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { getMyCoupons, type Coupon } from "@/lib/coupons.functions";

const fmtDate = (iso: string | null) => iso ? new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "Sem validade";

function CouponRow({ c }: { c: Coupon }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(c.codigo); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ } };
  return <li className="v2-coupon-row"><div><strong>{c.codigo}</strong><span>{c.validade ? `Válido até ${fmtDate(c.validade)}` : "Sem validade"}</span></div><Button variant="outline" className="v2-btn-white" onClick={copy} aria-label={`Copiar cupom ${c.codigo}`}>{copied ? <><Check /> Copiado</> : <><Copy /> Copiar</>}</Button></li>;
}

export function CouponsCard(_: { coupons: Coupon[] }) {
  const { abrir } = useJanela();
  return (
    <div className="v2-coupon-card">
      <span className="v2-coupon-icon" aria-hidden="true"><TicketPercent /></span>
      <strong>Cupons exclusivos</strong>
      <span>Só para influenciadores</span>
      <Button className="v2-btn-white" onClick={() => abrir("cupons")}>Pegar cupons exclusivos</Button>
    </div>
  );
}

/** Conteúdo da janela "cupons" (aberta por ?janela=cupons). */
export function CouponsContent() {
  const { user } = useAccount(); const fetchCoupons = useServerFn(getMyCoupons);
  const q = useQuery({ queryKey: ["my-coupons", user?.id], queryFn: () => fetchCoupons(), enabled: !!user, staleTime: 60_000 });
  const coupons = q.data?.coupons ?? [];
  if (q.data && !q.data.isInfluencer) return <p className="v2-coupon-empty">Cupons exclusivos são só para influenciadores.</p>;
  return <div className="v2-coupon-dialog">
    <div className="v2-coupon-head">
      <span className="v2-badge">Exclusivo para influenciadores</span>
      <h3>Cupons que fazem seu público comprar</h3>
      <p>Cada cupom vale R$ 30 de desconto e pode chegar a 50% OFF na compra. Compartilhe com seus seguidores e aumente suas conversões.</p>
      <div className="v2-coupon-highlights"><div><strong>R$ 30</strong><span>por cupom</span></div><div><strong>até 50%</strong><span>de desconto</span></div></div>
    </div>
    {q.isLoading ? <p className="v2-coupon-empty">Carregando…</p> : coupons.length ? <ul className="v2-coupon-list">{coupons.map(c => <CouponRow key={c.id} c={c} />)}</ul> : <p className="v2-coupon-empty">Novos cupons em breve</p>}
    <p className="v2-coupon-note">Desconto de R$ 30 por cupom, limitado a 50% do valor da compra. Válido conforme as regras e a validade de cada cupom.</p>
  </div>;
}
