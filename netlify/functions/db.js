import pkg from 'pg';
const { Pool } = pkg;

// Prefer Netlify-provided connection string (integration may set NETLIFY_DATABASE_URL)
const connectionString = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

if (!connectionString) {
  console.error('Database connection string not set. Please set `DATABASE_URL` or `NETLIFY_DATABASE_URL`.');
  throw new Error('Database connection string not set in environment (DATABASE_URL or NETLIFY_DATABASE_URL)');
}

// Initialize connection pool
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Helper function to execute queries
export async function query(text, params = []) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
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
  const client = await pool.connect();
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

export default pool;
