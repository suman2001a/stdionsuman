-- Supabase SQL Setup Script

-- 1. Create the projects table
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL
);

-- Enable RLS (Row Level Security) on projects but allow all access for this simple setup.
-- In a real production app, you might restrict inserts/deletes to authenticated admins.
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on projects"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert access on projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete access on projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (true);


-- 2. Create the storage bucket for thumbnails
insert into storage.buckets (id, name, public)
values ('portfolio-thumbnails', 'portfolio-thumbnails', true);

-- Enable RLS on storage
CREATE POLICY "Allow public read access on thumbnails"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-thumbnails');

CREATE POLICY "Allow authenticated insert access on thumbnails"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'portfolio-thumbnails');

CREATE POLICY "Allow authenticated delete access on thumbnails"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'portfolio-thumbnails');

-- 3. Create the reviews table
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  text TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  is_approved BOOLEAN DEFAULT false
);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read access on reviews ONLY IF they are approved
CREATE POLICY "Allow public read access on approved reviews"
  ON public.reviews FOR SELECT
  USING (is_approved = true);

-- Allow ANYONE (including anonymous) to insert a review, but it defaults to unapproved
CREATE POLICY "Allow public insert access on reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users (admin) to delete reviews
CREATE POLICY "Allow authenticated delete access on reviews"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (true);

-- Allow authenticated users (admin) to update reviews (e.g. approve them)
CREATE POLICY "Allow authenticated update access on reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (true);
