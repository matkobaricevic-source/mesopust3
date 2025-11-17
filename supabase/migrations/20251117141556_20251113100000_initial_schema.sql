/*
  # Initial Schema for Mesopust Novlje App

  ## Overview
  Creates the foundational database structure for the Mesopust folk tradition app,
  including events, categories, content items, and glossary terms.

  ## New Tables
  
  ### 1. `events` - Main events in the Mesopust tradition
    - `id` (uuid, primary key) - Unique identifier
    - `title` (text) - Event name in English
    - `title_local` (text) - Event name in local dialect
    - `description` (text) - Event description
    - `image_url` (text, nullable) - Event image
    - `display_order` (integer) - Display order
    - `created_at` (timestamptz) - Creation timestamp

  ### 2. `categories` - Categories within events (e.g., days, phases)
    - `id` (uuid, primary key) - Unique identifier
    - `event_id` (uuid, foreign key) - Reference to parent event
    - `title` (text) - Category name in English
    - `title_local` (text) - Category name in local dialect
    - `description` (text) - Category description
    - `image_url` (text, nullable) - Category image
    - `display_order` (integer) - Display order
    - `created_at` (timestamptz) - Creation timestamp

  ### 3. `content_items` - Content pieces within categories
    - `id` (uuid, primary key) - Unique identifier
    - `category_id` (uuid, foreign key) - Reference to parent category
    - `title` (text) - Content title
    - `content` (text) - Content body
    - `media_url` (text, nullable) - Media file URL
    - `media_type` (text, nullable) - Type of media (image, video, audio)
    - `display_order` (integer) - Display order
    - `created_at` (timestamptz) - Creation timestamp

  ### 4. `glossary_terms` - Glossary of dialect terms
    - `id` (uuid, primary key) - Unique identifier
    - `term` (text) - Dialect term
    - `definition` (text) - Definition in standard language
    - `example` (text, nullable) - Usage example
    - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on all tables
  - Public read access for all content (no authentication required for viewing)
*/

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_local text,
  description text NOT NULL,
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title text NOT NULL,
  title_local text,
  description text NOT NULL,
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create content_items table
CREATE TABLE IF NOT EXISTS content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  media_url text,
  media_type text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create glossary_terms table
CREATE TABLE IF NOT EXISTS glossary_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text NOT NULL UNIQUE,
  definition text NOT NULL,
  example text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_events_display_order ON events(display_order);
CREATE INDEX IF NOT EXISTS idx_categories_event_id ON categories(event_id);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);
CREATE INDEX IF NOT EXISTS idx_content_items_category_id ON content_items(category_id);
CREATE INDEX IF NOT EXISTS idx_content_items_display_order ON content_items(display_order);
CREATE INDEX IF NOT EXISTS idx_glossary_terms_term ON glossary_terms(term);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE glossary_terms ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view content items"
  ON content_items FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view glossary terms"
  ON glossary_terms FOR SELECT
  TO public
  USING (true);