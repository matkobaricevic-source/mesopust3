/*
  # Add Mesopustarska Zoga Moments Data

  1. Data Inserts
    - Insert moments for each tempo category
    - "Jako spora" - 1 moment
    - "Spora" - 1 moment
    - "Srednje spora" - 1 moment
    - "Srednja uobičajena" - 4 moments
    - "Srednje brza" - 2 moments
    - "Brza" - 1 moment

  2. Notes
    - All moments are in Croatian
    - Display order maintains logical sequence within each category
*/

-- Insert moments for "Jako spora" tempo
INSERT INTO zoga_moments (tempo_category_id, moment_name_croatian, display_order)
SELECT 
  id,
  'Sprogod mesopusta od kraja tri kruga oko grada na mesopusnu sredu do mosta na Ričini',
  1
FROM zoga_tempo_categories
WHERE name = 'Jako spora'
ON CONFLICT DO NOTHING;

-- Insert moments for "Spora" tempo
INSERT INTO zoga_moments (tempo_category_id, moment_name_croatian, display_order)
SELECT 
  id,
  'Tri kruga oko grada na mesopusnu sredu',
  1
FROM zoga_tempo_categories
WHERE name = 'Spora'
ON CONFLICT DO NOTHING;

-- Insert moments for "Srednje spora" tempo
INSERT INTO zoga_moments (tempo_category_id, moment_name_croatian, display_order)
SELECT 
  id,
  'Nedilja mesopusna, prvi izlazak mesopustara obučenih u odore na "placu"',
  1
FROM zoga_tempo_categories
WHERE name = 'Srednje spora'
ON CONFLICT DO NOTHING;

-- Insert moments for "Srednja uobičajena" tempo
INSERT INTO zoga_moments (tempo_category_id, moment_name_croatian, display_order)
SELECT 
  ztc.id,
  moments.moment_name,
  moments.display_order
FROM zoga_tempo_categories ztc,
(VALUES
  ('Prelaženje preko "place" svim danima od nedilje mesopusne nadalje osim mesopusne srede', 1),
  ('Tri kruga oko grada na treti mesopusni četrtak', 2),
  ('Tri kruga oko grada na mesopusnu nedilju', 3),
  ('Pozdravljanje grada i place', 4)
) AS moments(moment_name, display_order)
WHERE ztc.name = 'Srednja uobičajena'
ON CONFLICT DO NOTHING;

-- Insert moments for "Srednje brza" tempo
INSERT INTO zoga_moments (tempo_category_id, moment_name_croatian, display_order)
SELECT 
  ztc.id,
  moments.moment_name,
  moments.display_order
FROM zoga_tempo_categories ztc,
(VALUES
  ('Napovidanje dovcen i dovican', 1),
  ('Premještanje formacije do sljedeće kuće na pozdravljanju grada', 2)
) AS moments(moment_name, display_order)
WHERE ztc.name = 'Srednje brza'
ON CONFLICT DO NOTHING;

-- Insert moments for "Brza" tempo
INSERT INTO zoga_moments (tempo_category_id, moment_name_croatian, display_order)
SELECT 
  id,
  'Zoga nakon pozdrava po kućama cijeloga grada',
  1
FROM zoga_tempo_categories
WHERE name = 'Brza'
ON CONFLICT DO NOTHING;
