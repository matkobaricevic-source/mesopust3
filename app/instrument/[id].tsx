import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Instrument, Participant } from '@/types/database';
import { ArrowLeft, Music, Users, Disc3, Play, Pause, Volume2 } from 'lucide-react-native';
import { getImageSource } from '@/lib/imageUtils';

export default function InstrumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadInstrumentDetails();
  }, [id]);

  async function loadInstrumentDetails() {
    try {
      setLoading(true);
      setError(null);

      const { data: instrumentData, error: instrumentError } = await supabase
        .from('instruments')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (instrumentError) throw instrumentError;
      if (!instrumentData) throw new Error('Instrument not found');

      setInstrument(instrumentData);

      if (instrumentData.participant_id) {
        const { data: participantData, error: participantError } = await supabase
          .from('participants')
          .select('*')
          .eq('id', instrumentData.participant_id)
          .maybeSingle();

        if (participantError) throw participantError;
        setParticipant(participantData);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load instrument details'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleParticipantPress() {
    if (participant) {
      router.push(`/participant/${participant.id}`);
    }
  }

  function toggleAudio() {
    if (Platform.OS === 'web' && instrument?.audio_url) {
      if (!audioRef.current) {
        audioRef.current = new Audio(instrument.audio_url);
        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
        });
      }

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  }

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  if (error || !instrument) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Instrument nije pronađen'}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Natrag</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.back()}>
          <View style={styles.backButtonCircle}>
            <ArrowLeft size={22} color="#000000" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {instrument.name_croatian}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {instrument.image_url && getImageSource(instrument.image_url) && (
          <Image
            source={getImageSource(instrument.image_url)!}
            style={styles.instrumentImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.instrumentInfo}>
          <View style={styles.topRow}>
            <View style={styles.categoryBadge}>
              <Music size={16} color="#dc2626" />
              <Text style={styles.categoryText}>Instrument</Text>
            </View>
            {instrument.audio_url && Platform.OS === 'web' && (
              <TouchableOpacity
                style={styles.audioButton}
                onPress={toggleAudio}
                activeOpacity={0.7}>
                {isPlaying ? (
                  <Pause size={20} color="#ffffff" />
                ) : (
                  <Play size={20} color="#ffffff" />
                )}
                <Text style={styles.audioButtonText}>
                  {isPlaying ? 'Pauza' : 'Slušaj'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.instrumentName}>{instrument.name_croatian}</Text>

          {instrument.description_croatian && (
            <Text style={styles.instrumentDescription}>{instrument.description_croatian}</Text>
          )}

          {instrument.playing_technique && (
            <View style={styles.techniqueCard}>
              <Disc3 size={20} color="#dc2626" />
              <View style={styles.techniqueContent}>
                <Text style={styles.techniqueLabel}>Tehnika sviranja</Text>
                {instrument.playing_technique_croatian && (
                  <Text style={styles.techniqueText}>{instrument.playing_technique_croatian}</Text>
                )}
              </View>
            </View>
          )}

          {instrument.event_specific_notes && (
            <View style={styles.notesCard}>
              <Music size={16} color="#dc2626" />
              <Text style={styles.notesText}>{instrument.event_specific_notes}</Text>
            </View>
          )}
        </View>

        {participant && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Users size={20} color="#111827" />
              <Text style={styles.sectionTitle}>Koristi</Text>
            </View>

            <TouchableOpacity
              style={styles.participantCard}
              onPress={handleParticipantPress}
              activeOpacity={0.7}>
              <View style={styles.participantHeader}>
                <Text style={styles.participantName}>
                  {participant.name_croatian || participant.name}
                </Text>
              </View>
              <Text style={styles.participantDescription} numberOfLines={2}>
                {participant.description_croatian || participant.description}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    zIndex: 100,
  },
  headerBackButton: {
    marginRight: 8,
  },
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc2626',
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: 100,
  },
  instrumentImage: {
    width: '100%',
    height: 280,
  },
  instrumentInfo: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 8,
    borderBottomColor: '#f3f4f6',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  audioButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  instrumentName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  instrumentNameLocal: {
    fontSize: 20,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 12,
  },
  instrumentDescription: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  instrumentDescriptionLocal: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    marginTop: 8,
    fontStyle: 'italic',
  },
  techniqueCard: {
    flexDirection: 'row',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 12,
  },
  techniqueContent: {
    flex: 1,
  },
  techniqueLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 6,
  },
  techniqueText: {
    fontSize: 15,
    color: '#7f1d1d',
    lineHeight: 22,
  },
  techniqueTextLocal: {
    fontSize: 14,
    color: '#991b1b',
    lineHeight: 20,
    marginTop: 6,
    fontStyle: 'italic',
  },
  notesCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#dc2626',
    gap: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 8,
    borderBottomColor: '#f3f4f6',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  participantCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  participantHeader: {
    marginBottom: 8,
  },
  participantName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  participantNameCroatian: {
    fontSize: 15,
    fontWeight: '500',
    color: '#dc2626',
    marginTop: 2,
  },
  participantDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});
