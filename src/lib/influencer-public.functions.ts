import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type PublicInfluencer = { codigo?: string; mensal?: string; vitalicio?: string; redirect?: string } | null;

/** Leitura pública: só código e links de checkout de influenciador ATIVO. */
export const getPublicInfluencer = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ codigo: z.string().trim().toLowerCase().max(40) }).parse(d))
  .handler(async ({ data }): Promise<PublicInfluencer> => {
    if (!/^[a-z0-9-]{3,20}$/.test(data.codigo)) return null;
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const db = createClient<Database>(process.env["SUPABASE_URL"]!, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
      const h = new Headers(init?.headers);
      if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
      h.set("apikey", key); return fetch(input, { ...init, headers: h });
    } } });
    const { data: r } = await db.rpc("influenciador_publico", { _codigo: data.codigo });
    return (r as PublicInfluencer) ?? null;
  });
