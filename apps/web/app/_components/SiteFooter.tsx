import { publicRoutes } from "@morrow/domain";
import { Container } from "@morrow/ui";

const footerLinks = [
  { label: "Impressum", href: publicRoutes.imprint },
  { label: "Datenschutz", href: publicRoutes.privacy },
  { label: "AGB", href: publicRoutes.terms },
  { label: "Buchungsbedingungen", href: publicRoutes.bookingTerms },
  { label: "Stornobedingungen", href: publicRoutes.cancellationTerms },
  { label: "Zahlungsbedingungen", href: publicRoutes.paymentTerms },
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Container className="site-footer-grid">
        <div>
          <img alt="morrow" src="/brand/morrow-wordmark-offblack.svg" />
          <p>
            Kuratierte Auszeiten, ausgewählte Unterkünfte und persönliche
            Orientierung für Sankt Peter-Ording.
          </p>
        </div>
        <nav aria-label="Rechtliche Links">
          {footerLinks.map((link) => (
            <a href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
