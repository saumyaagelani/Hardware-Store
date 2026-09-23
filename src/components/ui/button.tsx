import Link from "next/link";
import type { ComponentProps } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "dark" | "outline" | "outline-light" | "ghost" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-gold text-ink hover:bg-gold-dark border border-gold hover:border-gold-dark",
  dark: "bg-ink text-white hover:bg-ink-soft border border-ink",
  outline: "bg-white text-ink border border-ink hover:bg-ink hover:text-white",
  "outline-light": "bg-transparent text-white border border-white/40 hover:border-white hover:bg-white/10",
  ghost: "bg-transparent text-ink border border-transparent hover:bg-mist",
  danger: "bg-danger text-white border border-danger hover:opacity-90",
  link: "bg-transparent text-ink underline underline-offset-4 decoration-gold decoration-2 hover:decoration-ink px-0! h-auto!",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-[0.9375rem] gap-2",
  lg: "h-13 px-7 text-base gap-2.5",
  icon: "h-10 w-10 justify-center",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center rounded-md font-semibold whitespace-nowrap transition-colors",
    "disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-offset-2",
    variants[variant],
    sizes[size],
    className,
  );
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export function Button({ variant, size, loading, className, children, disabled, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize };

export function ButtonLink({ variant, size, className, ...rest }: ButtonLinkProps) {
  return <Link className={buttonClass(variant, size, className)} {...rest} />;
}
