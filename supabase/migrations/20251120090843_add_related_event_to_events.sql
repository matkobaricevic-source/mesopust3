/*
  # Add related event reference to events table

  1. Changes
    - Add `related_event_id` column to events table to link to another event
    - Add foreign key constraint to ensure referential integrity
  
  2. Purpose
    - Allows events to reference other related events
    - Used for linking napovidanje events to the main "Napovidanje dovcen i dovican" event
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'related_event_id'
  ) THEN
    ALTER TABLE events ADD COLUMN related_event_id uuid REFERENCES events(id);
  END IF;
END $$;
