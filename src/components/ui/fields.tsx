"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  optional?: boolean;
  className?: string;
  children: (id: string, describedBy: string | undefined) => ReactNode;
}

export function FieldShell({ label, error, hint, required, optional, className, children }: FieldShellProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        {required ? <span className="text-danger" aria-hidden> *</span> : null}
        {optional ? <span className="ml-1 font-normal text-body">(optional)</span> : null}
      </label>
      {children(id, describedBy)}
      {error ? (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type TextFieldProps = Omit<ComponentProps<"input">, "id"> & {
  label: string;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
  containerClassName?: string;
};

export function TextField({ label, error, hint, optional, required, containerClassName, className, ...rest }: TextFieldProps) {
  return (
    <FieldShell label={label} error={error} hint={hint} required={required} optional={optional} className={containerClassName}>
      {(id, describedBy) => (
        <input
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn("field-input", className)}
          {...rest}
        />
      )}
    </FieldShell>
  );
}

type TextareaFieldProps = Omit<ComponentProps<"textarea">, "id"> & {
  label: string;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
  containerClassName?: string;
};

export function TextareaField({ label, error, hint, optional, required, containerClassName, className, ...rest }: TextareaFieldProps) {
  return (
    <FieldShell label={label} error={error} hint={hint} required={required} optional={optional} className={containerClassName}>
      {(id, describedBy) => (
        <textarea
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn("field-input", className)}
          {...rest}
        />
      )}
    </FieldShell>
  );
}

type SelectFieldProps = Omit<ComponentProps<"select">, "id"> & {
  label: string;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
  containerClassName?: string;
};

export function SelectField({ label, error, hint, optional, required, options, placeholder, containerClassName, className, ...rest }: SelectFieldProps) {
  return (
    <FieldShell label={label} error={error} hint={hint} required={required} optional={optional} className={containerClassName}>
      {(id, describedBy) => (
        <select
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn("field-input", className)}
          {...rest}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

export function Checkbox({ label, description, className, ...rest }: Omit<ComponentProps<"input">, "type"> & { label: ReactNode; description?: ReactNode }) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 text-sm", className)}>
      <input type="checkbox" className="mt-0.5 h-4.5 w-4.5 shrink-0 cursor-pointer rounded-sm border-line accent-ink" {...rest} />
      <span>
        <span className="font-medium text-ink">{label}</span>
        {description ? <span className="mt-0.5 block text-body">{description}</span> : null}
      </span>
    </label>
  );
}

interface ChoiceOption<T extends string> {
  value: T;
  label: string;
  description?: ReactNode;
  icon?: ReactNode;
  aside?: ReactNode;
  disabled?: boolean;
}

/** Card-style radio group (delivery method, payment method, customer type…). */
export function ChoiceCards<T extends string>({
  name,
  legend,
  value,
  onChange,
  options,
  columns = 2,
  error,
  hideLegend,
}: {
  name: string;
  legend: string;
  value: T | undefined;
  onChange: (value: T) => void;
  options: ChoiceOption<T>[];
  columns?: 1 | 2 | 3 | 4;
  error?: string;
  hideLegend?: boolean;
}) {
  return (
    <fieldset>
      <legend className={cn("field-label", hideLegend && "sr-only")}>{legend}</legend>
      <div
        className={cn(
          "grid gap-3",
          columns === 2 && "sm:grid-cols-2",
          columns === 3 && "sm:grid-cols-3",
          columns === 4 && "grid-cols-2 lg:grid-cols-4",
        )}
      >
        {options.map((o) => {
          const checked = value === o.value;
          return (
            <label
              key={o.value}
              className={cn(
                "relative flex cursor-pointer items-start gap-3 rounded-md border bg-white p-4 transition-colors",
                checked ? "border-ink ring-1 ring-ink" : "border-line hover:border-muted",
                o.disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={checked}
                disabled={o.disabled}
                onChange={() => onChange(o.value)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
              />
              {o.icon ? <span className="mt-0.5 shrink-0 text-ink">{o.icon}</span> : null}
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-ink">{o.label}</span>
                  {o.aside ? <span className="text-sm font-semibold text-ink">{o.aside}</span> : null}
                </span>
                {o.description ? <span className="mt-1 block text-[0.8125rem] leading-snug text-body">{o.description}</span> : null}
              </span>
            </label>
          );
        })}
      </div>
      {error ? <p className="field-error">{error}</p> : null}
    </fieldset>
  );
}
