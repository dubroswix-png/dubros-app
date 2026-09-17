import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog y Novedades del Sector Óptico',
  description: 'Artículos, tendencias, materiales de monturas y consejos comerciales para profesionales y distribuidores del sector óptico en Latinoamérica.',
  keywords: [
    'blog óptica',
    'tendencias en monturas',
    'ópticas Latinoamérica',
    'noticias sector óptico',
    'Dubros Eyewear blog',
  ],
  openGraph: {
    title: 'Blog y Novedades del Sector Óptico | Dubros Eyewear',
    description: 'Tendencias, materiales y novedades para ópticas y distribuidores mayoristas.',
    url: 'https://dubros.com/blog',
    siteName: 'Dubros Eyewear',
    images: [
      {
        url: 'https://dubros.com/images/logo.png',
        width: 1024,
        height: 553,
        alt: 'Blog Dubros Eyewear',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog del Sector Óptico | Dubros Eyewear',
    description: 'Tendencias y novedades para profesionales de la visión.',
    images: ['https://dubros.com/images/logo.png'],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
