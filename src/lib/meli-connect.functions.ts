import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type MeliConnection = { mode: 'admin' | 'demo' | 'client'; catalogAllowed: boolean; connected: boolean; nickname: string; meliUserId: number | null; tag: string; connectedAt: string | null };
const redirect = z.string().url().max(200).refine((u) => /^https:\/\/([a-z0-9-]+\.)*(afiliaplace\.site|lovable\.app)\/?$/.test(u) || u.startsWith("http://localhost"));

export const getMeliAuthUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ redirectUri: redirect, state: z.string().min(8).max(80) }).parse(d))
  .handler(async ({ data }) => {
    const id = process.env["MELI_APP_ID"];
    if (!id) return { url: null as string | null };
    const u = new URL("https://auth.mercadolivre.com.br/authorization");
    u.searchParams.set("response_type", "code");
    u.searchParams.set("client_id", id);
    u.searchParams.set("redirect_uri", data.redirectUri);
    u.searchParams.set("state", data.state);
    return { url: u.toString() as string | null };
  });

export const exchangeMeliCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ code: z.string().min(4).max(300), redirectUri: redirect }).parse(d))
  .handler(async ({ data, context }) => {
    const id = process.env["MELI_APP_ID"], secret = process.env["MELI_CLIENT_SECRET"];
    if (!id || !secret) return { ok: false, error: "Integração indisponível no momento." };
    const res = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
      body: new URLSearchParams({ grant_type: "authorization_code", client_id: id, client_secret: secret, code: data.code, redirect_uri: data.redirectUri }),
    });
    if (!res.ok) { console.error("MELI oauth", res.status, await res.text()); return { ok: false, error: "Não foi possível conectar. Tente novamente." }; }
    const t = (await res.json()) as { access_token: string; refresh_token?: string; expires_in: number; user_id: number };
    const me = await fetch("https://api.mercadolibre.com/users/me", { headers: { authorization: `Bearer ${t.access_token}` } });
    const profile = me.ok ? ((await me.json()) as { id: number; nickname?: string }) : { id: t.user_id, nickname: "" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: prev } = await supabaseAdmin.from("meli_connections").select("affiliate_tag").eq("user_id", context.userId).maybeSingle();
    const { error } = await supabaseAdmin.from("meli_connections").upsert({
      user_id: context.userId, meli_user_id: profile.id, nickname: profile.nickname || `Conta ${profile.id}`,
      affiliate_tag: prev?.affiliate_tag || (profile.nickname ?? "").toLowerCase(),
      access_token: t.access_token, refresh_token: t.refresh_token ?? null,
      expires_at: new Date(Date.now() + t.expires_in * 1000).toISOString(), connected_at: new Date().toISOString(),
    });
    if (error) { console.error(error); return { ok: false, error: "Não foi possível salvar a conexão." }; }
    return { ok: true, error: null as string | null };
  });

export const getMeliConnection = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MeliConnection> => {
    const { resolveMeliAccess } = await import('./meli-access.server');
    return resolveMeliAccess(context.supabase, context.userId);
  });

export const saveMeliTag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ tag: z.string().trim().max(60).regex(/^[\w.-]*$/) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("meli_connections").update({ affiliate_tag: data.tag }).eq("user_id", context.userId);
    return { ok: !error };
  });

export const disconnectMeli = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("meli_connections").delete().eq("user_id", context.userId);
    return { ok: true };
  });
