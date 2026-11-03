import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { getUserRoles } from './auth-roles.server';

export async function resolveMeliAccess(db: SupabaseClient<Database>, userId: string) {
  const roles = await getUserRoles(db, userId);
  const mode = roles.isAdmin ? 'admin' : roles.isInfluencer ? 'demo' : 'client';
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data: connection, error } = await supabaseAdmin.from('meli_connections')
    .select('nickname, meli_user_id, affiliate_tag, connected_at').eq('user_id', userId).maybeSingle();
  if (error) throw new Error('Não foi possível conferir a conexão.');
  // Admins e influenciadores navegam sem conexão; links com tag exigem a conexão real da própria conta.
  return {
    mode,
    catalogAllowed: mode !== 'client' || !!connection,
    connected: !!connection,
    nickname: connection?.nickname ?? '',
    meliUserId: connection ? Number(connection.meli_user_id) : null,
    tag: connection?.affiliate_tag ?? '',
    connectedAt: connection?.connected_at ?? null,
  } as const;
}