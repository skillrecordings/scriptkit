import {NextApiRequest, NextApiResponse} from 'next'
import crypto from 'crypto'

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET

function verifyGithubWebhook(req: NextApiRequest) {
  const signature = req.headers['x-hub-signature-256']
  if (!signature || !WEBHOOK_SECRET) return false

  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET)
  const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature as string),
    Buffer.from(digest),
  )
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  // Verify webhook signature
  if (!verifyGithubWebhook(req)) {
    return res.status(401).json({error: 'Invalid signature'})
  }

  const event = req.headers['x-github-event']
  const payload = req.body

  // Handle different webhook events
  switch (event) {
    case 'installation':
      // Handle app installation events
      console.log('App installation event:', payload.action)
      break
    case 'installation_repositories':
      // Handle repository installation events
      console.log('Repository installation event:', payload.action)
      break
    // Add more event handlers as needed
  }

  res.status(200).json({received: true})
}
