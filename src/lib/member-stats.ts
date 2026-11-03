// Contas de teste (is_test) nunca entram nos totais do admin.
export type CountableMember = { plan: string; is_test?: boolean | null };
export const realMembers = <T extends CountableMember>(list: T[]) => list.filter(m => !m.is_test);
