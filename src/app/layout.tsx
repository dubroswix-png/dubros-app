import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppWidget } from "@/components/shared/WhatsAppWidget";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";

export const metadata: Metadata = {
  title: "Dubros | Distribución Óptica en Latinoamérica",
  description: "Más de 25 años distribuyendo monturas ópticas y gafas de sol de alta calidad para ópticas y distribuidores en Latinoamérica.",
  keywords: ["óptica", "monturas", "aros ópticos", "lentes de sol", "distribuidor óptico", "Dubros", "Panamá", "Latinoamérica"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-theme="light">
      <body>
        <CartProvider>
          <FavoritesProvider>
            <Navbar />
            <main>{children}</main>
            <WhatsAppWidget />
            <Footer />
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  );
}
