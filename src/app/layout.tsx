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
  description: "Más de 25 años distribuyendo monturas ópticas y gafas de sol de alta calidad para ópticas y distribuidores en Latinoamérica desde Zona Libre de Colón, Panamá.",
  keywords: [
    "óptica mayorista",
    "monturas al por mayor",
    "aros ópticos",
    "lentes de sol mayoreo",
    "distribuidor óptico Latinoamérica",
    "Dubros Eyewear",
    "Dubros International",
    "Zona Libre de Colón",
    "ópticas Panamá",
    "ópticas Colombia",
    "ópticas Costa Rica",
    "ópticas Paraguay",
    "B2B óptico",
  ],
  authors: [{ name: 'Dubros International' }],
  creator: 'Dubros Eyewear',
  publisher: 'Dubros International',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://dubros.com',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "Dubros Eyewear | Distribución Óptica B2B en Latinoamérica",
    description: "Catálogo exclusivo para profesionales ópticos y distribuidores mayoristas. Monturas y gafas de sol desde Zona Libre de Colón.",
    url: "https://dubros.com",
    siteName: "Dubros Eyewear",
    images: [
      {
        url: "/images/logo.png",
        width: 1024,
        height: 553,
        alt: "Dubros Eyewear Logo",
      },
    ],
    locale: "es_PA",
    type: "website",
  },
  twitter: {
    card: 'summary_large_image',
    title: "Dubros Eyewear | Distribución Óptica B2B en Latinoamérica",
    description: "Distribución mayorista de monturas ópticas y gafas de sol de alta calidad para ópticas y distribuidores en Latinoamérica.",
    images: ["/images/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WholesaleStore',
  name: 'Dubros Eyewear',
  alternateName: 'Dubros International',
  url: 'https://dubros.com',
  logo: 'https://dubros.com/images/logo.png',
  description: 'Más de 25 años distribuyendo monturas ópticas y gafas de sol de alta calidad para ópticas y distribuidores en Latinoamérica desde Zona Libre de Colón.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Zona Libre de Colón',
    addressLocality: 'Colón',
    addressCountry: 'PA',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+507 6000-0000',
    contactType: 'customer service',
    availableLanguage: ['Spanish', 'English'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-theme="light">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
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
