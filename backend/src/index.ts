import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { pool } from './db/pool';
async function start() {
  await pool.query('SELECT 1');
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  app.get('/health', async (_req, res) => { try { await pool.query('SELECT 1'); res.json({ status: 'ok' }); } catch { res.status(503).json({ status: 'database unavailable' }); } });
  app.use('/graphql', cors({ origin: (process.env.FRONTEND_ORIGIN || 'http://localhost:5173').split(',') }), express.json(), expressMiddleware(server));
  const port = Number(process.env.PORT || 4000);
  app.listen(port, () => console.log(`GraphQL: http://localhost:${port}/graphql`));
}
start().catch(err => { console.error(err); process.exit(1); });
