import type { HTMLAttributes, ReactNode } from "react";

type EyebrowProps = HTMLAttributes<HTMLParagraphElement> & {
  children: ReactNode;
};

export function Eyebrow({ children, className, ...props }: EyebrowProps) {
  return (
    <p className={["eyebrow", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </p>
  );
}
