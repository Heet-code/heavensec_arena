import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

// ============================================================
// BUTTON
// ============================================================

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haven-primary focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        primary:   'bg-haven-primary text-white hover:bg-haven-primary-dark',
        secondary: 'bg-white text-haven-text border border-haven-border hover:bg-haven-bg hover:border-haven-border-strong',
        ghost:     'text-haven-secondary hover:bg-haven-bg hover:text-haven-text',
        danger:    'bg-haven-red text-white hover:bg-red-700',
        success:   'bg-haven-success text-white hover:bg-green-700',
        outline:   'border border-haven-primary text-haven-primary hover:bg-haven-primary-light',
        ai:        'bg-haven-ai text-white hover:bg-violet-700',
      },
      size: {
        sm:   'h-8 px-3 text-xs',
        md:   'h-9 px-4 text-sm',
        lg:   'h-10 px-5 text-base',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, disabled, icon, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : icon}
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

// ============================================================
// BADGE
// ============================================================

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        default:  'bg-gray-100 text-gray-700 border-gray-200',
        primary:  'bg-blue-50 text-blue-700 border-blue-200',
        success:  'bg-green-50 text-green-700 border-green-200',
        warning:  'bg-amber-50 text-amber-700 border-amber-200',
        danger:   'bg-red-50 text-red-700 border-red-200',
        red:      'bg-red-50 text-red-700 border-red-200',
        blue:     'bg-blue-50 text-blue-700 border-blue-200',
        ai:       'bg-violet-50 text-violet-700 border-violet-200',
        info:     'bg-cyan-50 text-cyan-700 border-cyan-200',
        outline:  'bg-transparent text-haven-secondary border-haven-border',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
      },
    },
    defaultVariants: { variant: 'default', size: 'sm' },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />}
      {children}
    </span>
  );
}

// ============================================================
// CARD
// ============================================================

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({ className, padding = 'md', hover, children, ...props }: CardProps) {
  const paddingClass = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-7' }[padding];
  return (
    <div
      className={cn(
        'bg-haven-surface rounded-lg border border-haven-border shadow-card',
        hover && 'transition-shadow duration-150 hover:shadow-card-hover hover:border-haven-border-strong cursor-pointer',
        paddingClass,
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-start justify-between mb-4', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-base font-semibold text-haven-text leading-tight', className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-xs text-haven-muted mt-1', className)} {...props} />;
}

// ============================================================
// SEPARATOR
// ============================================================

export const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      'shrink-0 bg-haven-border',
      orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
      className
    )}
    {...props}
  />
));
Separator.displayName = SeparatorPrimitive.Root.displayName;

// ============================================================
// TABS
// ============================================================

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex items-center gap-0.5 rounded-lg bg-haven-bg p-1 border border-haven-border',
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-150',
      'text-haven-secondary hover:text-haven-text',
      'data-[state=active]:bg-white data-[state=active]:text-haven-text data-[state=active]:shadow-sm',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haven-primary',
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn('mt-4 focus-visible:outline-none', className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// ============================================================
// TOOLTIP
// ============================================================

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-md bg-haven-text px-2.5 py-1.5 text-xs text-white shadow-md',
      'animate-in fade-in-0 zoom-in-95',
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// ============================================================
// SCROLL AREA
// ============================================================

export const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root ref={ref} className={cn('relative overflow-hidden', className)} {...props}>
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      orientation="vertical"
      className="flex touch-none select-none transition-colors h-full w-1 border-l border-l-transparent p-[1px]"
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-haven-border-strong" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

// ============================================================
// SCORE RING
// ============================================================

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}

export function ScoreRing({ score, size = 100, strokeWidth = 9, color, className }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const ringColor = color ?? (score >= 80 ? '#2f8f72' : score >= 65 ? '#c4922a' : '#c45c52');

  return (
    <svg
      width={size}
      height={size}
      className={cn('rotate-[-90deg]', className)}
      aria-label={`Score: ${score} out of 100`}
    >
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#ece7de" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={ringColor} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  );
}

// ============================================================
// STATUS DOT
// ============================================================

interface StatusDotProps {
  color?: 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'violet';
  pulse?: boolean;
  size?: 'sm' | 'md';
}

const dotColorMap: Record<string, string> = {
  green: 'bg-haven-success', amber: 'bg-haven-warning',
  red: 'bg-haven-red', blue: 'bg-haven-primary',
  gray: 'bg-haven-muted', violet: 'bg-haven-ai',
};

export function StatusDot({ color = 'gray', pulse, size = 'sm' }: StatusDotProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full flex-shrink-0',
        dotColorMap[color],
        pulse && 'animate-pulse',
        size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'
      )}
    />
  );
}

// ============================================================
// PHASE LABEL
// ============================================================

const phaseConfig: Record<string, { label: string; className: string }> = {
  created:       { label: 'Created',       className: 'bg-gray-100 text-gray-600' },
  preparing:     { label: 'Preparing',     className: 'bg-cyan-50 text-cyan-700' },
  running:       { label: 'Running',       className: 'bg-blue-50 text-blue-700' },
  detecting:     { label: 'Detecting',     className: 'bg-amber-50 text-amber-700' },
  investigating: { label: 'Investigating', className: 'bg-amber-50 text-amber-700' },
  responding:    { label: 'Responding',    className: 'bg-red-50 text-red-600' },
  containing:    { label: 'Containing',    className: 'bg-red-50 text-red-600' },
  evaluating:    { label: 'Evaluating',    className: 'bg-violet-50 text-violet-700' },
  completed:     { label: 'Completed',     className: 'bg-green-50 text-green-700' },
};

export function PhaseLabel({ phase }: { phase: string }) {
  const cfg = phaseConfig[phase] ?? { label: phase, className: 'bg-gray-100 text-gray-600' };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-2xs font-semibold uppercase tracking-wider', cfg.className)}>
      {cfg.label}
    </span>
  );
}

// ============================================================
// SKELETON
// ============================================================

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-md shimmer-bg', className)}
      {...props}
    />
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {icon && <div className="text-haven-muted mb-4">{icon}</div>}
      <h3 className="text-base font-semibold text-haven-text mb-1.5">{title}</h3>
      <p className="text-sm text-haven-secondary max-w-xs mb-6">{description}</p>
      {action}
    </div>
  );
}

// ============================================================
// SECTION HEADER
// ============================================================

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-5 gap-4', className)}>
      <div>
        <h2 className="text-xl font-bold text-haven-text leading-tight">{title}</h2>
        {subtitle && <p className="text-sm text-haven-secondary mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// ============================================================
// METRIC CARD
// ============================================================

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  accent?: 'blue' | 'green' | 'red' | 'amber' | 'violet';
  className?: string;
}

const accentColorMap: Record<string, { text: string; bg: string }> = {
  blue:   { text: 'text-haven-primary', bg: 'bg-blue-50' },
  green:  { text: 'text-haven-success', bg: 'bg-green-50' },
  red:    { text: 'text-haven-red',     bg: 'bg-red-50' },
  amber:  { text: 'text-haven-warning', bg: 'bg-amber-50' },
  violet: { text: 'text-haven-ai',      bg: 'bg-violet-50' },
};

export function MetricCard({ label, value, sub, trend, trendValue, icon, accent = 'blue', className }: MetricCardProps) {
  const ac = accentColorMap[accent];
  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-2xs font-semibold uppercase tracking-wider text-haven-muted mb-1.5">{label}</p>
          <p className="text-3xl font-bold text-haven-text leading-none mb-1">{value}</p>
          {sub && <p className="text-xs text-haven-muted">{sub}</p>}
          {trendValue && (
            <p className={cn('text-xs font-medium mt-1',
              trend === 'up' ? 'text-haven-success' : trend === 'down' ? 'text-haven-red' : 'text-haven-muted'
            )}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', ac.bg, ac.text)}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// ============================================================
// LOADING SPINNER
// ============================================================

export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClass = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-8 h-8 border-3' }[size];
  return (
    <span className={cn(
      'inline-block rounded-full border-current border-t-transparent animate-spin',
      sizeClass, className
    )} />
  );
}

// ============================================================
// PROGRESS BAR
// ============================================================

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  className?: string;
  height?: string;
}

export function ProgressBar({ value, max = 100, color = '#3b82d4', className, height = 'h-1.5' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn('w-full bg-haven-bg rounded-full overflow-hidden', height, className)}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}
