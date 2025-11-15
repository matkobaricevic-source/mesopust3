/*
  # Add show_in_main_menu flag to categories

  1. Changes
    - Add `show_in_main_menu` boolean column to categories table
    - Default value is true (show in dropdown menu)
    - This allows hiding specific categories from dropdown menus while keeping them in the database
  
  2. Security
    - No RLS changes needed (inherits existing policies)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'show_in_main_menu'
  ) THEN
    ALTER TABLE categories ADD COLUMN show_in_main_menu boolean DEFAULT true NOT NULL;
  END IF;
END $$;