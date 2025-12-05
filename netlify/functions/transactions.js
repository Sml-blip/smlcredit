import { query, getOne } from './db.js';
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

    // POST /api/transactions/supplier/:id - Add supplier transaction
    if (method === 'POST' && path.includes('/transactions/supplier/')) {
      const supplierId = path.split('/').pop();
      const { id, amount, type, date, note } = body;

      if (!amount || !type) {
        return errorResponse(400, 'Amount and type are required');
      }

      const now = Date.now();

      // Insert transaction
      await query(
        `INSERT INTO supplier_transactions (id, supplier_id, amount, type, date, note, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, supplierId, amount, type, date, note || null, now]
      );

      // Update supplier total debt
      const result = await getOne(
        `SELECT SUM(CASE WHEN type = 'debt' THEN amount ELSE -amount END) as total_debt
         FROM supplier_transactions WHERE supplier_id = $1`,
        [supplierId]
      );

      await query(
        `UPDATE suppliers SET total_debt = $1, updated_at = $2 WHERE id = $3`,
        [result.total_debt || 0, now, supplierId]
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
        [supplierId]
      );

      return successResponse(supplier, 201);
    }

    // POST /api/transactions/client/:id - Add client transaction
    if (method === 'POST' && path.includes('/transactions/client/')) {
      const clientId = path.split('/').pop();
      const { id, amount, type, date, note } = body;

      if (!amount || !type) {
        return errorResponse(400, 'Amount and type are required');
      }

      const now = Date.now();

      // Insert transaction
      await query(
        `INSERT INTO client_transactions (id, client_id, amount, type, date, note, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, clientId, amount, type, date, note || null, now]
      );

      // Update client total debt
      const result = await getOne(
        `SELECT SUM(CASE WHEN type = 'debt' THEN amount ELSE -amount END) as total_debt
         FROM client_transactions WHERE client_id = $1`,
        [clientId]
      );

      await query(
        `UPDATE clients SET total_debt = $1, updated_at = $2 WHERE id = $3`,
        [result.total_debt || 0, now, clientId]
      );

      const client = await getOne(
        `SELECT c.*, 
          json_agg(
            json_build_object(
              'id', ct.id, 'amount', ct.amount, 'type', ct.type, 'date', ct.date, 'note', ct.note
            ) ORDER BY ct.date DESC
          ) FILTER (WHERE ct.id IS NOT NULL) as transactions
         FROM clients c
         LEFT JOIN client_transactions ct ON c.id = ct.client_id
         WHERE c.id = $1
         GROUP BY c.id, c.name, c.total_debt, c.phone, c.due_day, c.next_due_date, c.created_at`,
        [clientId]
      );

      return successResponse(client, 201);
    }

    return errorResponse(404, 'Not found');
  } catch (error) {
    console.error('Transactions API error:', error);
    return errorResponse(500, 'Internal server error', error);
  }
};
