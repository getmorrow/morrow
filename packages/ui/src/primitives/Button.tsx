import type { AnchorHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "primary" ? "button-primary" : "button-secondary";

  return (
    <a
      className={["button", variantClass, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </a>
  );
}
