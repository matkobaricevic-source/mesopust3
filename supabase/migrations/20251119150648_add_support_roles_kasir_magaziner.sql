/*
  # Add Support Roles - Kasir and Magaziner

  ## Overview
  Adds two support roles to the hierarchy_roles table for the Mesopustari formation.

  ## Data Added
  
  ### Hierarchy Roles
  1. **Kasir (Treasurer)**
     - Manages financial matters and collections during the procession
     - Carries a traditional wallet or pouch
     - Position: Support role in left and right columns
  
  2. **Magaziner (Keeper/Steward)**
     - Responsible for equipment, costumes, and supplies
     - Carries a bag or container for various items
     - Position: Support role in the middle column

  ## Display Order
  - Kasir: 4 (after captains)
  - Magaziner: 5 (after Kasir)
*/

-- Get Mesopustari participant ID
DO $$
DECLARE
  mesopustari_id uuid;
BEGIN
  SELECT id INTO mesopustari_id FROM participants WHERE name = 'Mesopustari' LIMIT 1;

  IF mesopustari_id IS NOT NULL THEN
    -- Insert support roles
    INSERT INTO hierarchy_roles (id, participant_id, title, title_croatian, description_croatian, display_order) VALUES
    (
      '9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f',
      mesopustari_id,
      'Treasurer',
      'Kasir',
      'Kasir je zadužen za financijske poslove i prikupljanje priloga tijekom mesopusne povorke. Nosi tradicionalnu kesu ili novčanik i brine se o financijskoj strani događaja.',
      4
    ),
    (
      '0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a',
      mesopustari_id,
      'Keeper',
      'Magaziner',
      'Magaziner je zadužen za opremu, kostime i potrebne stvari tijekom mesopusta. Nosi torbu ili spremnik s raznim potrebštinama i brine se da sve bude na svom mjestu.',
      5
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
