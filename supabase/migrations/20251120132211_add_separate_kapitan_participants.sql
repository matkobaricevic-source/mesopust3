/*
  # Add Separate Participants for Kapitani

  ## Overview
  Creates separate participant entries for Prvi kapitan and Drugi kapitan
  so they can have their own detail pages with uniforms and descriptions.

  ## Data Added
  1. Prvi kapitan (First Captain) - Individual participant with uniform details
  2. Drugi kapitan (Second Captain) - Individual participant with uniform details

  ## Changes Made
  - Added two new participants to the participants table
  - Updated hierarchy_roles to link to these new participants
  - Maintains the existing Kumovi participant for the general group page

  ## Important Notes
  - Each kapitan now has their own dedicated page
  - Hierarchy roles will navigate to individual kapitan pages
*/

-- Insert Prvi kapitan as a separate participant
INSERT INTO participants (id, name, name_croatian, description, description_croatian, image_url, display_order, show_in_main_menu)
VALUES (
  '7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d',
  'Prvi kapitan',
  'Prvi kapitan',
  'The First Captain is the highest-ranking officer in the Mesopust hierarchy after the Advitor. Responsible for organizing and leading the carnival participants.',
  'Prvi kapitan je najviši oficir u mesopusnoj hijerarhiji nakon Advitora. Odgovoran za organizaciju i vođenje mesopustara.',
  'Advitor.jpg',
  20,
  false
)
ON CONFLICT (id) DO NOTHING;

-- Insert Drugi kapitan as a separate participant
INSERT INTO participants (id, name, name_croatian, description, description_croatian, image_url, display_order, show_in_main_menu)
VALUES (
  '8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e',
  'Drugi kapitan',
  'Drugi kapitan',
  'The Second Captain assists the First Captain in organizing and managing the Mesopust carnival activities.',
  'Drugi kapitan pomaže Prvom kapitanu u organizaciji i upravljanju mesopusnim aktivnostima.',
  'Advitor.jpg',
  21,
  false
)
ON CONFLICT (id) DO NOTHING;

-- Update hierarchy_roles to link to the individual kapitans
UPDATE hierarchy_roles
SET related_participant_id = '7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d'
WHERE title_croatian = 'Prvi kapitan';

UPDATE hierarchy_roles
SET related_participant_id = '8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e'
WHERE title_croatian = 'Drugi kapitan';