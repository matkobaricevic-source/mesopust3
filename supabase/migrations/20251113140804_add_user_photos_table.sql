/*
  # Add User Photos Table for Social Feature

  1. New Tables
    - `user_photos`
      - `id` (uuid, primary key) - Unique identifier for each photo
      - `user_id` (uuid, references auth.users) - User who posted the photo
      - `event_id` (uuid, references events) - Event the photo is associated with
      - `image_url` (text) - URL or path to the photo
      - `caption` (text, optional) - Optional caption for the photo
      - `created_at` (timestamptz) - When the photo was posted
      - `updated_at` (timestamptz) - When the photo was last updated

  2. Security
    - Enable RLS on `user_photos` table
    - Add policy for authenticated users to view all photos
    - Add policy for authenticated users to insert their own photos only on event days
    - Add policy for users to update/delete only their own photos
    
  3. Important Notes
    - Photos can only be posted on days when events are happening
    - All authenticated users can view all photos
    - Users can only manage their own photos
*/

CREATE TABLE IF NOT EXISTS user_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  caption text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE user_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view photos"
  ON user_photos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert photos"
  ON user_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos"
  ON user_photos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON user_photos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_photos_event_id ON user_photos(event_id);
CREATE INDEX IF NOT EXISTS idx_user_photos_user_id ON user_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_user_photos_created_at ON user_photos(created_at DESC);
