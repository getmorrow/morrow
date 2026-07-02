export default function GuestLoginPage() {
  return (
    <main className="guest-page">
      <div className="guest-shell">
        <header className="guest-app-header">
          <a aria-label="Morrow Startseite" href="https://www.getmorrow.de">
            <img alt="morrow" src="/app/gast/brand/morrow-wordmark-offblack.svg" />
          </a>
        </header>

        <section className="guest-login-hero">
          <div>
            <p className="eyebrow">Deine Auszeit</p>
            <h1>Alles Wichtige an einem ruhigen Ort.</h1>
            <p>
              Nach der Buchung erhältst du deinen persönlichen Link. Dort liegen
              Anreise, Buchung, Empfehlungen vor Ort, Hilfe und Feedback
              gesammelt bereit.
            </p>
          </div>
          <a className="guest-primary-link" href="https://www.getmorrow.de/auszeiten">
            Auszeiten ansehen
          </a>
        </section>
      </div>
    </main>
  );
}
