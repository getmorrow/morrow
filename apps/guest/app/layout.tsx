/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Deine Morrow Auszeit",
    template: "%s | Deine Morrow Auszeit",
  },
  description:
    "Der persönliche Gästebereich für Anreise, Buchung, Empfehlungen vor Ort, Hilfe und Feedback zur gebuchten Morrow Auszeit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
