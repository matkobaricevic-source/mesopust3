/*
  # Add Advitor Uniform Items
  
  1. Changes
    - Clear costume_description from Advitor participant (move to structured uniform items)
    - Insert uniform items for Advitor role with detailed descriptions
  
  2. Uniform Items Added
    - Bela košulja / Bijela košulja (White shirt)
    - Kurdela (Ribbon with Croatian colors)
    - Crna jaketa / Crni sako (Black jacket)
    - Krem gaće / Krem hlače (Cream pants with stripes)
    - Kapa sa šiltom (Cap with visor and golden lyre)
    - Crne postole / Crne cipele (Black shoes)
    - Bele rukavice / Bijele rukavice (White gloves)
    - Lenta (Ceremonial sash with coat of arms)
    - Batica / palica (Ceremonial stick with tassels)
*/

-- Clear the costume_description as we'll use structured uniform_items instead
UPDATE participants 
SET costume_description = NULL
WHERE name_croatian = 'Advitor';

-- Insert uniform items for Advitor
INSERT INTO uniform_items (role_id, item_name, item_name_croatian, description, description_croatian, display_order)
VALUES
  (
    '6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
    'White shirt',
    'Bela košulja / Bijela košulja',
    'White shirt',
    'Bijela košulja',
    1
  ),
  (
    '6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
    'Ribbon',
    'Kurdela',
    'Ribbon under the collar',
    'Ispod kragne je traka (1-2 cm širine) u bojama hrvatske trobojnice (crvena, bijela, plava) zavezana u malu mašnu.',
    2
  ),
  (
    '6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
    'Black jacket',
    'Crna jaketa / Crni sako',
    'Black jacket',
    'Crna jaketa',
    3
  ),
  (
    '6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
    'Cream pants',
    'Krem gaće / Krem hlače',
    'Light beige pants with Croatian tricolor stripe',
    'Hlače su svjetlo bež (žućkaste) boje, ravnog klasičnog kroja, popeglane "na crtu". Uz vanjski šav svake nogavice, od pojasa do dna, prišivena je uska traka - trobojnica (1-2 cm širine - crvena, bijelo, plava - gledano sprijeda).',
    4
  ),
  (
    '6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
    'Cap with visor',
    'Kapa sa šiltom',
    'Black cap with visor decorated with golden lyre and feathers',
    'Na glavi crna kapa sa šiltom (oblika kao časnička kapa). Na sredini kape, sprijeda iznad čela je broš u obliku zlatne lire (glazbeni instrument). Iz lire se granaju zataknuta pijetlova pera u njegovim prirodnim bojama (crna sa odsjajima plave, ljubičaste i zelene). Kapa oko oboda ima četiri zlatne trake koje su širine 8-10 mm.',
    5
  ),
  (
    '6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
    'Black shoes',
    'Crne postole / Crne cipele',
    'Black polished shoes',
    'Crne, ulaštene cipele',
    6
  ),
  (
    '6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
    'White gloves',
    'Bele rukavice / Bijele rukavice',
    'White gloves',
    'Bijele rukavice',
    7
  ),
  (
    '6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
    'Ceremonial sash',
    'Lenta',
    'Ceremonial sash with Croatian coat of arms',
    'Ima lentu na lijevom ramenu koja je kopčana na desnom boku (prednji dio preko zadnjega). Lenta je svečana, sjajna (širine 15-20 cm) i također je u bojama trobojnice crven bijeli plavi sa hrvatskim grbom na sredini. Lenta je obrubljena zlatnom trakom i završava zlatnim resama dužine 5 cm. Na čistu sredu na sprogodu mesopusta preko lente stavlja se prozirni crni til koji označava žalost.',
    8
  ),
  (
    '6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
    'Ceremonial stick',
    'Batica / palica',
    'Ceremonial stick with tassels',
    'Advitor u ruci drži "baticu" (palicu) s lepršavim resama koje su u bojama hrvatske trobojnice raspoređene tako da svaka boja čini trećinu cijelokupnog "busena" od resa. Batica služi kao simbol upravljanja s kojom advitor doslovno upravlja ritmom zoge.',
    9
  )
ON CONFLICT DO NOTHING;
