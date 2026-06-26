import type { Metadata } from "next";
import { Analytics } from "./_components/Analytics";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Morrow | Kuratierte Auszeiten in Sankt Peter-Ording",
    template: "%s | Morrow",
  },
  description:
    "Morrow verbindet ausgewählte Unterkünfte, lokale Erlebnisse und persönliche Betreuung zu vorbereiteten Auszeiten in Sankt Peter-Ording.",
  metadataBase: new URL("https://www.getmorrow.de"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
