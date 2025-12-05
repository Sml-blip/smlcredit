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

    // GET /api/clients - Get all clients
    if (method === 'GET' && path === '/.netlify/functions/clients') {
      const clients = await getAll(`
        SELECT 
          c.id, c.name, c.total_debt, c.phone, c.due_day, c.next_due_date, c.created_at,
          json_agg(
            json_build_object(
              'id', ct.id,
              'amount', ct.amount,
              'type', ct.type,
              'date', ct.date,
              'note', ct.note
            ) ORDER BY ct.date DESC
          ) FILTER (WHERE ct.id IS NOT NULL) as transactions
        FROM clients c
        LEFT JOIN client_transactions ct ON c.id = ct.client_id
        GROUP BY c.id, c.name, c.total_debt, c.phone, c.due_day, c.next_due_date, c.created_at
        ORDER BY c.created_at DESC
      `);
      return successResponse(clients);
    }

    // POST /api/clients - Create new client
    if (method === 'POST' && path === '/.netlify/functions/clients') {
      const { id, name, totalDebt, phone, dueDay, nextDueDate, transactions } = body;

      if (!name) {
        return errorResponse(400, 'Name is required');
      }

      const now = Date.now();

      // Insert client
      await query(
        `INSERT INTO clients (id, name, total_debt, phone, due_day, next_due_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, name, totalDebt || 0, phone || null, dueDay || null, nextDueDate || null, now, now]
      );

      // Insert initial transactions if provided
      if (transactions && transactions.length > 0) {
        for (const tx of transactions) {
          await query(
            `INSERT INTO client_transactions (id, client_id, amount, type, date, note, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [tx.id, id, tx.amount, tx.type, tx.date, tx.note || null, now]
          );
        }
      }

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
        [id]
      );

      return successResponse(client, 201);
    }

    // PUT /api/clients/:id - Update client
    if (method === 'PUT' && path.startsWith('/.netlify/functions/clients/')) {
      const id = path.split('/').pop();
      const { name, totalDebt, phone, dueDay, nextDueDate } = body;

      const now = Date.now();
      await query(
        `UPDATE clients SET name = $1, total_debt = $2, phone = $3, due_day = $4, next_due_date = $5, updated_at = $6 WHERE id = $7`,
        [name, totalDebt, phone, dueDay, nextDueDate, now, id]
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
        [id]
      );

      return successResponse(client);
    }

    // DELETE /api/clients/:id - Delete client
    if (method === 'DELETE' && path.startsWith('/.netlify/functions/clients/')) {
      const id = path.split('/').pop();
      await query('DELETE FROM clients WHERE id = $1', [id]);
      return successResponse({ message: 'Client deleted' });
    }

    return errorResponse(404, 'Not found');
  } catch (error) {
    console.error('Clients API error:', error);
    return errorResponse(500, 'Internal server error', error);
  }
};
