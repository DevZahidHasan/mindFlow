import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type = "text", label, error, id, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    const baseInputStyle =
      "w-full px-4 h-10 bg-surface border border-border text-foreground rounded-lg font-sans transition-all duration-150 ease-out focus:border-accent focus:outline-none disabled:opacity-50 disabled:pointer-events-none";

    const errorInputStyle = error ? "border-danger focus:border-danger" : "";

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground select-none font-sans"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`${baseInputStyle} ${errorInputStyle} ${className}`}
          {...props}
        />
        {error && (
          <span
            id={`${inputId}-error`}
            role="alert"
            className="text-xs font-sans text-danger font-medium select-none"
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
