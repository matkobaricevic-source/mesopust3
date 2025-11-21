/*
  # Add Mesopustarska Zoga Table

  1. New Tables
    - `zoga_info`
      - `id` (uuid, primary key)
      - `description` (text) - English description
      - `description_croatian` (text) - Croatian description
      - `audio_url` (text, nullable) - Audio file URL
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `zoga_tempo_categories`
      - `id` (uuid, primary key)
      - `name` (text) - Category name (e.g., "Jako spora", "Spora", etc.)
      - `display_order` (integer)
      - `created_at` (timestamptz)
    
    - `zoga_moments`
      - `id` (uuid, primary key)
      - `tempo_category_id` (uuid, foreign key to zoga_tempo_categories)
      - `moment_name` (text) - Name of the moment/event
      - `moment_name_croatian` (text) - Croatian name
      - `description` (text, nullable) - Additional details
      - `description_croatian` (text, nullable)
      - `display_order` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read data
    - Public read access for all zoga-related data

  3. Initial Data
    - Insert main zoga description
    - Insert tempo categories
*/

-- Create zoga_info table
CREATE TABLE IF NOT EXISTS zoga_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL DEFAULT '',
  description_croatian text NOT NULL DEFAULT '',
  audio_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE zoga_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read zoga info"
  ON zoga_info FOR SELECT
  TO public
  USING (true);

-- Create zoga_tempo_categories table
CREATE TABLE IF NOT EXISTS zoga_tempo_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE zoga_tempo_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tempo categories"
  ON zoga_tempo_categories FOR SELECT
  TO public
  USING (true);

-- Create zoga_moments table
CREATE TABLE IF NOT EXISTS zoga_moments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tempo_category_id uuid NOT NULL REFERENCES zoga_tempo_categories(id) ON DELETE CASCADE,
  moment_name text NOT NULL DEFAULT '',
  moment_name_croatian text NOT NULL DEFAULT '',
  description text,
  description_croatian text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE zoga_moments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read zoga moments"
  ON zoga_moments FOR SELECT
  TO public
  USING (true);

-- Insert main zoga description
INSERT INTO zoga_info (description_croatian) VALUES (
  'Po usmenoj predaji prije Ilirskog narodnog preporoda zoga nije emitirala današnju koračnicu. Glazbena tema hrvatske budnice „Još Hrvatska nij'' propala" izvodi se kao mesopustarska muzika, koju sviraju mesopustari od 1845 u ementarno-intuitivnom obliku (tada korišteni instrumenti: sopile, bubanj, kosa, zvonca i mužara). Transformiranje takve primitivne zoge u današnji način interpretacije zoge bilo je 1875. kada se uvode vela i mala trumbeta, činele, veli bubanj kao i svi danas prisutni instrumenti.

Zogu započinju vela i mala sopila. Nakon izvedena prva dva uvodna takta mužiku nastavljaju bubat svi instrumenti.'
) ON CONFLICT DO NOTHING;

-- Insert tempo categories
INSERT INTO zoga_tempo_categories (name, display_order) VALUES
  ('Jako spora', 1),
  ('Spora', 2),
  ('Srednje spora', 3),
  ('Srednja uobičajena', 4),
  ('Srednje brza', 5),
  ('Brza', 6)
ON CONFLICT DO NOTHING;
