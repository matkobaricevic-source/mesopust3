import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Search as SearchIcon, Calendar, Users, Package, BookOpen, Music, Shirt, Crown } from 'lucide-react-native';
import { fonts } from '@/constants/fonts';

interface SearchResult {
  id: string;
  type: 'event' | 'participant' | 'item' | 'glossary' | 'instrument' | 'uniform' | 'role';
  title: string;
  title_local: string | null;
  description: string;
  category?: string;
  participant_id?: string;
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function calculateRelevance(
    item: any,
    searchQuery: string,
    nameField: string,
    nameLocalField: string | null,
    descriptionField: string,
    descriptionLocalField: string | null = null
  ): number {
    const query = searchQuery.toLowerCase();
    const name = item[nameField]?.toLowerCase() || '';
    const nameLocal = nameLocalField && item[nameLocalField] ? item[nameLocalField].toLowerCase() : '';
    const description = item[descriptionField]?.toLowerCase() || '';
    const descriptionLocal = descriptionLocalField && item[descriptionLocalField] ? item[descriptionLocalField].toLowerCase() : '';

    if (name === query || nameLocal === query) return 1000;
    if (name.startsWith(query) || nameLocal.startsWith(query)) return 500;
    if (name.includes(query) || nameLocal.includes(query)) return 100;

    const words = query.split(/\s+/);
    const matchedWords = words.filter(
      word => name.includes(word) || nameLocal.includes(word) || description.includes(word) || descriptionLocal.includes(word)
    );
    if (matchedWords.length === words.length) return 50;
    if (matchedWords.length > 0) return 20;

    if (description.includes(query) || descriptionLocal.includes(query)) return 10;

    return 0;
  }

  async function handleSearch(searchQuery: string) {
    setQuery(searchQuery);

    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);

      const searchPattern = `%${searchQuery}%`;
      const allResults: SearchResult[] = [];

      const { data: items } = await supabase
        .from('searchable_items')
        .select('id, name, name_local, description, description_local, category, image_url')
        .or(`name.ilike.${searchPattern},name_local.ilike.${searchPattern},description.ilike.${searchPattern},description_local.ilike.${searchPattern}`);

      if (items) {
        items.forEach((i: any) => {
          const relevance = calculateRelevance(i, searchQuery, 'name', 'name_local', 'description', 'description_local');
          allResults.push({
            id: i.id,
            type: 'item' as const,
            title: i.name,
            title_local: i.name_local,
            description: i.description,
            category: i.category,
            relevance,
          } as any);
        });
      }

      const { data: participants } = await supabase
        .from('participants')
        .select('id, name, name_croatian, description, description_croatian, show_in_main_menu')
        .or(`name.ilike.${searchPattern},name_croatian.ilike.${searchPattern},description.ilike.${searchPattern},description_croatian.ilike.${searchPattern}`);

      if (participants) {
        participants.forEach((p: any) => {
          const relevance = calculateRelevance(p, searchQuery, 'name', 'name_croatian', 'description', 'description_croatian');
          allResults.push({
            id: p.id,
            type: p.show_in_main_menu ? 'participant' : 'role',
            title: p.name,
            title_local: p.name_croatian,
            description: p.description,
            relevance,
          } as any);
        });
      }

      const { data: events } = await supabase
        .from('events')
        .select('id, title, title_local, description')
        .or(`title.ilike.${searchPattern},title_local.ilike.${searchPattern},description.ilike.${searchPattern}`);

      if (events) {
        events.forEach((e) => {
          const relevance = calculateRelevance(e, searchQuery, 'title', 'title_local', 'description');
          allResults.push({
            id: e.id,
            type: 'event' as const,
            title: e.title,
            title_local: e.title_local,
            description: e.description,
            relevance,
          } as any);
        });
      }

      const { data: glossary } = await supabase
        .from('glossary_terms')
        .select('id, term, term_local, definition, definition_local')
        .or(`term.ilike.${searchPattern},term_local.ilike.${searchPattern},definition.ilike.${searchPattern},definition_local.ilike.${searchPattern}`);

      if (glossary) {
        glossary.forEach((g: any) => {
          const relevance = calculateRelevance(g, searchQuery, 'term', 'term_local', 'definition', 'definition_local');
          allResults.push({
            id: g.id,
            type: 'glossary' as const,
            title: g.term,
            title_local: g.term_local,
            description: g.definition,
            relevance,
          } as any);
        });
      }

      const { data: instruments } = await supabase
        .from('instruments')
        .select('id, participant_id, name, name_croatian, description, description_croatian')
        .or(`name.ilike.${searchPattern},name_croatian.ilike.${searchPattern},description.ilike.${searchPattern},description_croatian.ilike.${searchPattern}`);

      if (instruments) {
        instruments.forEach((i: any) => {
          const relevance = calculateRelevance(i, searchQuery, 'name', 'name_croatian', 'description', 'description_croatian');
          allResults.push({
            id: i.id,
            type: 'instrument' as const,
            title: i.name,
            title_local: i.name_croatian,
            description: i.description || '',
            participant_id: i.participant_id,
            relevance,
          } as any);
        });
      }

      const { data: uniforms } = await supabase
        .from('uniform_items')
        .select('id, role_id, item_name, item_name_croatian, description, description_croatian')
        .or(`item_name.ilike.${searchPattern},item_name_croatian.ilike.${searchPattern},description.ilike.${searchPattern},description_croatian.ilike.${searchPattern}`);

      if (uniforms) {
        uniforms.forEach((u: any) => {
          const relevance = calculateRelevance(u, searchQuery, 'item_name', 'item_name_croatian', 'description', 'description_croatian');
          allResults.push({
            id: u.id,
            type: 'uniform' as const,
            title: u.item_name,
            title_local: u.item_name_croatian,
            description: u.description,
            relevance,
          } as any);
        });
      }

      const { data: roles } = await supabase
        .from('hierarchy_roles')
        .select('id, participant_id, title, title_croatian, description, description_croatian')
        .or(`title.ilike.${searchPattern},title_croatian.ilike.${searchPattern},description.ilike.${searchPattern},description_croatian.ilike.${searchPattern}`);

      if (roles) {
        roles.forEach((r: any) => {
          const relevance = calculateRelevance(r, searchQuery, 'title', 'title_croatian', 'description', 'description_croatian');
          allResults.push({
            id: r.id,
            type: 'role' as const,
            title: r.title,
            title_local: r.title_croatian,
            description: r.description,
            participant_id: r.participant_id,
            relevance,
          } as any);
        });
      }

      // Deduplicate: If both glossary and instrument exist for same term, prefer instrument
      const deduplicatedResults = new Map();

      allResults.forEach((result: any) => {
        const normalizedTitle = (result.title_local || result.title).toLowerCase().trim();
        const existing = deduplicatedResults.get(normalizedTitle);

        if (!existing) {
          deduplicatedResults.set(normalizedTitle, result);
        } else {
          // Always prefer instrument over glossary when names match
          if (result.type === 'instrument') {
            deduplicatedResults.set(normalizedTitle, result);
          } else if (existing.type === 'instrument') {
            // Keep existing instrument, don't replace with glossary
            return;
          } else if (result.relevance > existing.relevance) {
            // For other cases, keep the one with higher relevance
            deduplicatedResults.set(normalizedTitle, result);
          }
        }
      });

      const finalResults = Array.from(deduplicatedResults.values());
      finalResults.sort((a: any, b: any) => b.relevance - a.relevance);
      setResults(finalResults);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleResultPress(result: SearchResult) {
    if (result.type === 'event') {
      router.push(`/event/${result.id}`);
    } else if (result.type === 'participant') {
      router.push(`/participant/${result.id}`);
    } else if (result.type === 'item') {
      router.push(`/item/${result.id}`);
    } else if (result.type === 'instrument') {
      router.push(`/instrument/${result.id}`);
    } else if (result.type === 'uniform') {
      router.push(`/uniform/${result.id}`);
    } else if (result.type === 'role') {
      router.push(`/uniform/${result.id}`);
    } else if (result.type === 'glossary') {
      router.push(`/(tabs)/glossary#${result.id}`);
    }
  }

  function getResultTypeLabel(type: string) {
    if (type === 'event') return 'Događaj';
    if (type === 'participant') return 'Skupina sudionika';
    if (type === 'item') return 'Predmet';
    if (type === 'glossary') return 'Pojam';
    if (type === 'instrument') return 'Instrument';
    if (type === 'uniform') return 'Odjeća';
    if (type === 'role') return 'Uloga';
    return 'Predmet';
  }

  function getResultIcon(type: string) {
    if (type === 'event') return <Calendar size={18} color="#dc2626" />;
    if (type === 'participant') return <Users size={18} color="#dc2626" />;
    if (type === 'item') return <Package size={18} color="#dc2626" />;
    if (type === 'glossary') return <BookOpen size={18} color="#dc2626" />;
    if (type === 'instrument') return <Music size={18} color="#dc2626" />;
    if (type === 'uniform') return <Shirt size={18} color="#dc2626" />;
    if (type === 'role') return <Crown size={18} color="#dc2626" />;
    return <Package size={18} color="#dc2626" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Pretraga</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <SearchIcon size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tražite događaje, sudionike ili predmete..."
            value={query}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#dc2626" />
        </View>
      )}

      {!loading && query.length >= 2 && results.length === 0 && (
        <View style={styles.emptyContainer}>
          <SearchIcon size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>Nema rezultata</Text>
          <Text style={styles.emptySubtext}>
            Pokušajte s drugim pojmovima
          </Text>
        </View>
      )}

      {!loading && query.length < 2 && (
        <View style={styles.emptyContainer}>
          <SearchIcon size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>Počnite pretraživati</Text>
          <Text style={styles.emptySubtext}>
            Unesite najmanje 2 znaka
          </Text>
        </View>
      )}

      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          contentContainerStyle={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultCard}
              onPress={() => handleResultPress(item)}
              activeOpacity={0.7}>
              <View style={styles.resultHeader}>
                {getResultIcon(item.type)}
                <Text style={styles.resultType}>
                  {getResultTypeLabel(item.type)}
                </Text>
              </View>
              <Text style={styles.resultTitle}>{item.title}</Text>
              {item.title_local && (
                <Text style={styles.resultTitleLocal}>{item.title_local}</Text>
              )}
              <Text style={styles.resultDescription} numberOfLines={2}>
                {item.description_croatian || item.description_local || item.description}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#f8f9fa',
    paddingTop: 60,
    paddingBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  headerContent: {
    width: '100%',
    maxWidth: 600,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: fonts.title,
    color: '#2d3436',
    letterSpacing: -0.5,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#2d3436',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  resultsContainer: {
    padding: 16,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 4,
  },
  resultTitleLocal: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc2626',
    marginBottom: 8,
  },
  resultDescription: {
    fontSize: 14,
    color: '#636e72',
    lineHeight: 22,
  },
});
