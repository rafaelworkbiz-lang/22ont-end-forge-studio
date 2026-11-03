import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "@/lib/admin.functions";

export type Coupon = { id: string; codigo: string; valor_desconto: number; desconto_max_percentual: number; validade: string | null; ativo: boolean; criado_em: string };

/** Influencer card visibility + active coupons. RLS returns no rows for non-influencers. */
export const getMyCoupons = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: isInf } = await context.supabase.rpc("is_influencer", { _user_id: context.userId });
  const { data } = await context.supabase.from("cupons_influenciador").select("*").order("criado_em", { ascending: false });
  const now = Date.now();
  const coupons = ((data ?? []) as Coupon[]).filter(c => !c.validade || new Date(c.validade).getTime() >= now);
  return { isInfluencer: !!isInf, coupons };
});

export const adminListCoupons = createServerFn({ method: "GET" }).middleware([requireAdmin]).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("cupons_influenciador").select("*").order("criado_em", { ascending: false });
  if (error) throw new Error("Não foi possível carregar os cupons.");
  return data as Coupon[];
});

export const adminCreateCoupon = createServerFn({ method: "POST" }).middleware([requireAdmin])
  .inputValidator((d: unknown) => z.object({ codigo: z.string().trim().min(3).max(40).regex(/^[A-Za-z0-9_-]+$/), validade: z.string().max(40).nullable() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("cupons_influenciador").insert({ codigo: data.codigo.toUpperCase(), validade: data.validade ? new Date(`${data.validade}T23:59:59-03:00`).toISOString() : null });
    if (error) return { ok: false as const, error: error.code === "23505" ? "Esse código já existe." : "Não foi possível criar o cupom." };
    return { ok: true as const };
  });

export const adminSetCouponActive = createServerFn({ method: "POST" }).middleware([requireAdmin])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), ativo: z.boolean() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("cupons_influenciador").update({ ativo: data.ativo }).eq("id", data.id);
    if (error) throw new Error("Não foi possível atualizar o cupom.");
    return { ok: true };
  });
