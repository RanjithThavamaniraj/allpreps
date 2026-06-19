import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const analyticsPath = path.resolve(__dirname, 'data/analytics.json')
const proInterestPath = path.resolve(__dirname, 'data/pro-interest.json')

const DEFAULT_ANALYTICS = {
  interview_started: 0,
  weekly_limit_hit: 0,
  upgrade_clicked: 0,
  pro_interest_submitted: 0,
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    return fallback
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n')
}

function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

async function sendProInterestEmail(entry, env) {
  const apiKey = env.RESEND_API_KEY
  const to = env.ADMIN_NOTIFICATION_EMAIL
  if (!apiKey || !to) {
    console.warn('[pro-interest] RESEND_API_KEY or ADMIN_NOTIFICATION_EMAIL not set — skipping email')
    return
  }

  const from = env.RESEND_FROM_EMAIL || 'AllPreps <onboarding@resend.dev>'
  const text = [
    'New user interested in AllPreps Pro',
    '',
    'Name:',
    entry.name,
    '',
    'Email:',
    entry.email,
    '',
    'Technology Track:',
    entry.track,
    '',
    'Would Pay ₹299:',
    entry.payment_interest,
    '',
    'Timestamp:',
    entry.timestamp,
  ].join('\n')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: '🚀 New AllPreps Pro Interest',
      text,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Resend API error (${response.status}): ${body}`)
  }
}

function incrementAnalyticsEvent(event) {
  const data = { ...DEFAULT_ANALYTICS, ...readJson(analyticsPath, DEFAULT_ANALYTICS) }
  if (event && typeof data[event] === 'number') {
    data[event] += 1
  }
  writeJson(analyticsPath, data)
  return data
}

function allprepsApiPlugin(mode) {
  return {
    name: 'allpreps-api',
    configureServer(server) {
      const env = loadEnv(mode, process.cwd(), '')

      server.middlewares.use('/api/analytics', (req, res, next) => {
        if (req.method === 'GET') {
          try {
            const data = { ...DEFAULT_ANALYTICS, ...readJson(analyticsPath, DEFAULT_ANALYTICS) }
            sendJson(res, 200, data)
          } catch {
            sendJson(res, 500, { error: 'Failed to read analytics' })
          }
          return
        }

        if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', () => {
            try {
              const { event } = JSON.parse(body)
              const data = incrementAnalyticsEvent(event)
              sendJson(res, 200, data)
            } catch {
              sendJson(res, 500, { error: 'Failed to update analytics' })
            }
          })
          return
        }

        next()
      })

      server.middlewares.use('/api/pro-interest', (req, res, next) => {
        if (req.method === 'GET') {
          try {
            const entries = readJson(proInterestPath, [])
            sendJson(res, 200, entries)
          } catch {
            sendJson(res, 500, { error: 'Failed to read pro interest data' })
          }
          return
        }

        if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body)
              const name = String(payload.name || '').trim()
              const email = String(payload.email || '').trim()
              const track = String(payload.track || '').trim()
              const payment_interest = String(payload.payment_interest || '').trim()

              if (!name || !email || !track || !payment_interest) {
                sendJson(res, 400, { error: 'Missing required fields' })
                return
              }

              const entry = {
                name,
                email,
                track,
                payment_interest,
                timestamp: new Date().toISOString(),
              }

              const entries = readJson(proInterestPath, [])
              entries.push(entry)
              writeJson(proInterestPath, entries)

              try {
                await sendProInterestEmail(entry, env)
              } catch (err) {
                console.error('[pro-interest] Email failed:', err.message)
              }

              sendJson(res, 201, entry)
            } catch {
              sendJson(res, 500, { error: 'Failed to save pro interest submission' })
            }
          })
          return
        }

        next()
      })
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), allprepsApiPlugin(mode)],
}))
