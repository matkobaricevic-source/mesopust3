/*
  # Add audio URL for Mesopustarska zoga

  1. Changes
    - Add `song_rhythm_audio_url` column to `participants` table
      - Stores the URL to the audio file for the Mesopustarska zoga song/rhythm
      - Optional field (can be null)
  
  2. Notes
    - This allows participants to have audio recordings of their traditional songs
    - Audio playback will be available on the participant detail page
*/

ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS song_rhythm_audio_url text;
