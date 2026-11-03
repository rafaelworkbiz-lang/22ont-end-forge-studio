import { CalendarDays, CircleDollarSign } from 'lucide-react';

type Props = { date: string; revenue: string; profit: string; status: string; demo?: boolean; detail?: string; title?: string };

function FlagBrazil() {
  return (
    <svg className="sales-flag" viewBox="0 0 28 20" role="img" aria-label="Brasil" focusable="false">
      <rect width="28" height="20" rx="2.5" fill="#009c3b" />
      <path d="M14 2.2 25.6 10 14 17.8 2.4 10Z" fill="#ffdf00" />
      <circle cx="14" cy="10" r="4.7" fill="#002776" />
      <g clipPath="url(#ap-flag-band)">
        <path d="M8.6 12.6C11.8 8.4 17 7.6 20.2 10.4" stroke="#fff" strokeWidth="1.3" fill="none" />
      </g>
      <defs>
        <clipPath id="ap-flag-band">
          <circle cx="14" cy="10" r="4.7" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function SalesTodaySummary({ date, revenue, profit, status, demo = false, detail, title = 'Vendas de hoje' }: Props) {
  return <section className="sales-today" aria-label={title}>
    <div className="sales-today-band"><span className="sales-eyebrow">AFILIAPLACE · SEUS RESULTADOS</span><h1>{title}</h1></div>
    <div className="sales-today-content">
      <div className="sales-date"><CalendarDays size={13} /><span>{date} ·</span><FlagBrazil /><span>Brasil</span></div>
      <span className="sales-total-label">{demo ? 'Faturamento' : 'Vendas atribuídas'}</span>
      <strong className="sales-today-value" data-testid="today-revenue">{revenue}</strong>
      <div className="sales-today-profit"><CircleDollarSign size={18} /><span>{demo ? 'Comissões' : 'Lucro · comissões confirmadas'}</span><strong>{profit}</strong></div>
      <div className="sales-today-meta"><span className="sales-summary-status"><i />{status}</span>{detail && <span>{detail}</span>}</div>
    </div>
  </section>;
}
