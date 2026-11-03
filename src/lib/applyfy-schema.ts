import type { Database, Json } from '@/integrations/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';
export type ApplyfyReceipt = { id: string; customer_email: string | null; plan: string | null; provider_status: string; payment_status: string; processing_status: string; account_status: string; access_status: string; error_code: string | null; received_at: string; processed_at: string | null; event_key: string; lease_until: string };
type ReceiptTable = { Row: ApplyfyReceipt; Insert: Partial<ApplyfyReceipt>; Update: Partial<ApplyfyReceipt>; Relationships: [] };
export type ApplyfyDatabase = Omit<Database, 'public'> & { public: Omit<Database['public'], 'Tables' | 'Functions'> & { Tables: Database['public']['Tables'] & { applyfy_events: ReceiptTable }; Functions: { claim_applyfy_event: { Args: { p_key: string; p_email: string; p_plan: string; p_status: string; p_payment: string }; Returns: Json }; finish_applyfy_event: { Args: { p_id: string; p_action: string; p_account: string; p_error?: string }; Returns: undefined } } } };
// Additive migration contract, kept separate from generated types while schema synchronization is pending.
export const withApplyfySchema = (client: SupabaseClient<Database>): SupabaseClient<ApplyfyDatabase> => client as unknown as SupabaseClient<ApplyfyDatabase>;
