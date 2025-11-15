/*
  # Add costume note field to events table

  1. Changes
    - Add `costume_note` text column to events table
    - This field will display special notes about clothing/costumes for specific events
    - Example: "CIVILNA ODJEĆA" for Napovidanje event
    - Update Napovidanje event with the costume note
  
  2. Notes
    - Field is nullable as not all events need costume notes
    - Will be displayed prominently in the event detail view
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'costume_note'
  ) THEN
    ALTER TABLE events ADD COLUMN costume_note text;
  END IF;
END $$;

UPDATE events 
SET costume_note = 'CIVILNA ODJEĆA'
WHERE id = '4bacfe02-bdda-4bdf-8f4d-c589647fb0c3';
