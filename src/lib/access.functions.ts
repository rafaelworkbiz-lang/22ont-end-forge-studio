import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AccessStatus = { allowed: boolean; reason: "admin" | "influencer" | "active" | "expired" | "cancelled" | "none"; plan: string | null; expires_at: string | null };

export const getAccessStatus = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }): Promise<AccessStatus> => {
  const { computeAccess } = await import("@/lib/access-core.server");
  return computeAccess(context.supabase, context.userId);
});
