/*
  # Add related event link to event steps

  1. Changes
    - Add `related_event_id` column to `event_steps` table
    - This allows a step to link to another event (or the same event's different section)
    - When clicked, it will navigate to that event and auto-expand relevant sections
  
  2. Notes
    - Uses UUID foreign key reference to events table
    - Nullable since most steps won't have related events
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_steps' AND column_name = 'related_event_id'
  ) THEN
    ALTER TABLE event_steps ADD COLUMN related_event_id uuid REFERENCES events(id);
  END IF;
END $$;
