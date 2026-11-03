import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const AuthContext = createContext<{ user: User | null; ready: boolean; isAdmin: boolean; signOut: () => Promise<void> }>({ user: null, ready: false, isAdmin: false, signOut: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    let alive = true;
    let version = 0;
    const refreshUser = async () => {
      const current = ++version;
      const { data, error } = await supabase.auth.getUser();
      let admin = false;
      if (!error && data.user) {
        const role = await supabase.from("user_roles").select("id").eq("user_id", data.user.id).eq("role", "admin").maybeSingle();
        admin = !role.error && !!role.data;
      }
      if (alive && current === version) { setUser(error ? null : data.user); setIsAdmin(admin); setReady(true); }
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        ++version;
        setUser(null); setIsAdmin(false); setReady(true);
        void queryClient.cancelQueries().then(() => queryClient.clear());
        void router.invalidate();
      } else if (["SIGNED_IN", "USER_UPDATED", "PASSWORD_RECOVERY"].includes(event)) {
        // Auth client calls must run outside the auth listener's lock.
        window.setTimeout(() => { if (alive) void refreshUser(); }, 0);
        if (event === "PASSWORD_RECOVERY") {
          window.sessionStorage.setItem("afiliasplace-recovery", String(Date.now()));
          void router.navigate({ to: "/reset-password", replace: true });
        }
        void router.invalidate();
      }
    });
    void refreshUser();
    return () => { alive = false; subscription.unsubscribe(); };
  }, [queryClient, router]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    await router.navigate({ to: "/auth", replace: true });
  }
  return <AuthContext.Provider value={{ user, ready, isAdmin, signOut }}>{children}</AuthContext.Provider>;
}

export const useAccount = () => useContext(AuthContext);