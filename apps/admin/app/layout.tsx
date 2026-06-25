/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Morrow Admin",
    template: "%s | Morrow Admin",
  },
  description:
    "Interne Morrow Steuerung fuer Anfragen, Buchungen, Auszeiten, Objekte und Operations.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
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
