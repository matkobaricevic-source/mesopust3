import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { SearchableItem, Participant } from '@/types/database';
import { ArrowLeft, Package, Users } from 'lucide-react-native';
import { getImageSource } from '@/lib/imageUtils';

interface ParticipantWithUsage extends Participant {
  usage_notes: string | null;
}

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<SearchableItem | null>(null);
  const [participants, setParticipants] = useState<ParticipantWithUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadItemDetails();
  }, [id]);

  async function loadItemDetails() {
    try {
      setLoading(true);
      setError(null);

      const { data: itemData, error: itemError } = await supabase
        .from('searchable_items')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (itemError) throw itemError;
      if (!itemData) throw new Error('Item not found');

      setItem(itemData);

      const { data: participantData, error: participantError } = await supabase
        .from('participant_items')
        .select('usage_notes, participants(*)')
        .eq('item_id', id);

      if (participantError) throw participantError;

      const itemParticipants: ParticipantWithUsage[] = (
        participantData || []
      ).map((pi: any) => ({
        ...pi.participants,
        usage_notes: pi.usage_notes,
      }));

      itemParticipants.sort((a, b) => a.display_order - b.display_order);
      setParticipants(itemParticipants);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load item details'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleParticipantPress(participant: Participant) {
    router.push(`/participant/${participant.id}`);
  }

  function getCategoryLabel(category: string) {
    const labels: Record<string, string> = {
      clothing: 'Odjeća',
      instrument: 'Instrument',
      accessory: 'Dodatak',
      other: 'Ostalo',
    };
    return labels[category] || category;
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#e07856" />
      </View>
    );
  }

  if (error || !item) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Predmet nije pronađen'}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Natrag</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.back()}>
          <View style={styles.backButtonCircle}>
            <ArrowLeft size={22} color="#000000" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {item.name}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {item.image_url && getImageSource(item.image_url) && (
          <Image
            source={getImageSource(item.image_url)!}
            style={styles.itemImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.itemInfo}>
          <View style={styles.categoryBadge}>
            <Package size={16} color="#e07856" />
            <Text style={styles.categoryText}>{getCategoryLabel(item.category)}</Text>
          </View>

          <Text style={styles.itemName}>{item.name}</Text>
          {item.name_local && item.name_local !== item.name && (
            <Text style={styles.itemNameLocal}>{item.name_local}</Text>
          )}

          <Text style={styles.itemDescription}>{item.description_local || item.description}</Text>
        </View>

        {participants.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Users size={20} color="#111827" />
              <Text style={styles.sectionTitle}>Koriste</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              {participants.length}{' '}
              {participants.length === 1 ? 'akter koristi' : 'aktera koristi'} ovaj predmet
            </Text>

            <View style={styles.participantsGrid}>
              {participants.map((participant) => (
                <TouchableOpacity
                  key={participant.id}
                  style={styles.participantCard}
                  onPress={() => handleParticipantPress(participant)}
                  activeOpacity={0.7}>
                  <View style={styles.participantHeader}>
                    <Text style={styles.participantName}>
                      {participant.name}
                    </Text>
                    {participant.name_croatian && participant.name_croatian !== participant.name && (
                      <Text style={styles.participantNameCroatian}>
                        {participant.name_croatian}
                      </Text>
                    )}
                  </View>
                  {participant.usage_notes && (
                    <Text style={styles.usageNotes}>
                      {participant.usage_notes}
                    </Text>
                  )}
                  <Text style={styles.participantDescription} numberOfLines={2}>
                    {participant.description_croatian || participant.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {participants.length === 0 && (
          <View style={styles.emptySection}>
            <Users size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>Nema povezanih aktera</Text>
            <Text style={styles.emptySubtext}>
              Ovaj predmet trenutno nije povezan ni s jednim akterom
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8f5',
    width: '100%',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#faf8f5',
    padding: 20,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#faf8f5',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    zIndex: 100,
  },
  headerBackButton: {
    marginRight: 8,
  },
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e07856',
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    color: '#e07856',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: 100,
    width: '100%',
  },
  itemImage: {
    width: '100%',
    height: 280,
  },
  itemInfo: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e07856',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 8,
  },
  itemNameLocal: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e07856',
    marginBottom: 12,
  },
  itemDescription: {
    fontSize: 16,
    color: '#636e72',
    lineHeight: 24,
  },
  itemDescriptionLocal: {
    fontSize: 15,
    color: '#636e72',
    lineHeight: 22,
    marginTop: 8,
    fontStyle: 'italic',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3436',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 16,
  },
  participantsGrid: {
    gap: 12,
    alignItems: 'center',
    width: '100%',
  },
  participantCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#e07856',
    width: '100%',
    maxWidth: 600,
  },
  participantHeader: {
    marginBottom: 8,
  },
  participantName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2d3436',
  },
  participantNameCroatian: {
    fontSize: 15,
    fontWeight: '500',
    color: '#e07856',
    marginTop: 2,
  },
  usageNotes: {
    fontSize: 13,
    color: '#e07856',
    fontWeight: '600',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  participantDescription: {
    fontSize: 14,
    color: '#636e72',
    lineHeight: 20,
  },
  emptySection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#636e72',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
});
