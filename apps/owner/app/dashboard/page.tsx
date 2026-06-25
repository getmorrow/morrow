const ownerMetrics = [
  { label: "Aktive Objekte", value: "1", note: "Pilotbestand" },
  { label: "Auszeiten", value: "2", note: "sichtbare Anlässe" },
  { label: "Freie Lücken", value: "3", note: "prüfbare Zeiträume" },
  { label: "Auszahlung", value: "in Prüfung", note: "Monatsstatus" },
];

const ownerTasks = [
  "Bildrechte für neue Objektfotos bestätigen",
  "Freie Zeiträume für August prüfen",
  "Hausregel zu Hund und Schlüsselübergabe ergänzen",
];

const marketingSignals = [
  "Family Escape ist für Familien mit Kindern sichtbar",
  "Couple Reset nutzt ruhige Paarzeit als Reiseanlass",
  "Ratgeber verlinkt passende Auszeiten statt nur Tipps",
];

export default function OwnerDashboardPage() {
  return (
    <main className="owner-shell owner-dashboard">
      <div className="owner-container">
        <header className="owner-app-header">
          <a aria-label="Morrow Startseite" href="https://www.getmorrow.de">
            <img alt="morrow" src="/brand/morrow-wordmark-offblack.svg" />
          </a>
          <nav className="owner-dashboard-nav" aria-label="Eigentümerbereich">
            <a href="#objekte">Objekte</a>
            <a href="#buchungen">Buchungen</a>
            <a href="#vermarktung">Vermarktung</a>
            <a href="#abrechnung">Abrechnung</a>
          </nav>
        </header>

        <section className="owner-dashboard-hero">
          <p className="eyebrow">Eigentümerbereich</p>
          <h1>Alles Wichtige zu deinem Objekt an einem Ort.</h1>
          <p>
            Objekt, Auslastung, freie Zeiträume, Vermarktung, Aufgaben und
            Abrechnung werden hier so gebündelt, dass du schnell verstehst, was
            passiert und was als Nächstes wichtig ist.
          </p>
        </section>

        <section className="owner-metrics-grid" aria-label="Kennzahlen">
          {ownerMetrics.map((metric) => (
            <article className="owner-metric-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.note}</p>
            </article>
          ))}
        </section>

        <section className="owner-section owner-object-grid" id="objekte">
          <article className="owner-card owner-object-card">
            <img
              alt="Ferienimmobilie in Sankt Peter-Ording nahe der Dünen"
              src="/brand/generated/morrow-spo-interior.png"
            />
            <div>
              <p className="eyebrow">Objekt</p>
              <h2>Nordsee-Rückzugsort · Sankt Peter-Ording</h2>
              <p>
                Ausstattung, Regeln, Bildrechte, Check-in und zugeordnete
                Auszeiten werden hier verdichtet sichtbar, ohne dass du dich
                durch einzelne Listen arbeiten musst.
              </p>
            </div>
          </article>

          <aside className="owner-card">
            <p className="eyebrow">Objektstatus</p>
            <h2>Was gerade offen ist</h2>
            <ul>
              {ownerTasks.map((task) => (
                <li key={task}>{task}</li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="owner-section owner-dashboard-grid" id="buchungen">
          <article className="owner-card">
            <p className="eyebrow">Buchungen & Lücken</p>
            <h2>Kommende Zeiträume</h2>
            <div className="owner-status-list">
              <span>
                12.-16. August <strong>Family Escape</strong>
              </span>
              <span>
                19.-23. August <strong>Couple Reset</strong>
              </span>
              <span>
                Nebensaison <strong>Lückenangebot prüfen</strong>
              </span>
            </div>
          </article>

          <article className="owner-card" id="vermarktung">
            <p className="eyebrow">Vermarktung</p>
            <h2>Was Morrow sichtbar macht</h2>
            <ul>
              {marketingSignals.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="owner-section owner-dashboard-grid" id="abrechnung">
          <article className="owner-card">
            <p className="eyebrow">Abrechnung</p>
            <h2>Monatsstatus statt Blackbox</h2>
            <p>
              Umsatz, Kosten, Provision, Nettoauszahlung, Belege und der Stand
              der Monatsabrechnung werden nachvollziehbar zusammengeführt.
            </p>
          </article>

          <article className="owner-card">
            <p className="eyebrow">Zugriff & Rechte</p>
            <h2>Nur sehen, was zum eigenen Objekt gehört</h2>
            <p>
              Eigentümerprofile, Objekte, Buchungen und Abrechnungen werden mit
              klaren Rechten verknüpft, damit jeder Zugang nur die passenden
              Informationen zeigt.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
