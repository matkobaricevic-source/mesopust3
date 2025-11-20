import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Participant } from '@/types/database';
import { Users, Music, Shirt } from 'lucide-react-native';
import { getImageSource } from '@/lib/imageUtils';
import { fonts } from '@/constants/fonts';
import { theme } from '@/constants/theme';
import { ModernCard } from '@/components/ModernCard';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

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
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Učitavanje...</Text>
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
          <Users size={64} color={theme.colors.neutral[300]} strokeWidth={1.5} />
          <Text style={styles.emptyText}>Nema dostupnih sudionika</Text>
        </View>
      ) : (
        <FlatList
          data={participants}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Animated.View entering={FadeIn} style={styles.header}>
              <LinearGradient
                colors={theme.colors.secondary.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
              >
                <Text style={styles.headerTitle}>Sudionici{'\n'}Mesopusta</Text>
                <Text style={styles.headerSubtitle}>Otkrijte sve uloge i ljude</Text>
              </LinearGradient>
            </Animated.View>
          }
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInDown.delay(index * 80).springify()}
              style={styles.participantCardWrapper}
            >
              <ModernCard onPress={() => handleParticipantPress(item)}>
                <View style={styles.imageContainer}>
                  {item.image_url && getImageSource(item.image_url) ? (
                    <Image
                      source={getImageSource(item.image_url)!}
                      style={styles.participantImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <LinearGradient
                      colors={theme.colors.secondary.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.participantImagePlaceholder}
                    >
                      <Users size={48} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
                    </LinearGradient>
                  )}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
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
                  <View style={styles.badgesContainer}>
                    {item.song_rhythm && (
                      <View style={styles.badge}>
                        <Music size={14} color={theme.colors.primary.main} strokeWidth={2} />
                        <Text style={styles.badgeText}>Glazba</Text>
                      </View>
                    )}
                    {item.costume_description && (
                      <View style={styles.badge}>
                        <Shirt size={14} color={theme.colors.primary.main} strokeWidth={2} />
                        <Text style={styles.badgeText}>Nošnja</Text>
                      </View>
                    )}
                  </View>
                </View>
              </ModernCard>
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
    borderRadius: theme.borderRadius.xl,
    marginHorizontal: theme.spacing.md,
  },
  headerGradient: {
    padding: theme.spacing.xl,
    paddingTop: 80,
    paddingBottom: theme.spacing.xl,
  },
  headerTitle: {
    ...theme.typography.display,
    fontSize: 36,
    color: theme.colors.text.inverse,
    fontFamily: fonts.title,
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    ...theme.typography.body1,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: fonts.regular,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    ...theme.typography.body1,
    color: theme.colors.text.secondary,
  },
  errorText: {
    ...theme.typography.body1,
    color: theme.colors.error.main,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: theme.colors.text.inverse,
    ...theme.typography.button,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  emptyText: {
    ...theme.typography.h4,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  listContent: {
    paddingTop: theme.spacing.lg,
    paddingBottom: 120,
  },
  participantCardWrapper: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  participantImage: {
    width: '100%',
    height: '100%',
  },
  participantImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  overlayContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: theme.spacing.lg,
  },
  participantNameOverlay: {
    ...theme.typography.h3,
    color: theme.colors.text.inverse,
    fontFamily: fonts.title,
  },
  participantContent: {
    padding: theme.spacing.lg,
  },
  participantDescription: {
    ...theme.typography.body1,
    color: theme.colors.text.secondary,
    lineHeight: 24,
    marginBottom: theme.spacing.md,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary.main + '15',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary.light + '30',
    gap: theme.spacing.xs,
  },
  badgeText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.primary.main,
  },
});
