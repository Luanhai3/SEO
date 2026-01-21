import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SEO Audit Tool - Web3 Edition',
    short_name: 'SEO Audit',
    description: 'Phân tích SEO Website siêu tốc độ với giao diện Web3.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050505',
    theme_color: '#06b6d4',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}