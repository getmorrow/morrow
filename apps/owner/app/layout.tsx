/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Morrow Eigentümerbereich",
    template: "%s | Morrow Eigentümerbereich",
  },
  description:
    "Der Morrow Eigentümerbereich zeigt Objekte, Buchungen, freie Zeiträume, Vermarktung und Abrechnung transparent an einem Ort.",
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
