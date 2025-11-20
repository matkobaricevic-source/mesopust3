/*
  # Add Note Field to Event Steps Table

  1. Changes
    - Add `note` column to `event_steps` table for additional contextual information
    - The note can be displayed after a step to provide extra context without being a separate step
  
  2. Details
    - `note` (text, optional) - Additional information related to the step
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_steps' AND column_name = 'note'
  ) THEN
    ALTER TABLE event_steps ADD COLUMN note text;
  END IF;
END $$;
