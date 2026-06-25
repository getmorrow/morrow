import { AdminLoginForm } from "./AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main className="admin-shell">
      <div className="admin-login-grid">
        <section className="admin-login-copy">
          <a aria-label="Morrow Startseite" href="https://www.getmorrow.de">
            <img alt="morrow" src="/brand/morrow-wordmark-offblack.svg" />
          </a>
          <p className="admin-eyebrow">Morrow Admin</p>
          <h1>Steuerung für Anfragen, Buchungen und Aufenthalte.</h1>
          <p>
            Der Admin ist die Quelle der Wahrheit. Hier entstehen die Daten, die
            Website, Gäste-App und Eigentümerbereich als gezielte Ausschnitte
            sichtbar machen.
          </p>
          <div className="admin-login-points">
            {[
              "Anfragen und Buchungen prüfen",
              "Auszeiten, Objekte und Termine steuern",
              "Kommunikation und offene Aufgaben bündeln",
            ].map((point, index) => (
              <span key={point}>
                <strong>{String(index + 1).padStart(2, "0")}</strong>
                {point}
              </span>
            ))}
          </div>
        </section>

        <section className="admin-login-card" aria-label="Admin Login">
          <p className="admin-eyebrow">Login</p>
          <h2>Freigeschalteter Zugang</h2>
          <AdminLoginForm />
        </section>
      </div>
    </main>
  );
}
