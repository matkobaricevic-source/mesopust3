export interface Event {
  id: string;
  title: string;
  title_local: string | null;
  description: string;
  description_croatian: string | null;
  description_croatian_full: string | null;
  image_url: string | null;
  costume_note: string | null;
  event_date: string | null;
  day_name: string | null;
  parent_event_id: string | null;
  display_order: number;
  created_at: string;
}

export interface Category {
  id: string;
  event_id: string;
  title: string;
  title_local: string | null;
  description: string;
  description_croatian: string | null;
  icon_name: string | null;
  display_order: number;
  show_in_main_menu: boolean;
  created_at: string;
}

export interface ContentItem {
  id: string;
  category_id: string;
  title: string;
  title_local: string | null;
  body: string;
  body_local: string | null;
  historical_context: string | null;
  cultural_significance: string | null;
  media_type: string;
  media_url: string | null;
  display_order: number;
  created_at: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  term_local: string | null;
  definition: string;
  definition_local: string | null;
  pronunciation: string | null;
  related_events: string[] | null;
  created_at: string;
}

export interface Participant {
  id: string;
  name: string;
  name_croatian: string;
  description: string;
  description_croatian: string;
  instruments: string | null | Instrument[];
  song_rhythm: string | null;
  costume_description: string | null;
  image_url: string | null;
  display_order: number;
  show_in_main_menu: boolean;
  created_at: string;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  participant_id: string;
  role_description: string | null;
  created_at: string;
}

export interface HierarchyRole {
  id: string;
  participant_id: string;
  title: string;
  title_croatian: string;
  description: string;
  description_croatian: string;
  short_description: string | null;
  short_description_croatian: string | null;
  related_participant_id: string | null;
  display_order: number;
  created_at: string;
}

export interface UniformItem {
  id: string;
  role_id: string;
  item_name: string;
  item_name_croatian: string;
  description: string;
  description_croatian: string;
  image_url: string | null;
  display_order: number;
  created_at: string;
}

export interface Instrument {
  id: string;
  participant_id: string;
  name: string;
  name_croatian: string;
  description: string | null;
  description_croatian: string | null;
  playing_technique: string | null;
  playing_technique_croatian: string | null;
  image_url: string | null;
  audio_url: string | null;
  event_specific_notes: string | null;
  display_order: number;
  created_at: string;
}

export interface UserPhoto {
  id: string;
  user_id: string;
  event_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  updated_at: string;
}

export interface SearchableItem {
  id: string;
  name: string;
  name_local: string | null;
  description: string;
  description_local: string | null;
  category: string;
  image_url: string | null;
  display_order: number;
  created_at: string;
}

export interface ParticipantItem {
  id: string;
  participant_id: string;
  item_id: string;
  usage_notes: string | null;
  created_at: string;
}
