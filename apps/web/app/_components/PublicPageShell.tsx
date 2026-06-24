import type { ReactNode } from "react";
import { Container, SectionHeader } from "@morrow/ui";
import { SiteHeader } from "./SiteHeader";

type PublicPageShellProps = {
  eyebrow: string;
  title: string;
  text: ReactNode;
  children?: ReactNode;
};

export function PublicPageShell({
  eyebrow,
  title,
  text,
  children,
}: PublicPageShellProps) {
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="page-hero">
        <Container>
          <SectionHeader eyebrow={eyebrow} text={text} title={title} />
        </Container>
      </section>
      {children}
    </main>
  );
}
