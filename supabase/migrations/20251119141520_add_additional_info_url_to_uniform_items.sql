/*
  # Add additional info URL to uniform items

  1. Changes
    - Add `additional_info_url` column to `uniform_items` table
    - This allows linking to dedicated pages for uniform items with extensive history (like Rapčinac)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'uniform_items' AND column_name = 'additional_info_url'
  ) THEN
    ALTER TABLE uniform_items ADD COLUMN additional_info_url text;
  END IF;
END $$;