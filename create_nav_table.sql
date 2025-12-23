
-- Create navigation items table
create table if not exists public.doc_nav_items (
  id uuid default gen_random_uuid() primary key,
  label text not null,
  url text not null,
  type text default 'link', -- 'link' or 'button'
  "order" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.doc_nav_items enable row level security;

-- Policies
create policy "Allow read access for all"
  on public.doc_nav_items for select
  using (true);

create policy "Allow write access for admins"
  on public.doc_nav_items for all
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

-- Insert initial data
insert into public.doc_nav_items (label, url, type, "order") values
('Homepage', '/', 'link', 1),
('Support', '/support', 'link', 2),
('Compliance', '/compliance', 'link', 3),
('Dashboard', '#', 'button', 4);
