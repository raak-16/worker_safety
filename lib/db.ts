import { Pool } from 'pg';

function createPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    keepAlive: true,
  });
}

let pool = createPool();

function isTransientDbError(error: any) {
  const code = error?.code;
  return (
    code === 'ECONNRESET' ||
    code === 'ETIMEDOUT' ||
    code === 'EPIPE' ||
    code === '57P01' ||
    code === '57P02' ||
    code === '57P03'
  );
}

async function resetPool() {
  try {
    await pool.end();
  } catch {
    // ignore shutdown errors on a broken pool
  }
  pool = createPool();
}

export async function query(text: string, params?: any[]) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await pool.query(text, params);
    } catch (error: any) {
      if (attempt === 0 && isTransientDbError(error)) {
        await resetPool();
        continue;
      }
      throw error;
    }
  }

  throw new Error('Database query failed after retry');
}

export async function getClient() {
  return pool.connect();
}

export default pool;
