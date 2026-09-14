import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppWidget } from "@/components/shared/WhatsAppWidget";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ToastProvider } from "@/context/ToastContext";
import { CartDrawer } from "@/components/cart/CartDrawer";

export const metadata: Metadata = {
  metadataBase: new URL('https://dubros.com'),
  title: {
    default: "Dubros Eyewear | Distribución Óptica B2B en Latinoamérica",
    template: "%s | Dubros Eyewear",
  },
  description: "Más de 25 años distribuyendo monturas ópticas y gafas de sol de alta calidad para ópticas y distribuidores en Latinoamérica desde Zona Libre de Colón.",
  keywords: ["óptica", "monturas", "aros ópticos", "lentes de sol", "distribuidor óptico", "Dubros", "Panamá", "Latinoamérica", "B2B"],
  icons: {
    icon: [
      { url: '/images/logo.svg', type: 'image/svg+xml' },
      { url: '/images/logo.png', type: 'image/png' },
    ],
    apple: [
      { url: '/images/logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: "Dubros Eyewear | Distribución Óptica B2B",
    description: "Catálogo exclusivo para profesionales ópticos y distribuidores mayoristas.",
    url: "https://dubros.com",
    siteName: "Dubros Eyewear",
    images: [
      {
        url: "/images/logo.png",
        width: 800,
        height: 600,
        alt: "Dubros Eyewear Logo",
      },
    ],
    locale: "es_PA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-theme="light">
      <body>
        <LanguageProvider>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <FavoritesProvider>
                  <Navbar />
                  <CartDrawer />
                  <main>{children}</main>
                  <WhatsAppWidget />
                  <Footer />
                </FavoritesProvider>
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
