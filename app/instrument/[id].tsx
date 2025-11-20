import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Instrument } from '@/types/database';
import { Music } from 'lucide-react-native';
import { DetailPageTemplate } from '@/components/DetailPageTemplate';
import { ModernCard } from '@/components/ModernCard';
import { theme } from '@/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function InstrumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInstrumentDetails();
  }, [id]);

  async function loadInstrumentDetails() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('instruments')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (fetchError) throw fetchError;
      if (!data) throw new Error('Instrument not found');
      setInstrument(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load instrument');
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

  if (error || !instrument) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Not found'}</Text>
      </View>
    );
  }

  return (
    <DetailPageTemplate
      title={instrument.name_croatian || instrument.name}
      imageUrl={instrument.image_url}
      gradientColors={theme.colors.secondary.gradient}
      icon={<Music size={64} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />}
    >
      {instrument.description_croatian && (
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <ModernCard style={styles.card}>
            <Text style={styles.description}>{instrument.description_croatian}</Text>
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
