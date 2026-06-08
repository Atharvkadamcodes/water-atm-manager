-- Supabase SQL Schema for Water ATM Customer Management

-- Drop tables if they exist (for easy resetting)
-- DROP TABLE IF EXISTS history CASCADE;
-- DROP TABLE IF EXISTS customers CASCADE;

-- 1. Create Customers Table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    customer_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    current_card_number VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for searching customers fast by various fields
CREATE INDEX idx_customers_search ON customers (full_name, mobile_number, current_card_number);

-- 2. Create History Table
CREATE TABLE history (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, 
    -- Allowed event_types: 'CARD_ISSUED', 'RECHARGE', 'CARD_LOST', 'NEW_CARD_ISSUED', 'CUSTOMER_UPDATED'
    amount DECIMAL(12, 2), -- Nullable, used primarily for RECHARGE
    notes TEXT, -- Nullable, optional comments
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for history timeline performance
CREATE INDEX idx_history_customer_created ON history (customer_id, created_at DESC);
CREATE INDEX idx_history_event_created ON history (event_type, created_at DESC);

-- Enable Row Level Security (RLS) on both tables (Supabase best practice)
-- Note: Adjust policy rules to fit your actual business security requirements.
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- Create public access policy for simple business use
-- (In production, restrict to authenticated users)
CREATE POLICY "Allow public read access to customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update to customers" ON customers FOR ALL USING (true);

CREATE POLICY "Allow public read access to history" ON history FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update to history" ON history FOR ALL USING (true);
