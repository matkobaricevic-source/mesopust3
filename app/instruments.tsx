import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Instrument } from '@/types/database';
import { Music } from 'lucide-react-native';
import { getImageSource } from '@/lib/imageUtils';
import { fonts } from '@/constants/fonts';
import { theme } from '@/constants/theme';
import { ModernCard } from '@/components/ModernCard';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function InstrumentsScreen() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadInstruments();
  }, []);

  async function loadInstruments() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('instruments')
        .select('*')
        .order('display_order', { ascending: true });
      if (fetchError) throw fetchError;
      setInstruments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load instruments');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={instruments}
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
              <Text style={styles.headerTitle}>Instrumenti</Text>
              <Text style={styles.headerSubtitle}>Svi glazbeni instrumenti</Text>
            </LinearGradient>
          </Animated.View>
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(index * 50).springify()}
            style={styles.cardWrapper}
          >
            <ModernCard onPress={() => router.push(`/instrument/${item.id}`)}>
              <View style={styles.instrumentCard}>
                {item.image_url && getImageSource(item.image_url) ? (
                  <Image
                    source={getImageSource(item.image_url)!}
                    style={styles.instrumentImage}
                    resizeMode="cover"
                  />
                ) : (
                  <LinearGradient
                    colors={theme.colors.secondary.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.instrumentImagePlaceholder}
                  >
                    <Music size={32} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
                  </LinearGradient>
                )}
                <View style={styles.instrumentInfo}>
                  <Text style={styles.instrumentName}>
                    {item.name_croatian || item.name}
                  </Text>
                  {item.description_croatian && (
                    <Text style={styles.instrumentDescription} numberOfLines={2}>
                      {item.description_croatian}
                    </Text>
                  )}
                </View>
              </View>
            </ModernCard>
          </Animated.View>
        )}
      />
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
  },
  errorText: {
    ...theme.typography.body1,
    color: theme.colors.error.main,
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
  },
  listContent: {
    paddingTop: theme.spacing.lg,
    paddingBottom: 120,
  },
  cardWrapper: {
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  instrumentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  instrumentImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
  },
  instrumentImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instrumentInfo: {
    flex: 1,
  },
  instrumentName: {
    ...theme.typography.body1,
    color: theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  instrumentDescription: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
  },
});
