import { publicRoutes } from "@morrow/domain";
import { Button } from "@morrow/ui";

export default function HomePage() {
  return (
    <main className="site-shell">
      <header className="site-header">
        <a aria-label="Morrow Startseite" href="/">
          <img alt="morrow" src="/brand/morrow-wordmark-offblack.svg" />
        </a>
        <nav aria-label="Hauptnavigation" className="site-nav">
          <a href={publicRoutes.stays}>Auszeiten</a>
          <a href={publicRoutes.guides}>Ratgeber</a>
          <a href={publicRoutes.owners}>Für Eigentümer</a>
          <a className="header-cta" href="#anfrage">
            Auszeit planen
          </a>
        </nav>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">Sankt Peter-Ording · Familien & Paare</p>
          <h1>Auszeiten, die vorbereitet statt beliebig wirken.</h1>
          <p className="hero-copy">
            Ausgewählte Unterkunft, lokales Erlebnis und persönliche Betreuung.
            Damit aus wenigen Tagen an der Nordsee eine ruhige, stimmige Zeit
            wird.
          </p>
          <div className="hero-actions">
            <Button href="#anfrage" variant="primary">
              Auszeit planen
            </Button>
            <Button href={publicRoutes.stays} variant="secondary">
              Auszeiten ansehen
            </Button>
          </div>
        </div>

        <aside aria-label="Morrow Fokus" className="hero-panel">
          <p className="eyebrow">Neues Fundament</p>
          <h2>SEO-Website zuerst.</h2>
          <p>
            Diese Next.js-App ist der Startpunkt für die neue öffentliche
            Website. Der bestehende Vite-Prototyp bleibt Funktionsreferenz.
          </p>
          <div className="proof-row">
            <div className="proof-card">
              <strong>01</strong>
              <span>crawlbares HTML</span>
            </div>
            <div className="proof-card">
              <strong>02</strong>
              <span>klare Domainmodelle</span>
            </div>
            <div className="proof-card">
              <strong>03</strong>
              <span>Supabase als Quelle</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="section" id="anfrage">
        <p className="eyebrow">Migrationsschnitt</p>
        <h2>Der Prototyp bleibt sichtbar, die Produktion wird neu gebaut.</h2>
        <p>
          Als Nächstes migrieren wir die öffentliche Website Abschnitt für
          Abschnitt: Startseite, Auszeiten, Eigentümerseite und Ratgeber. Alles,
          was SEO-relevant ist, wird statisch oder serverseitig gerendert.
        </p>
      </section>
    </main>
  );
}
