-- Schema for Wedding Invitation: Pamela & Nestor
-- Create tables, storage buckets, and RLS policies

-- 1. Create table settings
create table if not exists settings (
  id integer primary key default 1,
  bride_name text not null default 'Pamela',
  groom_name text not null default 'Nestor',
  title text not null default 'NOS CASAMOS',
  intro_text text not null default 'Y QUEREMOS QUE SEAS PARTE DE ESTE DÍA TAN ESPECIAL',
  wedding_date date not null default '2026-10-24',
  wedding_time time not null default '17:50',
  location_name text not null default 'EVENTOS LAS MORAS',
  location_address text not null default 'Mateo Blanco 369, Campana, Buenos Aires',
  maps_url text not null default 'https://maps.app.goo.gl/A7obpbcwitPRKooK7',
  bank_alias text not null default 'casamiento.nestor.pame',
  bank_cbu text default '0070000000000000000000',
  bank_owner text default 'Nestor y Pame',
  bank_name text not null default 'Banco Galicia',
  instagram_url text not null default 'https://instagram.com/',
  phrase text not null default '“Y así, sin buscarte, te elegí.
Y así, sin pensarlo, me quedé.”',
  final_message text not null default '“Gracias por ser parte
de nuestra historia”',
  music_url text default '',
  google_drive_url text default 'https://drive.google.com',
  dress_code_title text not null default 'Elegante',
  dress_code_subtitle text not null default 'Por favor, evitar los colores bordo y blanco.',
  forbidden_colors jsonb not null default '["#800020", "#FFFFFF"]'::jsonb,
  rsvp_deadline_date date not null default '2026-10-10',
  rsvp_deadline_time time not null default '23:59:00',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint single_row check (id = 1)
);

-- Insert default settings row
insert into settings (
  id, bride_name, groom_name, title, intro_text, wedding_date, wedding_time,
  location_name, location_address, bank_alias, google_drive_url, instagram_url, phrase, final_message,
  dress_code_title, dress_code_subtitle, forbidden_colors
) values (
  1, 'Pamela', 'Nestor', 'NOS CASAMOS', 'Y QUEREMOS QUE SEAS PARTE
DE ESTE DÍA TAN ESPECIAL',
  '2026-10-24', '17:50:00', 'EVENTOS LAS MORAS', 'Mateo Blanco 369, Campana, Buenos Aires',
  'casamiento.nestor.pame', 'https://drive.google.com', 'https://instagram.com/', '“Y así, sin buscarte, te elegí.
Y así, sin pensarlo, me quedé.”',
  '“Gracias por ser parte
de nuestra historia”', 'Elegante', 'Por favor, evitar los colores bordo y blanco.',
  '["#800020", "#FFFFFF"]'::jsonb
) on conflict (id) do nothing;

-- 2. Create table rsvps
create table if not exists rsvps (
  id uuid default gen_random_uuid() primary key,
  first_name text not null,
  last_name text not null,
  dni text not null unique,
  phone text,
  attending boolean not null,
  guest_count integer not null default 1,
  dietary_restrictions text not null default 'Ninguna',
  comments text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create table suggested_songs
create table if not exists suggested_songs (
  id uuid default gen_random_uuid() primary key,
  suggester_name text not null,
  title text not null,
  artist text not null,
  link text,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create table photos
create table if not exists photos (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  file_path text not null,
  is_approved boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table settings enable row level security;
alter table rsvps enable row level security;
alter table suggested_songs enable row level security;
alter table photos enable row level security;

-- 5. Create RLS Policies

-- Settings policies
create policy "Allow public read access to settings" on settings
  for select using (true);

create policy "Allow authenticated write access to settings" on settings
  for all using (auth.role() = 'authenticated');

-- RSVPs policies
create policy "Allow public insert to rsvps" on rsvps
  for insert with check (true);

create policy "Allow authenticated read and write to rsvps" on rsvps
  for all using (auth.role() = 'authenticated');

-- Suggested songs policies
create policy "Allow public insert to suggested_songs" on suggested_songs
  for insert with check (true);

create policy "Allow authenticated read and write to suggested_songs" on suggested_songs
  for all using (auth.role() = 'authenticated');

-- Photos policies
create policy "Allow public read access to approved photos" on photos
  for select using (is_approved = true or auth.role() = 'authenticated');

create policy "Allow public insert to photos" on photos
  for insert with check (true);

create policy "Allow authenticated read/write access to photos" on photos
  for all using (auth.role() = 'authenticated');

-- MIGRATION HELPER: Run these queries in your Supabase SQL Editor if you already initialized the database previously:
-- ALTER TABLE settings ADD COLUMN IF NOT EXISTS rsvp_deadline_date date NOT null DEFAULT '2026-10-10';
-- ALTER TABLE settings ADD COLUMN IF NOT EXISTS rsvp_deadline_time time NOT null DEFAULT '23:59:00';
-- ALTER TABLE settings ADD COLUMN IF NOT EXISTS bank_name text NOT null DEFAULT 'Banco Galicia';
-- ALTER TABLE settings ADD COLUMN IF NOT EXISTS google_drive_url text DEFAULT 'https://drive.google.com';
-- UPDATE settings SET bank_cbu = '0070000000000000000000', bank_owner = 'Nestor y Pame', bank_alias = 'casamiento.nestor.pame' WHERE id = 1;

