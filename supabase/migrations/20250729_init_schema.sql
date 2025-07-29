-- Enable the storage extension if not already enabled
create extension if not exists "storage";

-- Create the storage bucket for artist portfolios
insert into storage.buckets (id, name)
values ('artist-portfolios', 'artist-portfolios')
on conflict (id) do nothing;

-- Create RLS policies for the bucket
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

-- Create the applications table if it doesn't exist
create table if not exists public.applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  portfolio_url text,
  instagram_handle text,
  artistic_statement text,
  experience_level text,
  art_medium text,
  years_creating text,
  exhibition_history text,
  why_dead_horse text,
  portfolio_urls text[],
  payment_status text,
  stripe_charge_id text,
  amount_paid decimal(10,2),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on applications table
alter table public.applications enable row level security;

-- Create RLS policies for applications
create policy "Users can view their own applications"
on public.applications
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can create their own applications"
on public.applications
for insert
to authenticated
with check (user_id = auth.uid());

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.applications
  for each row
  execute function public.handle_updated_at();
