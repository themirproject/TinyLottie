import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // All standard web crawlers — allow public pages, disallow private/internal routes
        userAgent: '*',
        allow: ['/', '/llms.txt', '/lottie-compressor', '/privacy'],
        disallow: ['/api/', '/_next/', '/admin/', '/profile/'],
      },
      // --- LLM / AI crawlers — explicitly allowed for discoverability ---
      { userAgent: 'GPTBot',          allow: '/' },
      { userAgent: 'ChatGPT-User',    allow: '/' },
      { userAgent: 'OAI-SearchBot',   allow: '/' },
      { userAgent: 'ClaudeBot',       allow: '/' },
      { userAgent: 'Anthropic-ai',    allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'PerplexityBot',   allow: '/' },
      { userAgent: 'YouBot',          allow: '/' },
      { userAgent: 'Applebot',        allow: '/' },
      { userAgent: 'Bytespider',      allow: '/' },
      { userAgent: 'cohere-ai',       allow: '/' },
    ],
    sitemap: 'https://tinylottie.com/sitemap.xml',
    host:    'https://tinylottie.com',
  }
}
