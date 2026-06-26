import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VWRA Radar",
  description:
    "Painel EOD das ~50 maiores do VWRA — distância do ATH/mínimas e fundamentos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className="min-h-screen font-mono antialiased">{children}</body>
    </html>
  );
}
