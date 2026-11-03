import { type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type UserRoles = { isAdmin: boolean; isInfluencer: boolean };

export async function getUserRoles(db: SupabaseClient<Database>, userId: string): Promise<UserRoles> {
  const { data: account, error: authError } = await db.auth.getUser();
  if (authError || account.user?.id !== userId) throw new Error("Conta não verificada.");
  const { data: adminRole, error: roleError } = await db.from("user_roles").select("id").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (roleError) throw new Error("Não foi possível conferir seu acesso.");
  if (adminRole) return { isAdmin: true, isInfluencer: false };
  const email = account.user.email?.toLowerCase();
  if (!email || !account.user.email_confirmed_at) return { isAdmin: false, isInfluencer: false };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: member, error } = await supabaseAdmin.from("members").select("id, member_roles(role)").eq("email", email).maybeSingle();
  if (error) throw new Error("Não foi possível conferir seu acesso.");
  return { isAdmin: false, isInfluencer: member?.member_roles.some(r => r.role === "influencer") ?? false };
}
