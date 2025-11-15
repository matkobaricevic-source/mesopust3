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
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Instrument } from '@/types/database';
import {
  ArrowLeft,
  Music,
  Disc3,
  Drum,
  Bell,
  Flag,
  Megaphone,
  Triangle,
  CookingPot,
  Wallet,
  Wind,
} from 'lucide-react-native';

function getInstrumentIcon(instrumentName: string) {
  const name = instrumentName.toLowerCase();
  if (name.includes('odgovaralica')) return Megaphone;
  if (name.includes('mali bubanj')) return Drum;
  if (name.includes('veli bubanj')) return Drum;
  if (name.includes('činele')) return Disc3;
  if (name.includes('zvonca')) return Bell;
  if (name.includes('trumbeta')) return Music;
  if (name.includes('triangl')) return Triangle;
  if (name.includes('avan')) return CookingPot;
  if (name.includes('bandira')) return Flag;
  if (name.includes('švikavac')) return Wind;
  if (name.includes('kasa')) return Wallet;
  return Music;
}

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
      setError(null);

      const { data: participantData } = await supabase
        .from('participants')
        .select('id')
        .eq('name', 'Mesopustari')
        .maybeSingle();

      if (!participantData) {
        throw new Error('Mesopustari not found');
      }

      const { data, error: instrumentsError } = await supabase
        .from('instruments')
        .select('*')
        .eq('participant_id', participantData.id)
        .order('display_order', { ascending: true });

      if (instrumentsError) throw instrumentsError;
      setInstruments(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load instruments'
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Music size={32} color="#dc2626" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Instrumenti</Text>
            <Text style={styles.headerSubtitle}>
              Glazbala Mesopustara
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.instrumentsGrid}>
          {instruments.map((instrument) => {
            const IconComponent = getInstrumentIcon(instrument.name_croatian);
            return (
              <TouchableOpacity
                key={instrument.id}
                style={styles.instrumentCard}
                onPress={() => router.push(`/instrument/${instrument.id}`)}
                activeOpacity={0.7}>
                <View style={styles.instrumentContent}>
                  <View style={styles.instrumentHeader}>
                    <IconComponent size={18} color="#6b7280" />
                    <Text style={styles.instrumentName}>
                      {instrument.name_croatian}
                    </Text>
                  </View>

                  {instrument.description_croatian && (
                    <Text style={styles.instrumentDescription} numberOfLines={2}>
                      {instrument.description_croatian}
                    </Text>
                  )}

                  <Text style={styles.instrumentViewMore}>
                    Pogledaj detalje →
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  instrumentsGrid: {
    padding: 16,
    gap: 12,
  },
  instrumentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  instrumentContent: {
    flex: 1,
  },
  instrumentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instrumentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 10,
    flex: 1,
  },
  instrumentDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  instrumentViewMore: {
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '500',
  },
});
