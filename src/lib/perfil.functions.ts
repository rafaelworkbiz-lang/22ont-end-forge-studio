import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getPerfilState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [pubs, prof] = await Promise.all([
      context.supabase.from("perfil_publicacoes").select("item_id, status, publicado_em").eq("user_id", context.userId),
      context.supabase.from("meli_affiliate_profile").select("profile_url, tag_confirmed_at").eq("user_id", context.userId).maybeSingle(),
    ]);
    return {
      published: (pubs.data ?? []).map(p => ({ itemId: p.item_id, status: p.status as "auto" | "manual" })),
      profileUrl: prof.data?.profile_url ?? null,
      tagConfirmed: !!prof.data?.tag_confirmed_at,
    };
  });

export const markPublished = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ itemId: z.string().regex(/^MLB\d{4,16}$/) }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("perfil_publicacoes")
      .upsert({ user_id: context.userId, item_id: data.itemId, status: "manual", publicado_em: new Date().toISOString() }, { onConflict: "user_id,item_id" });
    return { ok: !error };
  });

const profileUrl = z.string().trim().max(300).refine(v => v === "" || /^https:\/\/([a-z0-9-]+\.)*mercadolivre\.com\.br\//i.test(v), "Use um endereço do mercadolivre.com.br");

export const saveAffiliateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ profileUrl: profileUrl.optional(), confirmTag: z.boolean().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const patch: { user_id: string; updated_at: string; profile_url?: string | null; tag_confirmed_at?: string } = { user_id: context.userId, updated_at: new Date().toISOString() };
    if (data.profileUrl !== undefined) patch.profile_url = data.profileUrl || null;
    if (data.confirmTag) {
      const { resolveMeliAccess } = await import("./meli-access.server");
      const { isValidTag } = await import("./product-share");
      const access = await resolveMeliAccess(context.supabase, context.userId);
      if (!access.connected || !isValidTag(access.tag)) return { ok: false };
      patch.tag_confirmed_at = new Date().toISOString();
    }
    const { error } = await context.supabase.from("meli_affiliate_profile").upsert(patch, { onConflict: "user_id" });
    return { ok: !error };
  });
