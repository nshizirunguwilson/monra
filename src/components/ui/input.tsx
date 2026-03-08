"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full h-10 px-3 rounded-[var(--radius-md)] bg-bg-tertiary border border-border text-text-primary placeholder:text-text-muted text-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            error && "border-expense focus:ring-expense",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-expense">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
