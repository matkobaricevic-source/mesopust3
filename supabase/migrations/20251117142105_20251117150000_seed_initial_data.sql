/*
  # Seed Initial Data for Mesopust Novlje

  ## Overview
  Populates the database with initial events and participants for the Mesopust folk tradition.

  ## Data Added
  
  ### Events
  - Napovidanje (Announcement)
  - Mesopusna nedilja (Carnival Sunday)
  - Mišenje mesopusta (Burial of Carnival)
  - Zeča (sub-event of Napovidanje)

  ### Participants
  - Mesopustari (Main carnival participants)
  - Novljansko kolo (Traditional dance group)
  - Sopci (Musical group)
  - Pivači kola (Circle dancers/singers)
  - Advitor (Leader)
  - Mlada mesopustova (Young bride group)
*/

-- Insert Events
INSERT INTO events (id, title, title_local, description, image_url, display_order, show_in_main_menu) VALUES
('4bacfe02-bdda-4bdf-8f4d-c589647fb0c3', 'Napovidanje', 'Napovidanje', 'Traditional announcement ceremony that marks the beginning of the Mesopust carnival festivities in Novlje.', 'napovidanje.jpg', 1, true),
('8f3c2a1b-5e4f-4c8d-9b2a-6d7e8f9a0b1c', 'Mesopusna nedilja', 'Mesopusna nedilja', 'Carnival Sunday - the main day of celebration with traditional performances and processions.', 'Mesopustari.jpg', 2, true),
('9e4d3b2c-6f5a-4d9e-0c3b-7e8f9a0b1c2d', 'Mišenje mesopusta', 'Mišenje mesopusta', 'The ceremonial burial of the carnival, marking the end of festivities and transition to Lent.', 'Misenje-mesopusta.jpg', 3, true),
('5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d', 'Zeča', 'Zeča', 'The third day of Napovidanje, a special ceremony within the announcement period.', 'Zeca.jpg', 4, false)
ON CONFLICT (id) DO NOTHING;

-- Set Zeča as sub-event of Napovidanje
UPDATE events SET parent_event_id = '4bacfe02-bdda-4bdf-8f4d-c589647fb0c3' WHERE id = '5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d';

-- Set costume note for Napovidanje
UPDATE events SET costume_note = 'CIVILNA ODJEĆA' WHERE id = '4bacfe02-bdda-4bdf-8f4d-c589647fb0c3';

-- Insert Participants
INSERT INTO participants (id, name, name_croatian, description, description_croatian, image_url, display_order, show_in_main_menu) VALUES
('1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'Mesopustari', 'Mesopustari', 'The main carnival performers who wear traditional masks and costumes, carrying out ritualistic performances throughout the festivities.', 'Glavni izvođači mesopusta koji nose tradicionalne maske i kostime, izvodeći ritualne nastupe tijekom svečanosti.', 'Mesopustari.jpg', 1, true),
('2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'Novljansko kolo', 'Novljansko kolo', 'Traditional circle dance group that performs the iconic Novljansko kolo, a UNESCO-recognized intangible cultural heritage.', 'Grupa tradicionalnog kola koja izvodi poznato Novljansko kolo, UNESCO-vu nematerijalnu kulturnu baštinu.', 'Novljansko-kolo.jpg', 2, true),
('3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'Sopci', 'Sopci', 'Musical group that plays traditional instruments and provides rhythmic accompaniment for the carnival processions.', 'Glazbena skupina koja svira tradicionalne instrumente i pruža ritmičku pratnju za mesopusne povorke.', 'Sopci.JPG', 3, true),
('4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a', 'Pivači kola', 'Pivači kola', 'Singers who lead the traditional circle dance songs, maintaining the vocal traditions of the Novlje region.', 'Pjevači koji vode pjesme tradicionalnog kola, održavajući vokalne tradicije novljanskog kraja.', 'Pivaci-kola.jpg', 4, true),
('5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b', 'Advitor', 'Advitor', 'The ceremonial leader and organizer of the Mesopust festivities, holding the highest position in the carnival hierarchy.', 'Ceremonijalni vođa i organizator Mesopusta, koji drži najviši položaj u hijerarhiji karnevala.', 'Advitor.jpg', 5, true)
ON CONFLICT (id) DO NOTHING;

-- Link participants to events
INSERT INTO event_participants (event_id, participant_id, role_description) VALUES
('4bacfe02-bdda-4bdf-8f4d-c589647fb0c3', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'Main performers during announcement'),
('4bacfe02-bdda-4bdf-8f4d-c589647fb0c3', '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b', 'Leader of the ceremony'),
('8f3c2a1b-5e4f-4c8d-9b2a-6d7e8f9a0b1c', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'Primary carnival performers'),
('8f3c2a1b-5e4f-4c8d-9b2a-6d7e8f9a0b1c', '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'Traditional dance performance'),
('8f3c2a1b-5e4f-4c8d-9b2a-6d7e8f9a0b1c', '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'Musical accompaniment'),
('8f3c2a1b-5e4f-4c8d-9b2a-6d7e8f9a0b1c', '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a', 'Leading the songs'),
('9e4d3b2c-6f5a-4d9e-0c3b-7e8f9a0b1c2d', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'Ceremonial burial performance')
ON CONFLICT (event_id, participant_id) DO NOTHING;