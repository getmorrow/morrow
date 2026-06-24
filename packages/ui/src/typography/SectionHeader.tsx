import type { HTMLAttributes, ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";

type SectionHeaderProps = HTMLAttributes<HTMLDivElement> & {
  eyebrow?: string;
  title: string;
  text?: ReactNode;
};

export function SectionHeader({
  eyebrow,
  title,
  text,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={["section-header", className].filter(Boolean).join(" ")}
      {...props}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}
