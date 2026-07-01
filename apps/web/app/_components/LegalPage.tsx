import type { ReactNode } from "react";
import { Container } from "@morrow/ui";
import { PublicPageShell } from "./PublicPageShell";

type LegalSection = {
  title: string;
  children: ReactNode;
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  notice?: string;
  sections: LegalSection[];
};

export function LegalPage({
  eyebrow,
  title,
  intro,
  notice,
  sections,
}: LegalPageProps) {
  return (
    <PublicPageShell eyebrow={eyebrow} text={intro} title={title}>
      <section className="section legal-content-section">
        <Container className="legal-layout">
          {notice ? (
            <aside className="legal-notice" aria-label="Hinweis zur Rechtsfassung">
              <span>Hinweis</span>
              <p>{notice}</p>
            </aside>
          ) : null}
          <div className="legal-content">
            {sections.map((section) => (
              <section className="legal-block" key={section.title}>
                <h2>{section.title}</h2>
                <div className="legal-copy">{section.children}</div>
              </section>
            ))}
          </div>
        </Container>
      </section>
    </PublicPageShell>
  );
}
