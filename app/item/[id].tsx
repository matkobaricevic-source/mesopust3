import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Package } from 'lucide-react-native';
import { DetailPageTemplate } from '@/components/DetailPageTemplate';
import { ModernCard } from '@/components/ModernCard';
import { theme } from '@/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItemDetails();
  }, [id]);

  async function loadItemDetails() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('searchable_items')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (fetchError) throw fetchError;
      if (!data) throw new Error('Item not found');
      setItem(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load item');
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

  if (error || !item) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Not found'}</Text>
      </View>
    );
  }

  return (
    <DetailPageTemplate
      title={item.name_local || item.name}
      imageUrl={item.image_url}
      gradientColors={theme.colors.primary.gradient}
      icon={<Package size={64} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />}
    >
      {item.description_local && (
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <ModernCard style={styles.card}>
            <Text style={styles.description}>{item.description_local}</Text>
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
