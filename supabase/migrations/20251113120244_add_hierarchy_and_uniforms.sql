/*
  # Add Hierarchy Roles and Uniforms

  1. New Tables
    - `hierarchy_roles`
      - `id` (uuid, primary key)
      - `participant_id` (uuid, foreign key to participants)
      - `title` (text) - Role title in English (e.g., "Advitor", "First Captain")
      - `title_croatian` (text) - Role title in Croatian (e.g., "Advitor", "Prvi kapetan")
      - `description` (text) - Role description in English
      - `description_croatian` (text) - Role description in Croatian
      - `display_order` (integer) - Order to display roles
      - `created_at` (timestamp)
      
    - `uniform_items`
      - `id` (uuid, primary key)
      - `role_id` (uuid, foreign key to hierarchy_roles)
      - `item_name` (text) - Name of uniform item in English
      - `item_name_croatian` (text) - Name of uniform item in Croatian
      - `description` (text) - Description of the item
      - `description_croatian` (text) - Croatian description
      - `image_url` (text, nullable) - Image of the uniform item
      - `display_order` (integer) - Order to display items
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access (no authentication needed for viewing)

  3. Important Notes
    - Hierarchy system: Advitor (leader) → Prvi kapetan (First Captain) → Drugi kapetan (Second Captain) → Mesopustari (members)
    - Each role can have multiple uniform items
    - Users can view hierarchy and uniforms without authentication
*/

CREATE TABLE IF NOT EXISTS hierarchy_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  title text NOT NULL,
  title_croatian text NOT NULL,
  description text NOT NULL DEFAULT '',
  description_croatian text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS uniform_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES hierarchy_roles(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  item_name_croatian text NOT NULL,
  description text NOT NULL DEFAULT '',
  description_croatian text NOT NULL DEFAULT '',
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hierarchy_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE uniform_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hierarchy roles"
  ON hierarchy_roles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view uniform items"
  ON uniform_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_hierarchy_roles_participant ON hierarchy_roles(participant_id);
CREATE INDEX IF NOT EXISTS idx_uniform_items_role ON uniform_items(role_id);