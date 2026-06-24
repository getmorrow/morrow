import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

export function Card({ children, className, ...props }: CardProps) {
  return (
    <article className={["card", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </article>
  );
}
