/*
  # Add show_in_main_menu flag to participants

  1. Changes
    - Add `show_in_main_menu` boolean column to participants table
    - Default value is true (show in menu)
    - Update specific participants to be hidden from main menu
    - These participants will only appear in the "Mlada mesopustova" event detail page
  
  2. Participants to hide from main menu
    - Mlada
    - Mladi
    - Kumovi
    - Dvije prve divice
    - Dvije soljače
    - Stari svati
    - Ženska i muška svaća
    - Bandiraš
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'participants' AND column_name = 'show_in_main_menu'
  ) THEN
    ALTER TABLE participants ADD COLUMN show_in_main_menu boolean DEFAULT true NOT NULL;
  END IF;
END $$;

UPDATE participants 
SET show_in_main_menu = false
WHERE id IN (
  'a71c8dbb-cc81-4bdc-a95e-19fd90dfd1fb',
  '3eb79420-a365-4281-b8bf-806cd62c3944',
  'b805db86-e577-4e2d-aead-dcc5d4b058ab',
  '5bd09fdd-472a-4c54-bd15-aca6c3bf9c25',
  '05a28996-7bc1-4c36-8bc5-d266c53814f2',
  'c3269842-bd86-4d0c-961c-70bf903e5d7d',
  '16e337be-bef9-475c-af12-2418007cf203',
  'e785dc59-bb5e-486a-93c4-651a0a07ff8d'
);
