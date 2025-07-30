-- Complete Dead Horse Gallery Database Schema
-- Migration: 20250730_complete_schema.sql

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create the storage bucket for artist portfolios
insert into storage.buckets (id, name)
values ('artist-portfolios', 'artist-portfolios')
on conflict (id) do nothing;

-- Create RLS policies for the bucket
-- Drop existing policies if they exist
drop policy if exists "Authenticated users can upload files" on storage.objects;
drop policy if exists "Anyone can view files" on storage.objects;

-- Create the policies
create policy "Authenticated users can upload files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'artist-portfolios'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Anyone can view files"
on storage.objects
for select
to public
using (bucket_id = 'artist-portfolios');

-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) unique,
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create artists table
create table if not exists public.artists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  name text not null,
  bio text,
  portfolio_url text,
  instagram_handle text,
  status text default 'pending',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create artist_applications table (backend expects this name)
create table if not exists public.artist_applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  name text not null,
  email text not null,
  bio text,
  portfolio_url text,
  instagram_handle text,
  artistic_statement text,
  experience_level text,
  art_medium text,
  years_creating text,
  exhibition_history text,
  why_dead_horse text,
  portfolio_urls text[],
  status text default 'pending',
  payment_status text,
  stripe_charge_id text,
  amount_paid decimal(10,2),
  applied_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create artworks table
create table if not exists public.artworks (
  id uuid primary key default uuid_generate_v4(),
  artist_id uuid references public.artists(id),
  title text not null,
  description text,
  price decimal(10,2),
  medium text,
  dimensions text,
  image_url text,
  status text default 'available',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create purchases table
create table if not exists public.purchases (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid references auth.users(id),
  artwork_id uuid references public.artworks(id),
  stripe_payment_intent_id text,
  amount decimal(10,2),
  status text default 'pending',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create qr_codes table
create table if not exists public.qr_codes (
  id uuid primary key default uuid_generate_v4(),
  artwork_id uuid references public.artworks(id),
  code text unique not null,
  scans_count integer default 0,
  created_at timestamp with time zone default now(),
  last_scanned_at timestamp with time zone
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.artists enable row level security;
alter table public.artist_applications enable row level security;
alter table public.artworks enable row level security;
alter table public.purchases enable row level security;
alter table public.qr_codes enable row level security;

-- Create RLS policies for profiles
-- Drop existing policies if they exist
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can create their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Users can view their own profile"
on public.profiles for select
to authenticated
using (user_id = auth.uid());

create policy "Users can create their own profile"
on public.profiles for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (user_id = auth.uid());

-- Create RLS policies for artist_applications
-- Drop existing policies if they exist
drop policy if exists "Users can view their own applications" on public.artist_applications;
drop policy if exists "Users can create their own applications" on public.artist_applications;

create policy "Users can view their own applications"
on public.artist_applications for select
to authenticated
using (user_id = auth.uid());

create policy "Users can create their own applications"
on public.artist_applications for insert
to authenticated
with check (user_id = auth.uid());

-- Admin policies (service role can see all)
-- Drop existing admin policies if they exist
drop policy if exists "Service role can manage all applications" on public.artist_applications;
drop policy if exists "Service role can manage all profiles" on public.profiles;
drop policy if exists "Service role can manage all artists" on public.artists;
drop policy if exists "Service role can manage all artworks" on public.artworks;
drop policy if exists "Service role can manage all purchases" on public.purchases;
drop policy if exists "Service role can manage all qr_codes" on public.qr_codes;

create policy "Service role can manage all applications"
on public.artist_applications for all
to service_role
using (true)
with check (true);

create policy "Service role can manage all profiles"
on public.profiles for all
to service_role
using (true)
with check (true);

create policy "Service role can manage all artists"
on public.artists for all
to service_role
using (true)
with check (true);

create policy "Service role can manage all artworks"
on public.artworks for all
to service_role
using (true)
with check (true);

create policy "Service role can manage all purchases"
on public.purchases for all
to service_role
using (true)
with check (true);

create policy "Service role can manage all qr_codes"
on public.qr_codes for all
to service_role
using (true)
with check (true);

-- Public policies for viewing
-- Drop existing public policies if they exist
drop policy if exists "Anyone can view approved artists" on public.artists;
drop policy if exists "Anyone can view available artworks" on public.artworks;

create policy "Anyone can view approved artists"
on public.artists for select
to public
using (status = 'approved');

create policy "Anyone can view available artworks"
on public.artworks for select
to public
using (status = 'available');

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers to all tables
-- Drop existing triggers if they exist
drop trigger if exists set_updated_at_profiles on public.profiles;
drop trigger if exists set_updated_at_artists on public.artists;
drop trigger if exists set_updated_at_artist_applications on public.artist_applications;
drop trigger if exists set_updated_at_artworks on public.artworks;
drop trigger if exists set_updated_at_purchases on public.purchases;

-- Recreate triggers
create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_artists
  before update on public.artists
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_artist_applications
  before update on public.artist_applications
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_artworks
  before update on public.artworks
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_purchases
  before update on public.purchases
  for each row execute function public.handle_updated_at();