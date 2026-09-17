import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto y Asesoría Comercial B2B | Dubros Eyewear',
  description: 'Contáctanos para abrir tu cuenta mayorista o solicitar cotizaciones para tu óptica. Distribución desde Zona Libre de Colón para toda Latinoamérica.',
  keywords: [
    'contacto Dubros Eyewear',
    'asesoría mayorista óptica',
    'distribución óptica Zona Libre de Colón',
    'comprar monturas al por mayor',
  ],
  openGraph: {
    title: 'Contacto y Asesoría Comercial B2B | Dubros Eyewear',
    description: 'Atención personalizada para ópticas y distribuidores mayoristas en Latinoamérica.',
    url: 'https://dubros.com/contacto',
    siteName: 'Dubros Eyewear',
    images: [
      {
        url: 'https://dubros.com/images/logo.png',
        width: 1024,
        height: 553,
        alt: 'Dubros Eyewear Contacto',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contacto y Asesoría Comercial B2B | Dubros Eyewear',
    description: 'Atención personalizada para ópticas y distribuidores mayoristas en Latinoamérica.',
    images: ['https://dubros.com/images/logo.png'],
  },
};

export default function ContactoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
