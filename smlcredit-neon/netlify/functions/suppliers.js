import { query, getOne, getAll } from './db.js';
import { checkAuth, errorResponse, successResponse, handleCors } from './auth.js';

export const handler = async (event) => {
  // Handle CORS preflight
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  // Check authentication
  const auth = checkAuth(event);
  if (!auth.authorized) {
    return errorResponse(401, auth.error);
  }

  try {
    const method = event.httpMethod;
    const path = event.path;
    const body = event.body ? JSON.parse(event.body) : {};

    // GET /api/suppliers - Get all suppliers
    if (method === 'GET' && path === '/.netlify/functions/suppliers') {
      const suppliers = await getAll(`
        SELECT 
          s.id, s.name, s.total_debt, s.phone, s.created_at,
          json_agg(
            json_build_object(
              'id', st.id,
              'amount', st.amount,
              'type', st.type,
              'date', st.date,
              'note', st.note
            ) ORDER BY st.date DESC
          ) FILTER (WHERE st.id IS NOT NULL) as transactions
        FROM suppliers s
        LEFT JOIN supplier_transactions st ON s.id = st.supplier_id
        GROUP BY s.id, s.name, s.total_debt, s.phone, s.created_at
        ORDER BY s.created_at DESC
      `);
      return successResponse(suppliers);
    }

    // POST /api/suppliers - Create new supplier
    if (method === 'POST' && path === '/.netlify/functions/suppliers') {
      const { id, name, totalDebt, phone, transactions } = body;

      if (!name) {
        return errorResponse(400, 'Name is required');
      }

      const now = Date.now();

      // Insert supplier
      await query(
        `INSERT INTO suppliers (id, name, total_debt, phone, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, name, totalDebt || 0, phone || null, now, now]
      );

      // Insert initial transactions if provided
      if (transactions && transactions.length > 0) {
        for (const tx of transactions) {
          await query(
            `INSERT INTO supplier_transactions (id, supplier_id, amount, type, date, note, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [tx.id, id, tx.amount, tx.type, tx.date, tx.note || null, now]
          );
        }
      }

      const supplier = await getOne(
        `SELECT s.*, 
          json_agg(
            json_build_object(
              'id', st.id, 'amount', st.amount, 'type', st.type, 'date', st.date, 'note', st.note
            ) ORDER BY st.date DESC
          ) FILTER (WHERE st.id IS NOT NULL) as transactions
         FROM suppliers s
         LEFT JOIN supplier_transactions st ON s.id = st.supplier_id
         WHERE s.id = $1
         GROUP BY s.id, s.name, s.total_debt, s.phone, s.created_at`,
        [id]
      );

      return successResponse(supplier, 201);
    }

    // PUT /api/suppliers/:id - Update supplier
    if (method === 'PUT' && path.startsWith('/.netlify/functions/suppliers/')) {
      const id = path.split('/').pop();
      const { name, totalDebt, phone } = body;

      const now = Date.now();
      await query(
        `UPDATE suppliers SET name = $1, total_debt = $2, phone = $3, updated_at = $4 WHERE id = $5`,
        [name, totalDebt, phone, now, id]
      );

      const supplier = await getOne(
        `SELECT s.*, 
          json_agg(
            json_build_object(
              'id', st.id, 'amount', st.amount, 'type', st.type, 'date', st.date, 'note', st.note
            ) ORDER BY st.date DESC
          ) FILTER (WHERE st.id IS NOT NULL) as transactions
         FROM suppliers s
         LEFT JOIN supplier_transactions st ON s.id = st.supplier_id
         WHERE s.id = $1
         GROUP BY s.id, s.name, s.total_debt, s.phone, s.created_at`,
        [id]
      );

      return successResponse(supplier);
    }

    // DELETE /api/suppliers/:id - Delete supplier
    if (method === 'DELETE' && path.startsWith('/.netlify/functions/suppliers/')) {
      const id = path.split('/').pop();
      await query('DELETE FROM suppliers WHERE id = $1', [id]);
      return successResponse({ message: 'Supplier deleted' });
    }

    return errorResponse(404, 'Not found');
  } catch (error) {
    console.error('Suppliers API error:', error);
    return errorResponse(500, 'Internal server error', error);
  }
};
