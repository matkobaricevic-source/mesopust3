/*
  # Add audio URL to instruments

  1. Changes
    - Add `audio_url` column to `instruments` table to store audio file URLs
    - This will allow users to hear the sound of each instrument
  
  2. Notes
    - Column is nullable as not all instruments may have audio samples yet
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'instruments' AND column_name = 'audio_url'
  ) THEN
    ALTER TABLE instruments ADD COLUMN audio_url text;
  END IF;
END $$;