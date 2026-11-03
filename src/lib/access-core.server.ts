import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { AccessStatus } from "./access.functions";

/** Situação de acesso/plano do usuário (servidor). */
export async function computeAccess(db: SupabaseClient<Database>, userId: string): Promise<AccessStatus> {
  const { getUserRoles } = await import("@/lib/auth-roles.server");
  const roles = await getUserRoles(db, userId);
  if (roles.isAdmin) return { allowed: true, reason: "admin", plan: null, expires_at: null };
  if (roles.isInfluencer) return { allowed: true, reason: "influencer", plan: null, expires_at: null };
  const { data: account } = await db.auth.getUser();
  const email = account.user?.email?.toLowerCase();
  if (!email || !account.user?.email_confirmed_at) return { allowed: false, reason: "none", plan: null, expires_at: null };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: m } = await supabaseAdmin.from("members").select("plan, status, expires_at").eq("email", email).maybeSingle();
  if (!m) return { allowed: false, reason: "none", plan: null, expires_at: null };
  if (m.status === "expired") return { allowed: false, reason: "expired", plan: m.plan, expires_at: m.expires_at };
  if (m.status !== "active") return { allowed: false, reason: "cancelled", plan: m.plan, expires_at: m.expires_at };
  if (m.plan === "monthly" && (!m.expires_at || new Date(m.expires_at) < new Date())) return { allowed: false, reason: "expired", plan: m.plan, expires_at: m.expires_at };
  return { allowed: true, reason: "active", plan: m.plan, expires_at: m.expires_at };
}
