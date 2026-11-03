import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const requireAdmin = createMiddleware({ type: "function" }).middleware([requireSupabaseAuth]).server(async ({ context, next }) => {
  const { data, error } = await context.supabase.from("user_roles").select("id").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
  if (error || !data) throw new Error("Acesso restrito ao administrador.");
  return next();
});