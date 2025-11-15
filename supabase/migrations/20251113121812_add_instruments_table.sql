/*
  # Add Instruments Table

  1. New Tables
    - `instruments`
      - `id` (uuid, primary key) - Unique identifier for each instrument
      - `participant_id` (uuid, foreign key) - References participants table (Mesopustar)
      - `name` (text) - English name of the instrument
      - `name_croatian` (text) - Croatian name of the instrument
      - `description` (text, nullable) - English description of the instrument
      - `description_croatian` (text, nullable) - Croatian description of the instrument
      - `playing_technique` (text, nullable) - English description of how it's played
      - `playing_technique_croatian` (text, nullable) - Croatian description of how it's played
      - `image_url` (text, nullable) - URL or path to instrument image
      - `event_specific_notes` (text, nullable) - Notes about variations in different events (Croatian)
      - `display_order` (integer) - Order for displaying instruments
      - `created_at` (timestamptz) - Timestamp of creation

  2. Security
    - Enable RLS on `instruments` table
    - Add policy for public read access (authenticated and anon users)

  3. Important Notes
    - Instruments are linked to participants (specifically Mesopustar)
    - Each instrument can have event-specific playing variations
    - Images and detailed descriptions help educate tourists
*/

-- Create instruments table
CREATE TABLE IF NOT EXISTS instruments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid REFERENCES participants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  name_croatian text NOT NULL,
  description text,
  description_croatian text,
  playing_technique text,
  playing_technique_croatian text,
  image_url text,
  event_specific_notes text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE instruments ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public can view instruments"
  ON instruments
  FOR SELECT
  TO public
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_instruments_participant_id ON instruments(participant_id);
CREATE INDEX IF NOT EXISTS idx_instruments_display_order ON instruments(display_order);
