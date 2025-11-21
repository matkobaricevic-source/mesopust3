/*
  # Add Short Description Fields to Hierarchy Roles

  1. Changes
    - Add `short_description` (text) column to `hierarchy_roles` table
    - Add `short_description_croatian` (text) column to `hierarchy_roles` table
  
  2. Purpose
    - Enable display of brief role summaries in dropdown menus
    - Keep detailed descriptions for role detail pages
    - Improve user experience with quick, scannable information

  Note: Short descriptions are concise summaries (1-2 sentences) while regular descriptions remain detailed explanations.
*/

-- Add short description fields to hierarchy_roles table
ALTER TABLE hierarchy_roles 
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS short_description_croatian TEXT;