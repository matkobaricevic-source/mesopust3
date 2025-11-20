import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { UniformItem } from '@/types/database';
import { Shirt } from 'lucide-react-native';
import { DetailPageTemplate } from '@/components/DetailPageTemplate';
import { ModernCard } from '@/components/ModernCard';
import { theme } from '@/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function UniformDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [uniform, setUniform] = useState<UniformItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUniformDetails();
  }, [id]);

  async function loadUniformDetails() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('uniform_items')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (fetchError) throw fetchError;
      if (!data) throw new Error('Uniform item not found');
      setUniform(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load uniform');
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

  if (error || !uniform) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Not found'}</Text>
      </View>
    );
  }

  return (
    <DetailPageTemplate
      title={uniform.item_name_croatian || uniform.item_name}
      imageUrl={uniform.image_url}
      gradientColors={theme.colors.accent.gradient}
      icon={<Shirt size={64} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />}
    >
      {uniform.description_croatian && (
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <ModernCard style={styles.card}>
            <Text style={styles.description}>{uniform.description_croatian}</Text>
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
