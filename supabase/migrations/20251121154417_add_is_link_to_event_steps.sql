/*
  # Add is_link flag to event steps

  1. Changes
    - Add `is_link` boolean column to `event_steps` table
    - When true, the step is rendered as a standalone link without a step number
    - Used for special navigation items between steps
  
  2. Notes
    - Defaults to false for regular steps
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_steps' AND column_name = 'is_link'
  ) THEN
    ALTER TABLE event_steps ADD COLUMN is_link boolean DEFAULT false;
  END IF;
END $$;
