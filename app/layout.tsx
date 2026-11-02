import type { Metadata, Viewport } from "next";
import { Creepster, Inter } from "next/font/google";
import "./globals.css";

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Creepster({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Galería Halloween 🎃",
  description: "Fotos de la fiesta de Halloween — descárgalas antes de que se esfumen.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d0510",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
