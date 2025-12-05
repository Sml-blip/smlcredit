/**
 * Configuration module for database connection
 * Edit the values below to match your environment
 */

export const CONFIG = {
  // Database URL - set this to your Neon connection string
  // Get this from: Neon Console > Project > Connection string
  DATABASE_URL: process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_NuDlHBFP3K2L@ep-lucky-cell-aeuo47hk-pooler.c-2.us-east-2.aws.neon.tech/smlcredit?sslmode=require&channel_binding=require',
  
  // Admin PIN for authentication
  ADMIN_PIN: process.env.ADMIN_PIN || '1234'
};

export default CONFIG;
