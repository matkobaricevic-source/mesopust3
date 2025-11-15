/*
  # Add event date field

  1. Changes
    - Add `event_date` date column to events table for tracking when events occur
    - This allows highlighting current/upcoming events in the UI
  
  2. Notes
    - Field is nullable as not all events may have specific dates initially
    - Will be used to show visual indicators when events are happening
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'event_date'
  ) THEN
    ALTER TABLE events ADD COLUMN event_date date;
  END IF;
END $$;
