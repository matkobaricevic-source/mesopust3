/*
  # Create Searchable Items System

  1. New Tables
    - `searchable_items`
      - `id` (uuid, primary key)
      - `name` (text) - Croatian name
      - `name_local` (text, nullable) - Local dialect name
      - `description` (text) - Description of the item
      - `description_local` (text, nullable) - Local dialect description
      - `category` (text) - Category: 'clothing', 'instrument', 'accessory', 'other'
      - `image_url` (text, nullable) - Image of the item
      - `display_order` (integer, default 0)
      - `created_at` (timestamptz)
    
    - `participant_items`
      - `id` (uuid, primary key)
      - `participant_id` (uuid, foreign key to participants)
      - `item_id` (uuid, foreign key to searchable_items)
      - `usage_notes` (text, nullable) - How this participant uses the item
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access (authenticated users)
    - Items are read-only for regular users

  3. Notes
    - This table stores individual items like "kokarda", "krilo", "bičija" etc.
    - Items can be linked to multiple participants
    - Search will use this table to find items and show which participants use them
*/

CREATE TABLE IF NOT EXISTS searchable_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_local text,
  description text NOT NULL,
  description_local text,
  category text NOT NULL DEFAULT 'other',
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS participant_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES searchable_items(id) ON DELETE CASCADE,
  usage_notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(participant_id, item_id)
);

ALTER TABLE searchable_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view searchable items"
  ON searchable_items
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view participant items"
  ON participant_items
  FOR SELECT
  TO public
  USING (true);

CREATE INDEX IF NOT EXISTS idx_searchable_items_name ON searchable_items(name);
CREATE INDEX IF NOT EXISTS idx_searchable_items_name_local ON searchable_items(name_local);
CREATE INDEX IF NOT EXISTS idx_searchable_items_category ON searchable_items(category);
CREATE INDEX IF NOT EXISTS idx_participant_items_participant ON participant_items(participant_id);
CREATE INDEX IF NOT EXISTS idx_participant_items_item ON participant_items(item_id);