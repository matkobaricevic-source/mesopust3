/*
  # Add show_in_main_menu flag to hierarchy_roles

  1. Changes
    - Add `show_in_main_menu` boolean column to `hierarchy_roles` table
    - Default to true for existing roles
    - Set to false for support roles (Kasir, Magaziner, Bandiraš)
    - Fix typo: change "kapetan" to "kapitan" in role titles
*/

-- Add show_in_main_menu column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hierarchy_roles' AND column_name = 'show_in_main_menu'
  ) THEN
    ALTER TABLE hierarchy_roles ADD COLUMN show_in_main_menu boolean DEFAULT true;
  END IF;
END $$;

-- Fix typo: kapetan -> kapitan
UPDATE hierarchy_roles 
SET title_croatian = 'Prvi kapitan' 
WHERE title_croatian = 'Prvi kapetan';

UPDATE hierarchy_roles 
SET title_croatian = 'Drugi kapitan' 
WHERE title_croatian = 'Drugi kapetan';

UPDATE hierarchy_roles 
SET title = 'First Captain' 
WHERE title = 'First Captain' OR title_croatian = 'Prvi kapitan';

UPDATE hierarchy_roles 
SET title = 'Second Captain' 
WHERE title = 'Second Captain' OR title_croatian = 'Drugi kapitan';

-- Hide support roles from main menu
UPDATE hierarchy_roles 
SET show_in_main_menu = false 
WHERE title_croatian IN ('Kasir', 'Magaziner', 'Bandiraš');