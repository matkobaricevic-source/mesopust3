/*
  # Seed Instruments Data

  ## Overview
  Populates the instruments table with traditional Mesopust instruments used by Mesopustari.

  ## Data Added
  
  ### Instruments (14 total)
  1. Odgovaralica (Caller/Leader instrument) - 2x
  2. Švikavac (Whistle) - 2x
  3. Činele (Cymbals) - 2x
  4. Mali bubanj (Small drum) - 2x
  5. Veli bubanj (Large drum) - 2x
  6. Zvonca (Bells) - 2x
  7. Triangl (Triangle) - 2x
  8. Bandira (Flag/Banner) - 1x (middle position)

  All instruments are linked to the Mesopustari participant.
*/

-- Get Mesopustari participant ID
DO $$
DECLARE
  mesopustari_id uuid;
BEGIN
  SELECT id INTO mesopustari_id FROM participants WHERE name = 'Mesopustari' LIMIT 1;

  IF mesopustari_id IS NOT NULL THEN
    -- Insert instruments if they don't exist
    INSERT INTO instruments (id, participant_id, name, name_croatian, description_croatian, display_order) VALUES
    -- Odgovaralica (Leader instrument)
    ('a1b2c3d4-0001-0000-0000-000000000001', mesopustari_id, 'Caller', 'Odgovaralica', 'Vodeći instrument koji poziva i koordinira ostale svirače u formaciji.', 1),
    ('a1b2c3d4-0001-0000-0000-000000000002', mesopustari_id, 'Caller', 'Odgovaralica', 'Vodeći instrument koji poziva i koordinira ostale svirače u formaciji.', 2),
    
    -- Švikavac (Whistle)
    ('a1b2c3d4-0002-0000-0000-000000000001', mesopustari_id, 'Whistle', 'Švikavac', 'Tradicionalna zviždaljka koja proizvodi visoke tonove za ritam.', 3),
    ('a1b2c3d4-0002-0000-0000-000000000002', mesopustari_id, 'Whistle', 'Švikavac', 'Tradicionalna zviždaljka koja proizvodi visoke tonove za ritam.', 4),
    
    -- Činele (Cymbals)
    ('a1b2c3d4-0003-0000-0000-000000000001', mesopustari_id, 'Cymbals', 'Činele', 'Metalni tanjuri koji se udaraju jedan o drugi za jak zvuk.', 5),
    ('a1b2c3d4-0003-0000-0000-000000000002', mesopustari_id, 'Cymbals', 'Činele', 'Metalni tanjuri koji se udaraju jedan o drugi za jak zvuk.', 6),
    
    -- Mali bubanj (Small drum)
    ('a1b2c3d4-0004-0000-0000-000000000001', mesopustari_id, 'Small Drum', 'Mali bubanj', 'Manji bubanj koji daje brže i oštrije ritmove.', 7),
    ('a1b2c3d4-0004-0000-0000-000000000002', mesopustari_id, 'Small Drum', 'Mali bubanj', 'Manji bubanj koji daje brže i oštrije ritmove.', 8),
    
    -- Veli bubanj (Large drum)
    ('a1b2c3d4-0005-0000-0000-000000000001', mesopustari_id, 'Large Drum', 'Veli bubanj', 'Veliki bubanj koji daje duboke, snažne ritmove kao osnovu glazbe.', 9),
    ('a1b2c3d4-0005-0000-0000-000000000002', mesopustari_id, 'Large Drum', 'Veli bubanj', 'Veliki bubanj koji daje duboke, snažne ritmove kao osnovu glazbe.', 10),
    
    -- Zvonca (Bells)
    ('a1b2c3d4-0006-0000-0000-000000000001', mesopustari_id, 'Bells', 'Zvonca', 'Zvona koja stvaraju melodične zvukove i obogaćuju glazbenu pratnju.', 11),
    ('a1b2c3d4-0006-0000-0000-000000000002', mesopustari_id, 'Bells', 'Zvonca', 'Zvona koja stvaraju melodične zvukove i obogaćuju glazbenu pratnju.', 12),
    
    -- Triangl (Triangle)
    ('a1b2c3d4-0007-0000-0000-000000000001', mesopustari_id, 'Triangle', 'Triangl', 'Metalni trokut koji se udara metalnom palicom za kristalno čisti zvuk.', 13),
    ('a1b2c3d4-0007-0000-0000-000000000002', mesopustari_id, 'Triangle', 'Triangl', 'Metalni trokut koji se udara metalnom palicom za kristalno čisti zvuk.', 14),
    
    -- Bandira (Flag/Banner) - special position in middle
    ('a1b2c3d4-0008-0000-0000-000000000001', mesopustari_id, 'Banner', 'Bandira', 'Ceremonijalna zastava koju nosi Bandiraš u središnjem redu formacije.', 15)
    
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
