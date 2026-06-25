"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@morrow/supabase";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(
    "Zugang erhalten nur freigeschaltete Morrow Teammitglieder.",
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

      const { data: profile, error: profileError } = await supabase.rpc(
        "get_morrow_admin_profile",
      );

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setMessage("Dieser Zugang ist nicht fuer den Morrow Admin freigeschaltet.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setMessage("Der Login konnte gerade nicht geprüft werden.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="admin-login-form" onSubmit={handleSubmit}>
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
      <button className="admin-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Prüfen" : "Einloggen"}
      </button>
      <p className="admin-login-message">{message}</p>
    </form>
  );
}
