import NextAuth, {type NextAuthOptions, Theme} from 'next-auth'
import {createOptions} from '@skillrecordings/skill-api'
import {NextApiRequest, NextApiResponse} from 'next'
import GitHubProvider from 'next-auth/providers/github'

const productTheme: Theme = {
  colorScheme: 'auto',
  brandColor: '#10172a',
}

// Add your allowed callback domains here
const allowedCallbackDomains = [
  'scriptkit.com',
  'dev-scriptkit.vercel.app',
  'staging-scriptkit.vercel.app',
  'localhost:3000',
  'localhost:3001',
  // Add a pattern for dynamic Vercel preview URLs
  'script-generator-git-main-skillrecordings.vercel.app',
  'script-generator-*.vercel.app',
]

const isAllowedDomain = (url: string) => {
  try {
    const hostname = new URL(url).hostname
    return allowedCallbackDomains.some((domain) => {
      // Handle wildcard patterns
      if (domain.includes('*')) {
        const pattern = domain.replace('*', '.*')
        return new RegExp(pattern).test(hostname)
      }
      return hostname === domain || hostname.endsWith(`.${domain}`)
    })
  } catch {
    return false
  }
}

const providers = [
  GitHubProvider({
    clientId: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
    allowDangerousEmailAccountLinking: true,
  }),
]

export const nextAuthOptions: NextAuthOptions = {
  ...createOptions({
    theme: productTheme,
  }),
  callbacks: {
    async redirect({url, baseUrl}: {url: string; baseUrl: string}) {
      // First check if it's a relative URL
      if (url.startsWith('/')) return `${baseUrl}${url}`

      // Then check our allowed domains
      if (isAllowedDomain(url)) {
        return url
      }

      // Fall back to base URL
      return baseUrl
    },
  },
}

export default async function NextAuthEndpoint(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  return await NextAuth(req, res, nextAuthOptions)
}
