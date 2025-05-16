import { Hono } from 'hono'
import { apiRouter } from './routes'

const app = new Hono()

app.use('*', async (c, next) => {
  c.res.headers.append('Access-Control-Allow-Origin', '*')
  c.res.headers.append('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  c.res.headers.append('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (c.req.method === 'OPTIONS') {
    c.status(204)
    return c.text('')
  }
  await next()
})

app.route('/api', apiRouter)

app.get('/', (c) => c.text('API running'))

Bun.serve({
  port: Number(process.env.PORT) || 5000,
  fetch: app.fetch,
})

console.log(`Server running on http://localhost:${process.env.PORT || 5000}`)

// bun --watch run index.ts

// C:\Users\Joa\.bun\bin\api