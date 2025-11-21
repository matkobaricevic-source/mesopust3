import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { Music4 } from 'lucide-react-native';
import { fonts } from '@/constants/fonts';
import { theme } from '@/constants/theme';
import { ModernCard } from '@/components/ModernCard';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn} style={styles.header}>
          <LinearGradient
            colors={theme.colors.secondary.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <Music4 size={48} color="rgba(255,255,255,0.95)" strokeWidth={1.5} />
            <Text style={styles.headerTitle}>Mesopustarska zoga</Text>
            <Text style={styles.headerSubtitle}>Tradicionalna glazba mesopustara</Text>
          </LinearGradient>
        </Animated.View>

        {zogaInfo && (
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <ModernCard>
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>O zogi</Text>
                <Text style={styles.descriptionText}>{zogaInfo.description_croatian}</Text>
              </View>
            </ModernCard>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View style={styles.tempoSection}>
            <Text style={styles.sectionTitle}>Tempo i trenutci izvedbe</Text>
            <Text style={styles.sectionSubtitle}>
              Zoga se svira različitim tempom ovisno o trenutku ili događaju
            </Text>
          </View>
        </Animated.View>

        {tempoCategories.map((category, index) => {
          const moments = getMomentsForCategory(category.id);
          if (moments.length === 0) return null;

          return (
            <Animated.View
              key={category.id}
              entering={FadeInDown.delay(300 + index * 100).springify()}
            >
              <ModernCard>
                <View style={styles.categoryCard}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>
                  <View style={styles.momentsContainer}>
                    {moments.map((moment) => (
                      <View key={moment.id} style={styles.momentItem}>
                        <View style={styles.momentBullet} />
                        <View style={styles.momentContent}>
                          <Text style={styles.momentName}>
                            {moment.moment_name_croatian || moment.moment_name}
                          </Text>
                          {moment.description_croatian && (
                            <Text style={styles.momentDescription}>
                              {moment.description_croatian}
                            </Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </ModernCard>
            </Animated.View>
          );
        })}
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
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  headerGradient: {
    padding: 40,
    paddingTop: 80,
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: fonts.heading,
    fontSize: 32,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    marginTop: 16,
  },
  headerSubtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  infoSection: {
    gap: 16,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 8,
    marginBottom: 16,
  },
  descriptionText: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24,
    color: theme.colors.text.primary,
  },
  tempoSection: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  categoryCard: {
    gap: 16,
  },
  categoryHeader: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[300],
  },
  categoryName: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: theme.colors.primary.main,
  },
  momentsContainer: {
    gap: 16,
  },
  momentItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  momentBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary.main,
    marginTop: 6,
  },
  momentContent: {
    flex: 1,
    gap: 4,
  },
  momentName: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  momentDescription: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.text.secondary,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
  },
});
