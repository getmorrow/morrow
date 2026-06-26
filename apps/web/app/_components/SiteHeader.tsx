import { navigationItems } from "@morrow/domain";

export function SiteHeader() {
  return (
    <header className="site-header">
      <a aria-label="Morrow Startseite" href="/">
        <img alt="morrow" src="/brand/morrow-wordmark-offblack.svg" />
      </a>
      <nav aria-label="Hauptnavigation" className="site-nav">
        {navigationItems.map((item) => (
          <a href={item.href} key={item.href}>
            {item.label}
          </a>
        ))}
        <a
          className="header-cta"
          data-conversion="cta_header_auszeit_planen"
          data-conversion-label="Header Auszeit planen"
          href="/#auszeiten"
        >
          Auszeit planen
        </a>
      </nav>
    </header>
  );
}
