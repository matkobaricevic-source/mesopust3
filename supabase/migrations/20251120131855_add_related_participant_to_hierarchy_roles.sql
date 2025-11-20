/*
  # Add Related Participant to Hierarchy Roles

  ## Overview
  Links hierarchy roles to their corresponding participant detail pages.
  For example, the "Advitor" role in Mesopustari hierarchy should link to the "Advitor" participant page.

  ## Changes Made
  1. Added `related_participant_id` column to `hierarchy_roles` table
  2. Added foreign key constraint to reference `participants` table
  3. This enables clicking on hierarchy roles to navigate to specific participant pages

  ## Important Notes
  - The field is nullable since not all roles may have a corresponding participant page
  - This allows hierarchy roles to function as navigation elements
*/

-- Add related_participant_id column to hierarchy_roles
ALTER TABLE hierarchy_roles
ADD COLUMN IF NOT EXISTS related_participant_id uuid REFERENCES participants(id) ON DELETE SET NULL;

-- Update existing Advitor role to link to Advitor participant
UPDATE hierarchy_roles
SET related_participant_id = (
  SELECT id FROM participants WHERE name = 'Advitor' LIMIT 1
)
WHERE title_croatian = 'Advitor';

-- Update Prvi kapitan role to link to Kumovi participant
UPDATE hierarchy_roles
SET related_participant_id = (
  SELECT id FROM participants WHERE name = 'Kumovi (Prvi i drugi mesopustarski kapitan)' LIMIT 1
)
WHERE title_croatian = 'Prvi kapitan';

-- Update Drugi kapitan role to link to Kumovi participant
UPDATE hierarchy_roles
SET related_participant_id = (
  SELECT id FROM participants WHERE name = 'Kumovi (Prvi i drugi mesopustarski kapitan)' LIMIT 1
)
WHERE title_croatian = 'Drugi kapitan';

-- Update Mesopustar role to link to Mesopustar participant if it exists
UPDATE hierarchy_roles
SET related_participant_id = (
  SELECT id FROM participants WHERE name = 'Mesopustar' LIMIT 1
)
WHERE title_croatian = 'Mesopustar';