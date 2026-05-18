import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://bloghub-sigma.vercel.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/u/'],
        disallow: ['/dashboard/', '/api/', '/login', '/signup', '/onboarding'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
