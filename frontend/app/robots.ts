import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://seo-audit-tool.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'], // Chặn bot index các trang API hoặc Admin
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}