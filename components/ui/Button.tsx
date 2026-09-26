import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'toggle';
type ButtonSize = 'sm' | 'md';

const base =
  'inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-colors disabled:pointer-events-none disabled:opacity-40';

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
};

const variants: Record<Exclude<ButtonVariant, 'toggle'>, string> = {
  primary: 'bg-[var(--mkt-ink)] text-white hover:bg-[var(--mkt-accent)]',
  secondary:
    'border border-[var(--mkt-line)] bg-[var(--mkt-paper)] text-[var(--mkt-ink)] hover:border-[var(--mkt-accent)] hover:bg-[var(--mkt-wash)]',
  ghost: 'bg-transparent text-[var(--mkt-muted)] hover:text-[var(--mkt-ink)]',
  danger:
    'border border-[var(--mkt-danger)] bg-transparent text-[var(--mkt-danger)] hover:bg-[var(--mkt-danger-soft)]',
};

type Shared = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  pressed?: boolean;
  className?: string;
  children: ReactNode;
};

type AsButton = Shared &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { href?: undefined };

type AsLink = Shared & { href: string };

export default function Button(props: AsButton | AsLink) {
  const variant = props.variant ?? 'primary';
  const size = props.size ?? 'md';
  const look =
    variant === 'toggle'
      ? props.pressed
        ? 'bg-[var(--mkt-ink)] text-white'
        : 'text-[var(--mkt-muted)] hover:text-[var(--mkt-ink)]'
      : variants[variant];
  const className = [base, sizes[variant === 'toggle' ? 'sm' : size], look, props.fullWidth ? 'w-full' : '', props.className]
    .filter(Boolean)
    .join(' ');

  if (props.href) {
    return (
      <Link href={props.href} className={className}>
        {props.children}
      </Link>
    );
  }

  const { variant: _variant, size: _size, fullWidth: _full, pressed: _pressed, className: _class, href: _href, ...buttonProps } =
    props;
  return (
    <button
      type={buttonProps.type ?? 'button'}
      aria-pressed={variant === 'toggle' ? Boolean(props.pressed) : undefined}
      className={className}
      {...buttonProps}
    />
  );
}
