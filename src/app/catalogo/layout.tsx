import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catálogo Mayorista de Monturas Ópticas y Gafas de Sol | Dubros Eyewear',
  description: 'Explora nuestro catálogo exclusivo B2B con más de 500 referencias de monturas ópticas y lentes de sol de alta calidad para ópticas y distribuidores mayoristas en Latinoamérica.',
  keywords: [
    'catálogo óptico mayorista',
    'monturas ópticas por mayor',
    'lentes de sol al por mayor',
    'distribución óptica Zona Libre de Colón',
    'Dubros Eyewear catálogo',
    'armazones ópticos B2B',
  ],
  openGraph: {
    title: 'Catálogo Mayorista de Monturas Ópticas y Gafas de Sol | Dubros Eyewear',
    description: 'Catálogo exclusivo B2B para profesionales de la visión y distribuidores mayoristas en América Latina.',
    url: 'https://dubros.com/catalogo',
    siteName: 'Dubros Eyewear',
    images: [
      {
        url: 'https://dubros.com/images/logo.png',
        width: 1024,
        height: 553,
        alt: 'Catálogo Dubros Eyewear',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Catálogo Mayorista de Monturas Ópticas | Dubros Eyewear',
    description: 'Monturas y gafas de sol de alta gama para ópticas y distribuidores mayoristas en Latinoamérica.',
    images: ['https://dubros.com/images/logo.png'],
  },
};

export default function CatalogoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
