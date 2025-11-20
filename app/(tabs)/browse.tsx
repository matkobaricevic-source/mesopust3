import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Participant } from '@/types/database';
import { Users, Music, Heart, ChevronRight } from 'lucide-react-native';
import { getImageSource } from '@/lib/imageUtils';
import { fonts } from '@/constants/fonts';

const { width: screenWidth } = Dimensions.get('window');
const getResponsiveImageHeight = () => {
  if (screenWidth < 375) return 140;
  if (screenWidth < 414) return 180;
  return 200;
};
const getResponsivePadding = () => {
  if (screenWidth < 375) return 12;
  return 16;
};

export default function ParticipantsScreen() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadParticipants();
  }, []);

  async function loadParticipants() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('participants')
        .select('*, instruments(*)')
        .eq('show_in_main_menu', true)
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;
      setParticipants(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load participants'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleParticipantPress(participant: Participant) {
    router.push(`/participant/${participant.id}`);
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#a855f7" />
        <Text style={styles.loadingText}>Učitavanje sudionika...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadParticipants}>
          <Text style={styles.retryButtonText}>Pokušaj ponovno</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {participants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Users size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>Nema dostupnih sudionika</Text>
        </View>
      ) : (
        <FlatList
          data={participants}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Sudionici mesopusta</Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.participantCardWrapper}>
              <TouchableOpacity
                style={styles.participantCard}
                onPress={() => handleParticipantPress(item)}
                activeOpacity={0.7}>
              <View style={styles.imageContainer}>
                {item.image_url && getImageSource(item.image_url) ? (
                  <Image
                    source={getImageSource(item.image_url)!}
                    style={styles.participantImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.participantImagePlaceholder}>
                    <Users size={48} color="#9ca3af" />
                  </View>
                )}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.imageGradient}
                />
                <View style={styles.overlayContent}>
                  <Text style={styles.participantNameOverlay}>
                    {item.name_croatian || item.name}
                  </Text>
                </View>
              </View>
              <View style={styles.participantContent}>
                <Text style={styles.participantDescription} numberOfLines={3}>
                  {item.description_croatian || item.description}
                </Text>
                {item.song_rhythm && (
                  <View style={styles.badge}>
                    <Music size={14} color="#a855f7" />
                    <Text style={styles.badgeText}>{item.song_rhythm}</Text>
                  </View>
                )}
                {item.costume_description && (
                  <View style={styles.badge}>
                    <Heart size={14} color="#a855f7" />
                    <Text style={styles.badgeText}>
                      {item.name === 'Mesopustari' ? 'Mesopustarske uniforme' : 'Tradicionalne nošnje'}
                    </Text>
                  </View>
                )}
              </View>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf5ff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#faf5ff',
    padding: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  headerContent: {
    width: '100%',
    maxWidth: 600,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: fonts.title,
    color: '#7c3aed',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#a855f7',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
  listContent: {
    paddingHorizontal: getResponsivePadding(),
    paddingBottom: 120,
  },
  participantCardWrapper: {
    marginBottom: 24,
    width: '100%',
  },
  participantCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 0,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  participantImage: {
    width: '100%',
    height: getResponsiveImageHeight(),
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  overlayContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
  },
  participantImagePlaceholder: {
    width: '100%',
    height: 220,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantContent: {
    padding: 20,
    paddingTop: 20,
  },
  participantNameOverlay: {
    fontSize: 24,
    fontFamily: fonts.title,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  participantDescription: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#faf5ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginTop: 10,
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: '#e9d5ff',
  },
  badgeText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: '#7c3aed',
    marginLeft: 6,
  },
});
