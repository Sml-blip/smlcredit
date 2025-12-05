// Authentication middleware
import { CONFIG } from './config.js';

export function checkAuth(event) {
  const authHeader = event.headers['authorization'] || event.headers['x-admin-pin'];
  const pin = CONFIG.ADMIN_PIN;

  if (!authHeader) {
    return {
      authorized: false,
      error: 'Missing authorization header'
    };
  }

  // Support both "Bearer PIN" and direct PIN
  const providedPin = authHeader.replace('Bearer ', '').trim();

  if (providedPin !== pin) {
    return {
      authorized: false,
      error: 'Invalid PIN'
    };
  }

  return {
    authorized: true
  };
}

export function errorResponse(statusCode, message, error = null) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      error: message,
      details: error ? error.message : undefined
    })
  };
}

export function successResponse(data, statusCode = 200) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(data)
  };
}

// CORS preflight handler
export function handleCors(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Pin'
      },
      body: ''
    };
  }
  return null;
}
