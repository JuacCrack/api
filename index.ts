import { Hono } from 'hono';
import { apiRouter } from './routes';

const app = new Hono();

app.use('*', async (c, next) => {
  c.res.headers.append('Access-Control-Allow-Origin', '*');
  c.res.headers.append('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.res.headers.append('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (c.req.method === 'OPTIONS') {
    c.status(204);
    return c.text('');
  }
  await next();
});

app.route('/api', apiRouter);

export default {
  port: 5000,
  fetch: app.fetch,
};

// bun --watch run index.ts

// C:\Users\Joa\.bun\bin\api