import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // Thay bằng domain thật của bạn (hoặc lấy từ biến môi trường)
  const baseUrl = 'https://seo-audit-tool.vercel.app';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}