import type { PropsWithChildren } from "react";

interface AnimatedBorderProps extends PropsWithChildren {
  className?: string;
}

export function AnimatedBorder({
  children,
  className = "",
}: AnimatedBorderProps) {
  return (
    <div className={`neon-border ${className}`}>
      <div className="neon-border__content">{children}</div>
    </div>
  );
}