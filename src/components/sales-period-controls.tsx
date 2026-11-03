import { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { saoDay } from '@/lib/demo-engine';
import { salesPeriods, type SalesPeriod } from '@/lib/sales-period';

export function useSalesPeriod(initialDay = '') {
  const [period, setPeriod] = useState<SalesPeriod>('Hoje');
  const [from, setFrom] = useState(initialDay);
  const [to, setTo] = useState(initialDay);
  const [month, setMonth] = useState('');
  useEffect(() => {
    const today = initialDay || saoDay(new Date());
    setFrom(v => v || today); setTo(v => v || today);
  }, [initialDay]);
  return { period, setPeriod, from, setFrom, to, setTo, month, setMonth };
}
export function SalesPeriodSelect({ period, onChange }: { period: SalesPeriod; onChange: (period: SalesPeriod) => void }) {
  return <label className="sales-period"><CalendarDays size={15} /><select aria-label="Período das vendas" value={period} onChange={e => {
    const value = salesPeriods.find(p => p === e.target.value);
    if (value) onChange(value);
  }}>{salesPeriods.map(p => <option key={p}>{p}</option>)}</select></label>;
}
export function SalesCustomDates({ state, error }: { state: ReturnType<typeof useSalesPeriod>; error: string }) {
  if (state.period !== 'Personalizado') return null;
  return <div className="sales-custom-dates"><label>Data inicial<Input type="date" aria-label="Data inicial" value={state.from} onChange={e => state.setFrom(e.target.value)} /></label><label>Data final<Input type="date" aria-label="Data final" value={state.to} min={state.from || undefined} onChange={e => state.setTo(e.target.value)} /></label>{error && <p role="alert">{error}</p>}</div>;
}