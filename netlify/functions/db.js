import pkg from 'pg';
const { Pool } = pkg;

// Prefer Netlify-provided connection string (integration sets `NETLIFY_DATABASE_URL`).
// Fall back to `DATABASE_URL` for compatibility if needed.
const connectionString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

// Don't throw at module load time - that breaks Netlify functions
if (!connectionString) {
  console.warn('Warning: Database connection string not set. Queries will fail until DATABASE_URL or NETLIFY_DATABASE_URL is configured.');
}

// Lazy-load pool for serverless environments (Netlify functions)
let pool = null;

function getPool() {
  if (!pool) {
    if (!connectionString) {
      throw new Error('Database connection string not set in environment (DATABASE_URL or NETLIFY_DATABASE_URL)');
    }
    
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      // Netlify-specific optimizations
      max: 1,                    // Single connection for functions
      idleTimeoutMillis: 10000,  // Close idle connections quickly
      connectionTimeoutMillis: 5000
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      // Reset pool to attempt reconnection on next call
      pool = null;
    });
  }
  return pool;
}

// Helper function to execute queries
export async function query(text, params = []) {
  const start = Date.now();
  try {
    const p = getPool();
    const result = await p.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    // Reset pool on error
    if (pool) {
      pool = null;
    }
    throw error;
  }
}

// Helper function to get a single row
export async function getOne(text, params = []) {
  const result = await query(text, params);
  return result.rows[0];
}

// Helper function to get all rows
export async function getAll(text, params = []) {
  const result = await query(text, params);
  return result.rows;
}

// Helper function for transactions
export async function transaction(callback) {
  const p = getPool();
  const client = await p.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export default getPool;
