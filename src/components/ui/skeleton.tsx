import * as React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "pulse" | "shimmer" | "none";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "none",
  ...props
}) => {
  const baseStyle = "bg-surface-elevated rounded-md w-full select-none";

  const variantStyles = {
    none: "",
    pulse: "animate-pulse",
    shimmer:
      "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-foreground/5 before:to-transparent",
  };

  return (
    <div
      className={`${baseStyle} ${variantStyles[variant]} motion-reduce:animate-none motion-reduce:before:animate-none ${className}`}
      {...props}
    />
  );
};
