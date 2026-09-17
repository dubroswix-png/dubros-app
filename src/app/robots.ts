import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/mi-cuenta/',
          '/login',
          '/reset-password',
          '/onboarding',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://dubros.com/sitemap.xml',
  };
}
