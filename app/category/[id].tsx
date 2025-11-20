import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types/database';
import { MapPin } from 'lucide-react-native';
import { DetailPageTemplate } from '@/components/DetailPageTemplate';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { theme } from '@/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategoryDetails();
  }, [id]);

  async function loadCategoryDetails() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (fetchError) throw fetchError;
      if (!data) throw new Error('Category not found');
      setCategory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load category');
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

  if (error || !category) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Not found'}</Text>
      </View>
    );
  }

  return (
    <DetailPageTemplate
      title={category.title_local || category.title}
      imageUrl={category.image_url}
      gradientColors={theme.colors.accent.gradient}
      icon={<MapPin size={64} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />}
    >
      {category.description_croatian && (
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <ModernCard style={styles.card}>
            <Text style={styles.description}>{category.description_croatian}</Text>
          </ModernCard>
        </Animated.View>
      )}
    </DetailPageTemplate>
  );
}

const styles = StyleSheet.create({
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
  card: {
    padding: theme.spacing.lg,
  },
  description: {
    ...theme.typography.body1,
    color: theme.colors.text.secondary,
    lineHeight: 26,
  },
});
