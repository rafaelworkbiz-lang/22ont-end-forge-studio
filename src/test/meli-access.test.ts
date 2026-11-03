import { describe, expect, it, vi, beforeEach } from 'vitest';
const mocks = vi.hoisted(() => ({ roles: vi.fn(), connection: vi.fn() }));
vi.mock('@/lib/auth-roles.server', () => ({ getUserRoles: mocks.roles }));
vi.mock('@/integrations/supabase/client.server', () => ({ supabaseAdmin: { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: mocks.connection }) }) }) } }));
import { resolveMeliAccess } from '@/lib/meli-access.server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
const db = {} as SupabaseClient<Database>;
beforeEach(() => { vi.resetAllMocks(); mocks.connection.mockResolvedValue({ data: null, error: null }); });
describe('Catalog account modes', () => {
  it('lets admins browse without pretending to be connected', async () => {
    mocks.roles.mockResolvedValue({ isAdmin: true, isInfluencer: false });
    expect(await resolveMeliAccess(db, 'admin')).toMatchObject({ mode: 'admin', catalogAllowed: true, connected: false, tag: '', meliUserId: null });
  });
  it('lets influencers browse without a connection but with no tag', async () => {
    mocks.roles.mockResolvedValue({ isAdmin: false, isInfluencer: true });
    expect(await resolveMeliAccess(db, 'influencer')).toMatchObject({ mode: 'demo', catalogAllowed: true, connected: false, nickname: '', tag: '', meliUserId: null });
  });
  it('uses the influencer own real connection and tag after connecting', async () => {
    mocks.roles.mockResolvedValue({ isAdmin: false, isInfluencer: true });
    mocks.connection.mockResolvedValue({ data: { nickname: 'Real', affiliate_tag: 'real-tag', meli_user_id: 123, connected_at: '2026-01-01' }, error: null });
    expect(await resolveMeliAccess(db, 'influencer')).toMatchObject({ mode: 'demo', connected: true, nickname: 'Real', tag: 'real-tag', meliUserId: 123 });
  });
  it('blocks disconnected clients and uses their own real connection after connecting', async () => {
    mocks.roles.mockResolvedValue({ isAdmin: false, isInfluencer: false });
    expect(await resolveMeliAccess(db, 'client')).toMatchObject({ mode: 'client', catalogAllowed: false });
    mocks.connection.mockResolvedValue({ data: { nickname: 'Cliente', affiliate_tag: 'own', meli_user_id: 456, connected_at: '2026-01-01' }, error: null });
    expect(await resolveMeliAccess(db, 'client')).toMatchObject({ mode: 'client', catalogAllowed: true, connected: true, tag: 'own', nickname: 'Cliente' });
  });
  it('fails closed if role or connection checks fail', async () => {
    mocks.roles.mockRejectedValue(new Error('Forbidden'));
    await expect(resolveMeliAccess(db, 'client')).rejects.toThrow();
    mocks.roles.mockResolvedValue({ isAdmin: false, isInfluencer: false });
    mocks.connection.mockResolvedValue({ data: null, error: { message: 'error' } });
    await expect(resolveMeliAccess(db, 'client')).rejects.toThrow();
  });
});