import pg from 'pg';

const { Pool, types } = pg;

// Postgres int8 exceeds Number.MAX_SAFE_INTEGER in general, but these ids are
// sequence values. Parse them as numbers so JSON clients can use them directly.
types.setTypeParser(20, (value) => Number(value));

const pool = new Pool({
  host: process.env.PGHOST ?? 'localhost',
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE ?? 'budget_tracker',
  user: process.env.PGUSER ?? process.env.USER,
});

export default pool;
