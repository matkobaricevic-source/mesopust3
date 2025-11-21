import { useEffect, useState } from 'react';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Music4, ChevronDown, ChevronUp } from 'lucide-react-native';
import { fonts } from '@/constants/fonts';
import { theme } from '@/constants/theme';
import { ModernCard } from '@/components/ModernCard';

interface ZogaInfo {
  id: string;
  description: string;
  description_croatian: string;
  audio_url: string | null;
}

interface TempoCategory {
  id: string;
  name: string;
  display_order: number;
}

interface ZogaMoment {
  id: string;
  tempo_category_id: string;
  moment_name: string;
  moment_name_croatian: string;
  description: string | null;
  description_croatian: string | null;
  display_order: number;
}

export default function ZogaScreen() {
  const [zogaInfo, setZogaInfo] = useState<ZogaInfo | null>(null);
  const [tempoCategories, setTempoCategories] = useState<TempoCategory[]>([]);
  const [zogaMoments, setZogaMoments] = useState<ZogaMoment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    loadZogaData();
  }, []);

  async function loadZogaData() {
    try {
      setLoading(true);

      const [infoResult, categoriesResult, momentsResult] = await Promise.all([
        supabase.from('zoga_info').select('*').maybeSingle(),
        supabase.from('zoga_tempo_categories').select('*').order('display_order'),
        supabase.from('zoga_moments').select('*').order('display_order'),
      ]);

      if (infoResult.error) throw infoResult.error;
      if (categoriesResult.error) throw categoriesResult.error;
      if (momentsResult.error) throw momentsResult.error;

      setZogaInfo(infoResult.data);
      setTempoCategories(categoriesResult.data || []);
      setZogaMoments(momentsResult.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load zoga data');
    } finally {
      setLoading(false);
    }
  }

  const getMomentsForCategory = (categoryId: string) => {
    return zogaMoments.filter((m) => m.tempo_category_id === categoryId);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

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
      <LinearGradient
        colors={theme.colors.secondary.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <BlurView intensity={20} tint="dark" style={styles.backButtonBlur}>
            <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2} />
          </BlurView>
        </TouchableOpacity>

        <Music4 size={64} color="rgba(255,255,255,0.95)" strokeWidth={1.5} />
        <Text style={styles.headerTitle}>Mesopustarska zoga</Text>
        <Text style={styles.headerSubtitle}>Tradicionalna glazba mesopustara</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {zogaInfo && (
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.cardWrapper}
          >
            <ModernCard>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>O zogi</Text>
                <Text style={styles.descriptionText}>{zogaInfo.description_croatian}</Text>
              </View>
            </ModernCard>
          </Animated.View>
        )}

        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.cardWrapper}
        >
          <ModernCard>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Brzine izvođenja</Text>
              <Text style={styles.sectionDescription}>
                Zoga se svira različitim brzinama ovisno o trenutku ili događaju
              </Text>

              {tempoCategories.map((category) => {
                const moments = getMomentsForCategory(category.id);
                const isExpanded = expandedCategories.has(category.id);

                return (
                  <View key={category.id} style={styles.tempoCategory}>
                    <TouchableOpacity
                      style={styles.tempoCategoryHeader}
                      onPress={() => toggleCategory(category.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.tempoCategoryName}>{category.name}</Text>
                      <View style={styles.tempoCategoryRight}>
                        <View style={styles.momentCount}>
                          <Text style={styles.momentCountText}>{moments.length}</Text>
                        </View>
                        {isExpanded ? (
                          <ChevronUp size={20} color={theme.colors.text.secondary} strokeWidth={2} />
                        ) : (
                          <ChevronDown size={20} color={theme.colors.text.secondary} strokeWidth={2} />
                        )}
                      </View>
                    </TouchableOpacity>

                    {isExpanded && moments.length > 0 && (
                      <View style={styles.momentsContainer}>
                        {moments.map((moment, index) => (
                          <View
                            key={moment.id}
                            style={[
                              styles.momentItem,
                              index === moments.length - 1 && styles.momentItemLast,
                            ]}
                          >
                            <View style={styles.momentBullet} />
                            <Text style={styles.momentText}>
                              {moment.moment_name_croatian || moment.moment_name}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </ModernCard>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: theme.spacing.lg,
    zIndex: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonBlur: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: fonts.heading,
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text.inverse,
    textAlign: 'center',
    marginTop: 8,
  },
  headerSubtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  cardWrapper: {
    marginBottom: theme.spacing.sm,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  sectionDescription: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.text.secondary,
    marginTop: -8,
  },
  descriptionText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: theme.colors.text.primary,
  },
  tempoCategory: {
    marginTop: theme.spacing.sm,
  },
  tempoCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
  },
  tempoCategoryName: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    flex: 1,
  },
  tempoCategoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  momentCount: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  momentCountText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.inverse,
  },
  momentsContainer: {
    marginTop: theme.spacing.sm,
    paddingLeft: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  momentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  momentItemLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  momentBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary.main,
    marginTop: 7,
  },
  momentText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.text.primary,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: theme.colors.error.main,
    textAlign: 'center',
  },
});
