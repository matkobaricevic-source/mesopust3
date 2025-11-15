/*
  # Add Event Steps Table

  1. New Tables
    - `event_steps`
      - `id` (uuid, primary key)
      - `event_id` (uuid, foreign key to events)
      - `step_number` (integer) - Order of the step
      - `title` (text) - Step title/description
      - `image_url` (text, optional) - Image for this step
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `event_steps` table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS event_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  step_number integer NOT NULL,
  title text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE event_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view event steps"
  ON event_steps
  FOR SELECT
  TO public
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_event_steps_event_id ON event_steps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_steps_step_number ON event_steps(event_id, step_number);
