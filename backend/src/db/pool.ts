import { Pool } from 'pg';
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required. Copy .env.example to .env.');
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
