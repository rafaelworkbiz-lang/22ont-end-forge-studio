import { describe, expect, it, vi, beforeEach } from 'vitest';
const { createUser, rpc } = vi.hoisted(() => ({ createUser: vi.fn(), rpc: vi.fn() }));
const { sendEmail } = vi.hoisted(() => ({ sendEmail: vi.fn() }));
vi.mock('@/lib/email-templates/send-email', () => ({ sendTemplateEmail: sendEmail }));
vi.mock('@/integrations/supabase/client.server', () => ({ supabaseAdmin: { auth: { admin: { createUser } }, rpc } }));
async function call(body: unknown, token = 'tok') {
 const { Route } = await import('@/routes/api/public/applyfy-webhook');
 const handler = (Route as any).options.server.handlers.POST;
 return handler({ request: new Request(`http://x/api/public/applyfy-webhook?token=${token}`, { method: 'POST', body: JSON.stringify(body) }) });
}
const approved = { event: 'approved', customer: { email: 'novo@x.com' }, offer: 'OBULDYP', transaction_id: 'sale-1' };
describe('Applyfy webhook', () => {
 beforeEach(() => { sendEmail.mockReset().mockResolvedValue({ sent: true }); process.env['APPLYFY_WEBHOOK_TOKEN'] = 'tok'; createUser.mockReset().mockResolvedValue({ error: null }); rpc.mockReset().mockImplementation(async (name: string) => ({ error: null, data: name === 'claim_applyfy_event' ? { id: 'event-1', owned: true } : null })); });
 it('cria conta com senha individual e libera mensal após compra aprovada', async () => {
  expect((await call(approved)).status).toBe(200);
  const arg = createUser.mock.calls[0]?.[0];
  expect(arg.email).toBe('novo@x.com'); expect(arg.password).not.toBe('#Place@123'); expect(arg.password.length).toBe(14);
  expect(sendEmail).toHaveBeenCalledTimes(1); expect((sendEmail.mock.calls[0] as any)[2].templateData.password).toBe(arg.password);
  expect(rpc).toHaveBeenCalledWith('claim_applyfy_event', expect.objectContaining({ p_plan: 'monthly', p_payment: 'approved' }));
  expect(rpc).toHaveBeenCalledWith('finish_applyfy_event', expect.objectContaining({ p_action: 'grant', p_account: 'created' }));
 });
 it('libera vitalício para conta existente', async () => {
  createUser.mockResolvedValue({ error: { message: 'User already registered' } });
  expect((await call({ ...approved, offer: 'B0QAGV6' })).status).toBe(200);
  expect(rpc).toHaveBeenCalledWith('claim_applyfy_event', expect.objectContaining({ p_plan: 'lifetime' }));
  expect(rpc).toHaveBeenCalledWith('finish_applyfy_event', expect.objectContaining({ p_account: 'existing' }));
  expect((sendEmail.mock.calls[0] as any)[2].templateData.password).toBeUndefined();
 });
 it('reembolso bloqueia sem criar usuário', async () => {
  expect((await call({ ...approved, event: 'refunded' })).status).toBe(200); expect(createUser).not.toHaveBeenCalled(); expect(sendEmail).not.toHaveBeenCalled();
  expect(rpc).toHaveBeenCalledWith('finish_applyfy_event', expect.objectContaining({ p_action: 'revoke' }));
 });
 it('não duplica criação em aviso já concluído', async () => {
  rpc.mockResolvedValue({ data: { id: 'event-1', owned: false, status: 'success' }, error: null });
  expect((await call(approved)).status).toBe(200); expect(createUser).not.toHaveBeenCalled();expect(rpc).toHaveBeenCalledTimes(1);
 });
 it('registra erro de criação e solicita nova tentativa', async () => {
  createUser.mockResolvedValue({ error: { message: 'Unexpected failure' } });
  expect((await call(approved)).status).toBe(500);
  expect(rpc).toHaveBeenCalledWith('finish_applyfy_event', expect.objectContaining({ p_error: 'account_creation_failed', p_account: 'error' }));
 });
 it('falha no e-mail não bloqueia acesso', async () => {
  sendEmail.mockRejectedValue(new Error('down')); expect((await call(approved)).status).toBe(200);
 });
 it('recusa acesso sem token antes de qualquer alteração', async () => {
  expect((await call(approved, 'wrong')).status).toBe(401); expect(rpc).not.toHaveBeenCalled();expect(createUser).not.toHaveBeenCalled();
 });
 it('não confirma sucesso se atualização do acesso falhou', async () => {
  rpc.mockImplementation(async (name: string) => name === 'claim_applyfy_event' ? { data: { id: 'event-1', owned: true } } : { error: { message: 'failure' } });
  expect((await call(approved)).status).toBe(500);
 });
});
