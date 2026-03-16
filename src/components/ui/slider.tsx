"use client";

import { forwardRef, type InputHTMLAttributes, useId } from "react";
import { cn } from "@/lib/utils";

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      label,
      showValue = true,
      formatValue,
      id: externalId,
      value,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = externalId || generatedId;
    const displayValue = formatValue
      ? formatValue(Number(value))
      : String(value);

    return (
      <div className="flex flex-col gap-2">
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && (
              <label htmlFor={id} className="text-sm font-medium text-text">
                {label}
              </label>
            )}
            {showValue && (
              <span className="text-sm font-medium text-primary">
                {displayValue}
              </span>
            )}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          type="range"
          value={value}
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-hover accent-primary",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider";
