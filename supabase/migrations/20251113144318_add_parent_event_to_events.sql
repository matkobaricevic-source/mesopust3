/*
  # Add parent event support for sub-events

  1. Changes
    - Add `parent_event_id` column to events table to support hierarchical event structure
    - Add foreign key constraint to ensure parent event exists
    - Add `show_in_main_menu` column to control which events appear in main navigation

  2. Notes
    - This allows events like "Zeča" to be sub-events of "Napovidanje"
    - Sub-events can be hidden from main menu but still accessible from parent event details
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'parent_event_id'
  ) THEN
    ALTER TABLE events ADD COLUMN parent_event_id uuid REFERENCES events(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'show_in_main_menu'
  ) THEN
    ALTER TABLE events ADD COLUMN show_in_main_menu boolean DEFAULT true NOT NULL;
  END IF;
END $$;