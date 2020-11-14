CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products model
CREATE TABLE IF NOT EXISTS products (
    product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    description TEXT,
    price INTEGER
);

-- Stocks model
CREATE TABLE IF NOT EXISTS stocks (
    product_id UUID REFERENCES products,
    count INTEGER
);
