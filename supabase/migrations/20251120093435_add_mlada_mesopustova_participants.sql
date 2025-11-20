/*
  # Add Mlada mesopustova character participants

  1. New Participants
    - Creates all character roles for the Mlada mesopustova event
    - Includes: Mladi, Mlada, Prve divice, Druge divice, Mala družba, Velika družba, 
      Dica, Stara nevista, Stara tašta, Domaćin, Domaćica, Pop, Ministar, Opčinar
  
  2. Event Relationships
    - Links all participants to the Mlada mesopustova event
  
  3. Display Order
    - Sets appropriate display order for each character role
*/

-- Insert Mlada mesopustova character participants
INSERT INTO participants (id, name, name_croatian, description, description_croatian, display_order, show_in_main_menu)
VALUES
  (gen_random_uuid(), 'Mladi', 'Mladi', 'The groom in the wedding ceremony', 'Mladoženja u svadbenom obredu', 100, false),
  (gen_random_uuid(), 'Mlada', 'Mlada', 'The bride in the wedding ceremony', 'Mlada u svadbenom obredu', 101, false),
  (gen_random_uuid(), 'Prve divice', 'Prve divice', 'First bridesmaids', 'Prve djeveruše', 102, false),
  (gen_random_uuid(), 'Druge divice', 'Druge divice', 'Second bridesmaids', 'Druge djeveruše', 103, false),
  (gen_random_uuid(), 'Mala družba', 'Mala družba', 'Small wedding party', 'Mala svadba', 104, false),
  (gen_random_uuid(), 'Velika družba', 'Velika družba', 'Large wedding party', 'Velika svadba', 105, false),
  (gen_random_uuid(), 'Dica', 'Dica', 'Children in the ceremony', 'Djeca u obredu', 106, false),
  (gen_random_uuid(), 'Stara nevista', 'Stara nevista', 'Old bride character', 'Stara nevjesta', 107, false),
  (gen_random_uuid(), 'Stara tašta', 'Stara tašta', 'Old mother-in-law character', 'Stara tašta', 108, false),
  (gen_random_uuid(), 'Domaćin', 'Domaćin', 'The host', 'Domaćin', 109, false),
  (gen_random_uuid(), 'Domaćica', 'Domaćica', 'The hostess', 'Domaćica', 110, false),
  (gen_random_uuid(), 'Pop', 'Pop', 'The priest', 'Svećenik', 111, false),
  (gen_random_uuid(), 'Ministar', 'Ministar', 'The minister', 'Ministar', 112, false),
  (gen_random_uuid(), 'Opčinar', 'Opčinar', 'The community representative', 'Općinski predstavnik', 113, false)
ON CONFLICT DO NOTHING;

-- Link all participants to Mlada mesopustova event
INSERT INTO event_participants (id, event_id, participant_id, role_description)
SELECT 
  gen_random_uuid(),
  'c2d3e4f5-a6b7-c8d9-e0f1-a2b3c4d5e6f7',
  p.id,
  p.description_croatian
FROM participants p
WHERE p.name_croatian IN ('Mladi', 'Mlada', 'Prve divice', 'Druge divice', 'Mala družba', 'Velika družba', 'Dica', 'Stara nevista', 'Stara tašta', 'Domaćin', 'Domaćica', 'Pop', 'Ministar', 'Opčinar')
ON CONFLICT DO NOTHING;
