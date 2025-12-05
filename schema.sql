-- SmlCredit Database Schema for Neon PostgreSQL
-- Run this script in your Neon database to set up the tables

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_debt DECIMAL(10, 2) DEFAULT 0,
    phone VARCHAR(20),
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_debt DECIMAL(10, 2) DEFAULT 0,
    phone VARCHAR(20),
    due_day INTEGER,
    next_due_date DATE,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

-- Create supplier transactions table
CREATE TABLE IF NOT EXISTS supplier_transactions (
    id VARCHAR(50) PRIMARY KEY,
    supplier_id VARCHAR(50) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('debt', 'payment')),
    date BIGINT NOT NULL,
    note TEXT,
    created_at BIGINT NOT NULL
);

-- Create client transactions table
CREATE TABLE IF NOT EXISTS client_transactions (
    id VARCHAR(50) PRIMARY KEY,
    client_id VARCHAR(50) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('debt', 'payment')),
    date BIGINT NOT NULL,
    note TEXT,
    created_at BIGINT NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX idx_supplier_transactions_supplier_id ON supplier_transactions(supplier_id);
CREATE INDEX idx_client_transactions_client_id ON client_transactions(client_id);
CREATE INDEX idx_supplier_transactions_date ON supplier_transactions(date);
CREATE INDEX idx_client_transactions_date ON client_transactions(date);

-- Create indexes for filtering
CREATE INDEX idx_suppliers_created_at ON suppliers(created_at);
CREATE INDEX idx_clients_created_at ON clients(created_at);
