/*
  # Add Croatian description field to events

  ## Changes
  - Adds `description_croatian` column to events table to support bilingual descriptions
  - Updates existing events with Croatian descriptions
*/

-- Add description_croatian column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS description_croatian TEXT;

-- Update events with Croatian descriptions
UPDATE events SET description_croatian = 'Tradicionalna ceremonija najave koja označava početak mesopusnih svečanosti u Novljama.' WHERE id = '4bacfe02-bdda-4bdf-8f4d-c589647fb0c3';
UPDATE events SET description_croatian = 'Prvi četrtak - Tusti, prvi dio Napovidanja.' WHERE id = 'e1f2a3b4-c5d6-e7f8-a9b0-c1d2e3f4a5b6';
UPDATE events SET description_croatian = 'Drugi četrtak - Kusi, drugi dio Napovidanja.' WHERE id = 'f2a3b4c5-d6e7-f8a9-b0c1-d2e3f4a5b6c7';
UPDATE events SET description_croatian = 'Treti četrtak - Poberuhi, treći i završni dio Napovidanja.' WHERE id = 'a3b4c5d6-e7f8-a9b0-c1d2-e3f4a5b6c7d8';
UPDATE events SET description_croatian = 'Treći dan Napovidanja, posebna ceremonija unutar razdoblja najave.' WHERE id = '5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d';
UPDATE events SET description_croatian = 'Mlada mesopustova - tradicionalni događaj koji slavi mladu nevestu karnevala.' WHERE id = 'c2d3e4f5-a6b7-c8d9-e0f1-a2b3c4d5e6f7';
UPDATE events SET description_croatian = 'Mesopusna subota - dan prije glavnog slavlja, s pripremama i ranim svečanostima.' WHERE id = '0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d';
UPDATE events SET description_croatian = 'Mesopusna nedilja - glavni dan slavlja s tradicionalnim nastupima i povorkama.' WHERE id = '8f3c2a1b-5e4f-4c8d-9b2a-6d7e8f9a0b1c';
UPDATE events SET description_croatian = 'Ceremonijalno pokapanje karnevala, koje označava kraj svečanosti i prijelaz na korizmeno razdoblje.' WHERE id = '9e4d3b2c-6f5a-4d9e-0c3b-7e8f9a0b1c2d';
UPDATE events SET description_croatian = 'Mesopusni ponedjeljak - dan nakon glavnog slavlja, nastavak svečanosti.' WHERE id = 'a0b1c2d3-e4f5-a6b7-c8d9-e0f1a2b3c4d5';
UPDATE events SET description_croatian = 'Mesopusni utorak - posljednji dan aktivnih slavlja prije ceremonije pokapanja.' WHERE id = 'b1c2d3e4-f5a6-b7c8-d9e0-f1a2b3c4d5e6';
UPDATE events SET description_croatian = 'Mesopusna srijeda - posljednji dan mesopusne sezone, koji označava kraj svečanosti.' WHERE id = 'd3e4f5a6-b7c8-d9e0-f1a2-b3c4d5e6f7a8';