import { OwnerLoginForm } from "./OwnerLoginForm";

export default function OwnerLoginPage() {
  return (
    <main className="owner-shell">
      <div className="owner-container">
        <header className="owner-app-header">
          <a aria-label="Morrow Startseite" href="https://www.getmorrow.de">
            <img alt="morrow" src="/brand/morrow-wordmark-offblack.svg" />
          </a>
          <span>Eigentümerbereich</span>
        </header>

        <section className="owner-login-hero">
          <div className="owner-login-grid">
            <div className="owner-login-copy">
              <p className="eyebrow">Morrow Eigentümer</p>
              <h1>Transparenz für Objekt, Ertrag und nächste Schritte.</h1>
              <p>
                Der Eigentümerbereich zeigt, wie Morrow dein Objekt
                positioniert, welche Buchungen entstehen, welche Zeiträume frei
                sind und was operativ gerade wichtig ist.
              </p>
              <div className="owner-login-points">
                {[
                  "Objekte und Auszeiten",
                  "Buchungen und freie Lücken",
                  "Vermarktung, Status und Abrechnung",
                ].map((point, index) => (
                  <span key={point}>
                    <strong>{String(index + 1).padStart(2, "0")}</strong>
                    {point}
                  </span>
                ))}
              </div>
            </div>

            <section className="owner-login-card" aria-label="Login">
              <p className="eyebrow">Login</p>
              <h2>Freigeschalteter Zugang</h2>
              <OwnerLoginForm />
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
