/*
  # Add full Croatian description field to events table

  1. Changes
    - Add `description_croatian_full` column to `events` table
      - This will store the detailed/full Croatian description
      - `description_croatian` will remain as the short summary description
    
  2. Purpose
    - Separate short descriptions (shown on event page) from full descriptions (shown in modal)
    - Provides better content hierarchy and user experience
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'description_croatian_full'
  ) THEN
    ALTER TABLE events ADD COLUMN description_croatian_full text;
  END IF;
END $$;