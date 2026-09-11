export * from '@/types/models';
import type { BlogPost, Country } from '@/types/models';

import bubbleBlog from './bubble_blog.json';

export const MOCK_BLOG_POSTS: BlogPost[] = bubbleBlog as BlogPost[];

export const LATAM_COUNTRIES: Country[] = [
  { name: 'Panamá', code: 'PA', dialCode: '+507', flag: '🇵🇦' },
  { name: 'Colombia', code: 'CO', dialCode: '+57', flag: '🇨🇴' },
  { name: 'Ecuador', code: 'EC', dialCode: '+593', flag: '🇪🇨' },
  { name: 'Costa Rica', code: 'CR', dialCode: '+506', flag: '🇨🇷' },
  { name: 'Guatemala', code: 'GT', dialCode: '+502', flag: '🇬🇹' },
  { name: 'Honduras', code: 'HN', dialCode: '+504', flag: '🇭🇳' },
  { name: 'Venezuela', code: 'VE', dialCode: '+58', flag: '🇻🇪' },
  { name: 'México', code: 'MX', dialCode: '+52', flag: '🇲🇽' },
  { name: 'Perú', code: 'PE', dialCode: '+51', flag: '🇵🇪' },
  { name: 'Chile', code: 'CL', dialCode: '+56', flag: '🇨🇱' },
  { name: 'República Dominicana', code: 'DO', dialCode: '+1', flag: '🇩🇴' },
  { name: 'El Salvador', code: 'SV', dialCode: '+503', flag: '🇸🇻' },
  { name: 'Argentina', code: 'AR', dialCode: '+54', flag: '🇦🇷' },
  { name: 'Uruguay', code: 'UY', dialCode: '+598', flag: '🇺🇾' },
  { name: 'Paraguay', code: 'PY', dialCode: '+595', flag: '🇵🇾' },
  { name: 'Bolivia', code: 'BO', dialCode: '+591', flag: '🇧🇴' },
  { name: 'Nicaragua', code: 'NI', dialCode: '+505', flag: '🇳🇮' },
  { name: 'Cuba', code: 'CU', dialCode: '+53', flag: '🇨🇺' },
  { name: 'Puerto Rico', code: 'PR', dialCode: '+1', flag: '🇵🇷' },
  { name: 'Brasil', code: 'BR', dialCode: '+55', flag: '🇧🇷' },
  { name: 'España', code: 'ES', dialCode: '+34', flag: '🇪🇸' },
  { name: 'Estados Unidos', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'Belice', code: 'BZ', dialCode: '+501', flag: '🇧🇿' },
  { name: 'Guyana', code: 'GY', dialCode: '+592', flag: '🇬🇾' },
  { name: 'Surinam', code: 'SR', dialCode: '+597', flag: '🇸🇷' },
  { name: 'Trinidad y Tobago', code: 'TT', dialCode: '+1', flag: '🇹🇹' },
  { name: 'Jamaica', code: 'JM', dialCode: '+1', flag: '🇯🇲' },
  { name: 'Haití', code: 'HT', dialCode: '+509', flag: '🇭🇹' },
  { name: 'Curazao', code: 'CW', dialCode: '+599', flag: '🇨🇼' },
  { name: 'Aruba', code: 'AW', dialCode: '+297', flag: '🇦🇼' },
];



