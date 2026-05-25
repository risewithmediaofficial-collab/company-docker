import { Inbox, Search } from 'lucide-react';
import { cn } from '../../utils/cn';

const toneStyles = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-emerald-500/10 text-emerald-600',
  info: 'bg-blue-500/10 text-blue-600',
  warning: 'bg-amber-500/10 text-amber-600',
  danger: 'bg-red-500/10 text-red-600',
  violet: 'bg-violet-500/10 text-violet-600',
  neutral: 'bg-secondary text-muted-foreground',
};

export const PageHeader = ({
  eyebrow,
  title,
  actions,
  children,
  className,
}) => (
  <section
    className={cn(
      'overflow-hidden rounded-[30px] border border-border bg-gradient-to-br from-background via-background to-secondary/70 shadow-sm',
      className,
    )}
  >
    <div className="p-5 sm:p-6 lg:p-7">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl min-w-0">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">{eyebrow}</p>
          ) : null}
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        </div>

        {actions ? <div className="flex flex-wrap items-center gap-3 xl:justify-end">{actions}</div> : null}
      </div>

      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  </section>
);

export const MetricGrid = ({ children, className }) => (
  <div className={cn('grid gap-3 sm:grid-cols-2 xl:grid-cols-4', className)}>{children}</div>
);

export const MetricCard = ({ label, value, icon: Icon, tone = 'primary', className }) => (
  <div
    className={cn(
      'rounded-[24px] border border-border/80 bg-card/90 px-4 py-4 shadow-sm backdrop-blur-sm',
      className,
    )}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{value}</p>
      </div>
      {Icon ? (
        <div className={cn('rounded-2xl p-3', toneStyles[tone] || toneStyles.primary)}>
          <Icon size={18} />
        </div>
      ) : null}
    </div>
  </div>
);

export const PageToolbar = ({ children, className }) => (
  <div className={cn('rounded-[24px] border border-border/80 bg-card/85 p-3 shadow-sm backdrop-blur-sm', className)}>
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">{children}</div>
  </div>
);

export const SearchField = ({ value, onChange, placeholder, className, inputClassName }) => (
  <div className={cn('relative flex-1', className)}>
    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn(
        'w-full rounded-2xl border border-border bg-background py-3 pl-11 pr-4 text-sm shadow-inner outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15',
        inputClassName,
      )}
    />
  </div>
);

export const SectionCard = ({ title, action, children, className }) => (
  <section className={cn('rounded-[28px] border border-border bg-card shadow-sm', className)}>
    {(title || action) ? (
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          {title ? <h2 className="text-lg font-bold text-foreground">{title}</h2> : null}
        </div>
        {action ? <div className="flex flex-wrap items-center gap-2">{action}</div> : null}
      </div>
    ) : null}
    <div className="p-5">{children}</div>
  </section>
);

export const StatusBadge = ({ children, tone = 'neutral', className }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold',
      toneStyles[tone] || toneStyles.neutral,
      className,
    )}
  >
    {children}
  </span>
);

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  action,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center rounded-[28px] border border-dashed border-border bg-card/60 px-6 py-16 text-center',
      className,
    )}
  >
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
      <Icon size={22} />
    </div>
    <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);
