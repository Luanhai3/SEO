import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://seo-audit-tool.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'], // Chặn bot index các trang API hoặc Admin
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}