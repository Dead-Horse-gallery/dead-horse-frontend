-- Add missing columns to existing tables
-- Migration: 20250730_add_missing_columns.sql

-- Add status column to artists table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'artists' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.artists ADD COLUMN status text default 'pending';
    END IF;
END $$;

-- Add status column to artworks table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'artworks' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.artworks ADD COLUMN status text default 'available';
    END IF;
END $$;

-- Add status column to purchases table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'purchases' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.purchases ADD COLUMN status text default 'pending';
    END IF;
END $$;

-- Add any other missing columns to artist_applications if it exists
DO $$ 
BEGIN 
    -- Add payment_status if missing
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artist_applications') 
       AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'artist_applications' AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE public.artist_applications ADD COLUMN payment_status text;
    END IF;
    
    -- Add stripe_charge_id if missing
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artist_applications') 
       AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'artist_applications' AND column_name = 'stripe_charge_id'
    ) THEN
        ALTER TABLE public.artist_applications ADD COLUMN stripe_charge_id text;
    END IF;
    
    -- Add amount_paid if missing
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artist_applications') 
       AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'artist_applications' AND column_name = 'amount_paid'
    ) THEN
        ALTER TABLE public.artist_applications ADD COLUMN amount_paid decimal(10,2);
    END IF;
END $$;
