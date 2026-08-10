import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyle =
      "inline-flex items-center justify-center font-sans font-medium select-none transition-all duration-150 ease-out border rounded-full focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-4 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]";

    const variantStyles = {
      primary:
        "bg-accent border-accent text-accent-foreground hover:bg-opacity-90 hover:scale-[1.02]",
      secondary:
        "bg-surface border-border text-foreground hover:bg-surface-elevated hover:border-muted hover:scale-[1.02]",
      tertiary:
        "bg-transparent border-transparent text-foreground hover:text-accent hover:bg-surface-subtle",
    };

    const sizeStyles = {
      sm: "px-4 py-1.5 text-sm h-8",
      md: "px-6 py-2 text-base h-10",
      lg: "px-8 py-3 text-lg h-12",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
