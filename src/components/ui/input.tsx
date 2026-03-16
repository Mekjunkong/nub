import { forwardRef, type InputHTMLAttributes, useId } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helpText, id: externalId, ...props }, ref) => {
    const generatedId = useId();
    const id = externalId || generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-text"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "h-10 w-full rounded-lg border bg-surface px-3 py-2 text-sm text-text transition-colors",
            "placeholder:text-text-muted",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
            error
              ? "border-danger focus:ring-danger"
              : "border-border hover:border-border-hover",
            className
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            error ? `${id}-error` : helpText ? `${id}-help` : undefined
          }
          {...props}
        />
        {error && (
          <p id={`${id}-error`} className="text-xs text-danger">
            {error}
          </p>
        )}
        {helpText && !error && (
          <p id={`${id}-help`} className="text-xs text-text-muted">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
