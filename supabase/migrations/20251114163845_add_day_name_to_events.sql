/*
  # Add day_name field to events table

  1. Changes
    - Add `day_name` column to `events` table to store day descriptions like "Prvi četrtak - Kusi"
    - This field will be displayed alongside event titles in dropdowns
  
  2. Notes
    - Field is optional (nullable) to maintain compatibility with existing data
    - Can be updated manually for each event as needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'day_name'
  ) THEN
    ALTER TABLE events ADD COLUMN day_name text;
  END IF;
END $$;