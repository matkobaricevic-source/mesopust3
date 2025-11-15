/*
  # Add Participants and Event-Participant Relationships

  ## Overview
  Extends the schema to support participant groups (like Mesopustari, Novljansko Kolo)
  and their many-to-many relationships with events.

  ## New Tables
  
  ### 1. `participants` - Folk drama participant groups
    - `id` (uuid, primary key) - Unique identifier
    - `name` (text) - Participant group name (e.g., "Mesopustari")
    - `name_croatian` (text) - Name in Croatian
    - `description` (text) - Description of the group
    - `description_croatian` (text) - Description in Croatian
    - `instruments` (text, nullable) - Instruments they play
    - `song_rhythm` (text, nullable) - Song they perform to
    - `costume_description` (text, nullable) - Traditional costume details
    - `image_url` (text, nullable) - Group photo
    - `display_order` (integer) - Display order
    - `created_at` (timestamptz) - Creation timestamp

  ### 2. `event_participants` - Junction table for many-to-many relationship
    - `id` (uuid, primary key) - Unique identifier
    - `event_id` (uuid, foreign key) - Reference to event
    - `participant_id` (uuid, foreign key) - Reference to participant
    - `role_description` (text, nullable) - Their role in this specific event
    - `created_at` (timestamptz) - Creation timestamp

  ## Modifications
  - Keep existing tables (events, categories, content_items, glossary_terms)
  - Add indexes for performance

  ## Security
  - Enable RLS on new tables
  - Public read access for all users
*/

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_croatian text NOT NULL,
  description text NOT NULL,
  description_croatian text NOT NULL,
  instruments text,
  song_rhythm text,
  costume_description text,
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create event_participants junction table
CREATE TABLE IF NOT EXISTS event_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  role_description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, participant_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_participants_display_order ON participants(display_order);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_participant_id ON event_participants(participant_id);

-- Enable Row Level Security
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view participants"
  ON participants FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view event participants"
  ON event_participants FOR SELECT
  TO public
  USING (true);
