"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@morrow/supabase";

export function OwnerLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(
    "Zugang erhalten nur freigeschaltete Eigentümer. Externe Registrierung ist nicht vorgesehen.",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("Zugang wird geprüft.");

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage("Die Zugangsdaten konnten nicht zugeordnet werden.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setMessage(
        "Der Login ist vorbereitet. Für die Nutzung müssen die Supabase-Umgebungsvariablen in dieser App gesetzt sein.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="owner-login-form" onSubmit={handleSubmit}>
      <label>
        E-Mail
        <input
          autoComplete="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>
      <label>
        Passwort
        <input
          autoComplete="current-password"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </label>
      <button className="owner-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Prüfen" : "Einloggen"}
      </button>
      <p className="owner-login-message">{message}</p>
    </form>
  );
}
