/*
  # Add correct Mlada mesopustova character participants

  1. New Participants
    - Mlada (mesopustova) - Man dressed as bride in authentic wedding attire
    - Mladoženja - Groom in formal suit with top hat
    - Kumovi (Prvi i drugi mesopustarski kapitan) - Best men in formal attire
    - Prve divice - Bridesmaids in white traditional dress
    - Soljače (i zazivače) - Relatives who throw figs and candy
    - Stari svati - Fathers of bride and groom with loud humorous role
    - Muška svaća, sopci, bandiraš - Men in traditional folk costume
    - Ženska svaća - Women in traditional folk costume
  
  2. Event Relationships
    - Links all participants to the Mlada mesopustova event
*/

-- Insert Mlada mesopustova character participants with full descriptions
INSERT INTO participants (id, name, name_croatian, description, description_croatian, display_order, show_in_main_menu)
VALUES
  (
    gen_random_uuid(), 
    'Mlada (mesopustova)', 
    'Mlada (mesopustova)', 
    'A mesopustar with gentle facial features, dressed in authentic women''s ceremonial Novalja costume for wedding ceremonies (berhan, šajnica, svilnica)',
    '„Mlada (mesopustova)" je „mesopustar", po mogućnosti nježnijih crta lica, obučen u žensku svečanu novljansku nošnju, sa svim svojim autentičnim elementima, namijenjenom za obred vjenčanja (berhan, šajnica, svilnica).',
    200,
    false
  ),
  (
    gen_random_uuid(),
    'Mladoženja',
    'Mladoženja',
    'The groom dressed in a suit with tuxedo jacket, white vest, white bow tie, white rose on the lapel, black top hat, and pocket watch with chain',
    '„Mladi" - Mladi je obučen u odijelo, obavezni gornji dio s frakom, ispod fraka bijeli prsluk, bijela leptir mašna oko vrata, a na prsima u džepu fraka, na reveru, ima „belu šipenicu" (ružu). Na glavi ima crni cilindar, a „va žepi" (džepu) gospocku uru s „kadinom" (lančićem).',
    201,
    false
  ),
  (
    gen_random_uuid(),
    'Kumovi (Prvi i drugi mesopustarski kapitan)',
    'Kumovi (Prvi i drugi mesopustarski kapitan)',
    'Best men dressed in suits with tuxedo jackets, black vests, black bow ties, white rose on the lapel, black top hats, and pocket watches with chains',
    'Kumovi su obučeni u odijela, obavezni gornji dio s frakom, ispod fraka crni prsluk, crne leptir mašne oko vrata, a na prsima u džepu fraka, na reveru, imaju „belu šipenicu" (ružu). Na glavi imaju crni cilindar, a „va žepi" (džepu) gospocku uru s „kadinom" (lančićem).',
    202,
    false
  ),
  (
    gen_random_uuid(),
    'Prve divice',
    'Prve divice',
    'Bridesmaids (sisters of bride and groom) - two mesopustari dressed in berhane (white ceremonial Novalja women''s costumes), with mandatory white headscarf. Jewelry made from carrots, with boxwood and red carnation in their chest',
    '„Prve divice" (djeveruše, sestre mlade i mladoga) - dva „mesopustara", obućeni u „berhane" (bijele svečane ženske novljanske nošnje), na glavi im je obavezno „beli rubac". U starije vrijeme nosile su i „svilnice" (beli rubac na glavi). Ogrlica i naušnice („kolajna" i „račine") izrađene su im od mrkve, u prsima imaju „malu goru" (šimšir) i „črljeni garoful" (crveni karanfil).',
    203,
    false
  ),
  (
    gen_random_uuid(),
    'Soljače (i zazivače)',
    'Soljače (i zazivače)',
    'Relatives who throw figs and candy to the crowd. Dressed in svilnice with hand-embroidered colorful headscarves, or in sarza/mezulanka. Jewelry made from carrots with peach leaves in their chest',
    '„Soljače" (i „zazivače") - (soljače – tete od mladenaca, zazivače - bliže rođakinje mlade i mladog) narod „sole" odnosno bacaju smokve, bonbonice. Po starijem običaju obučene su u „svilnice", na glavi im je ručno vezeni šareni rubac. Danas se vide i u „sarzi" ili „mezulanki". Ogrlica i naušnice („kolajna" i „račine") izrađene su im od mrkve, u prsima imaju listove broskve.',
    204,
    false
  ),
  (
    gen_random_uuid(),
    'Stari svati',
    'Stari svati',
    'Fathers of bride and groom with temperamental, loud and humorous role. They announce the wedding loudly from morning, calling each other "prijo" and shouting "Ženimo se, prijo!"',
    '„Stari svati" – predstavljaju očeve od mlade i mladog. Njihova temperamentna, glasna i humoristična uloga jedna je od najupečatljivijih taj dan. Već od jutarnjih sati glasno viču i nagoviještaju svatove. Jedan drugoga oslovljavaju s "prijo", a cijeli nagovještaj ide u tom tonu, uz poklike poput: „Ženimo se, prijo!", „Prijo, ženimo se!". Njihov govor karakteriziraju razni pogrdni termini, koji se koriste isključivo u duhu šale i s ciljem da što više nasmiju publiku. Obilaze cijeli grad, posjećuju mještane i kuće koje njeguju narodne običaje, kao i lokalne kafiće.',
    205,
    false
  ),
  (
    gen_random_uuid(),
    'Muška svaća, sopci, bandiraš',
    'Muška svaća, sopci, bandiraš',
    'Men wearing white shirts and undershirts, leather vest with fleece exterior, fur hat, wool socks and opanci shoes, hay in their socks, real or drawn mustaches',
    '„Muška svaća", „sopci", „bandiraš" – nose bijele „svitice" i „šotomaje" (podmajice), prsluk - kožun s vanjske strane od runa, na glavi šubaru, vunene „škrpete" (čarape) i opanci na nogama, sijeno u „škrpetama", brkovi pravi ili nacrtani.',
    206,
    false
  ),
  (
    gen_random_uuid(),
    'Ženska svaća',
    'Ženska svaća',
    'Women dressed in traditional folk costume sarze (with colorful headscarf) and kasi (with white headscarf), white crocheted stockings, with carrots and peach leaves as jewelry in their chest',
    '„Ženska svaća" – obućeni su u narodnu nošnju „sarze" (sa šareni rubcem ili maramom na glavi) i „kasi" (na glavi bele rupca), bijele heklane čarape, a kao nakit im je mrkva i broskva u prsima.',
    207,
    false
  )
ON CONFLICT DO NOTHING;

-- Link all participants to Mlada mesopustova event
INSERT INTO event_participants (id, event_id, participant_id, role_description)
SELECT 
  gen_random_uuid(),
  'c2d3e4f5-a6b7-c8d9-e0f1-a2b3c4d5e6f7',
  p.id,
  p.name_croatian
FROM participants p
WHERE p.display_order BETWEEN 200 AND 207
ON CONFLICT DO NOTHING;
