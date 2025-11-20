import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Participant, Event, HierarchyRole, Instrument } from '@/types/database';
import {
  ArrowLeft,
  Calendar,
  Music,
  Heart,
  Users,
  ChevronRight,
  ChevronDown,
  Disc3,
  Info,
  Drum,
  Bell,
  Flag,
  Megaphone,
  Triangle,
  CookingPot,
  Wallet,
  Wind,
  Play,
  Pause,
  Shirt,
  Grid3x3,
  Crown,
  PackageOpen,
} from 'lucide-react-native';
import { getImageSource } from '@/lib/imageUtils';

interface ParticipantEvent extends Event {
  role_description: string | null;
}

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

export default function ParticipantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [events, setEvents] = useState<ParticipantEvent[]>([]);
  const [hierarchyRoles, setHierarchyRoles] = useState<HierarchyRole[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailedInfo, setShowDetailedInfo] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isFormationExpanded, setIsFormationExpanded] = useState(false);
  const [isFormationDescExpanded, setIsFormationDescExpanded] = useState(false);
  const [isZogaExpanded, setIsZogaExpanded] = useState(false);
  const [isRolesExpanded, setIsRolesExpanded] = useState(false);
  const [isUniformExpanded, setIsUniformExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [audioData, setAudioData] = useState<number[]>(new Array(12).fill(0));
  const router = useRouter();

  useEffect(() => {
    loadParticipantDetails();
  }, [id]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  function setupAudioContext() {
    if (!audioRef.current || audioContextRef.current) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audioRef.current);

    analyser.fftSize = 64;
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
  }

  function updateVisualization() {
    if (!analyserRef.current || !isPlayingAudio) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    const bars = 12;
    const step = Math.floor(bufferLength / bars);
    const newAudioData = [];

    for (let i = 0; i < bars; i++) {
      const sum = dataArray.slice(i * step, (i + 1) * step).reduce((a, b) => a + b, 0);
      const average = sum / step;
      newAudioData.push(average / 255);
    }

    setAudioData(newAudioData);
    animationFrameRef.current = requestAnimationFrame(updateVisualization);
  }

  function toggleAudio() {
    if (Platform.OS === 'web' && participant?.song_rhythm_audio_url) {
      if (!audioRef.current) {
        audioRef.current = new Audio(participant.song_rhythm_audio_url);
        audioRef.current.addEventListener('ended', () => {
          setIsPlayingAudio(false);
          setAudioData(new Array(12).fill(0));
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
        });
      }

      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      } else {
        if (!audioContextRef.current) {
          setupAudioContext();
        }
        audioRef.current.play();
        setIsPlayingAudio(true);
        updateVisualization();
      }
    }
  }

  function getInstrumentIdByName(name: string): string | null {
    const instrument = instruments.find(i => i.name_croatian.toLowerCase().includes(name.toLowerCase()));
    return instrument?.id || null;
  }

  function getRoleIdByName(name: string): string | null {
    const role = hierarchyRoles.find(r => r.title_croatian.toLowerCase().includes(name.toLowerCase()));
    return role?.id || null;
  }

  function navigateToInstrument(name: string) {
    const instrumentId = getInstrumentIdByName(name);
    if (instrumentId) {
      router.push(`/instrument/${instrumentId}`);
    }
  }

  function navigateToRole(name: string) {
    const roleId = getRoleIdByName(name);
    if (roleId) {
      router.push(`/uniform/${roleId}`);
    }
  }

  async function loadParticipantDetails() {
    try {
      setLoading(true);
      setError(null);

      const { data: participantData, error: participantError } = await supabase
        .from('participants')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (participantError) throw participantError;
      if (!participantData) throw new Error('Participant not found');

      setParticipant(participantData);

      const { data: eventData, error: eventError } = await supabase
        .from('event_participants')
        .select('role_description, events(*)')
        .eq('participant_id', id);

      if (eventError) throw eventError;

      const participantEvents: ParticipantEvent[] = (eventData || []).map(
        (ep: any) => ({
          ...ep.events,
          role_description: ep.role_description,
        })
      );

      participantEvents.sort((a, b) => a.display_order - b.display_order);
      setEvents(participantEvents);

      const { data: rolesData, error: rolesError } = await supabase
        .from('hierarchy_roles')
        .select('*')
        .eq('participant_id', id)
        .order('display_order', { ascending: true });

      if (rolesError) throw rolesError;
      setHierarchyRoles(rolesData || []);

      const { data: instrumentsData, error: instrumentsError } = await supabase
        .from('instruments')
        .select('*')
        .eq('participant_id', id)
        .order('display_order', { ascending: true });

      if (instrumentsError) throw instrumentsError;
      setInstruments(instrumentsData || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load participant details'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleEventPress(event: Event) {
    router.push(`/event/${event.id}`);
  }

  function handleRolePress(role: HierarchyRole) {
    router.push(`/uniform/${role.id}`);
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  if (error || !participant) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {error || 'Sudionik nije pronađen'}
        </Text>
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
          {participant.name}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {participant.image_url && getImageSource(participant.image_url) && (
          <Image
            source={getImageSource(participant.image_url)!}
            style={styles.participantImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.participantInfo}>
          <Text style={styles.participantNameCroatian}>
            {participant.name_croatian}
          </Text>

          <View style={styles.darkContainer}>
            <Text style={styles.participantDescriptionCroatian}>
              {participant.description_croatian}
            </Text>


            {participant.song_rhythm && (
              <View style={styles.detailCard}>
                <TouchableOpacity
                  style={styles.detailCardHeader}
                  onPress={() => setIsZogaExpanded(!isZogaExpanded)}
                  activeOpacity={0.7}>
                  <View style={styles.detailIconContainer}>
                    <Play size={20} color="#9ca3af" />
                  </View>
                  <View style={styles.detailCardContent}>
                    <Text style={styles.detailLabel}>MESOPUSTARSKA ZOGA - POVIJEST</Text>
                    <Text style={styles.detailHint}>Pritisni za više informacija</Text>
                  </View>
                  <ChevronDown
                    size={20}
                    color="#9ca3af"
                    style={{
                      transform: [{ rotate: isZogaExpanded ? '180deg' : '0deg' }],
                    }}
                  />
                </TouchableOpacity>
                {isZogaExpanded && (
                  <>
                    <Text style={styles.detailTextExpanded}>{participant.song_rhythm}</Text>
                    {participant.song_rhythm_audio_url && Platform.OS === 'web' && (
                      <TouchableOpacity
                        style={styles.audioPlayButtonExpanded}
                        onPress={toggleAudio}
                        activeOpacity={0.7}>
                        {isPlayingAudio ? (
                          <>
                            <Pause size={16} color="#ffffff" />
                            <Text style={styles.audioButtonText}>Zaustavi audio</Text>
                          </>
                        ) : (
                          <>
                            <Play size={16} color="#ffffff" />
                            <Text style={styles.audioButtonText}>Sviraj audio</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                    {participant.song_rhythm_audio_url && Platform.OS === 'web' && isPlayingAudio && (
                      <View style={styles.visualizerContainer}>
                        {audioData.map((value, index) => {
                          const height = Math.max(4, value * 32);
                          return (
                            <View
                              key={index}
                              style={[
                                styles.visualizerBar,
                                {
                                  height: height,
                                  opacity: 0.6 + (value * 0.4),
                                },
                              ]}
                            />
                          );
                        })}
                      </View>
                    )}
                  </>
                )}
              </View>
            )}


            {participant.costume_description && (
              <View style={styles.detailCard}>
                <View style={styles.detailCardHeader}>
                  <View style={styles.detailIconContainer}>
                    <Shirt size={20} color="#9ca3af" />
                  </View>
                  <View style={styles.detailCardContent}>
                    <Text style={styles.detailLabel}>
                      {participant.name === 'Mesopustari' ? 'UNIFORME' : 'NOŠNJE'}
                    </Text>
                    <Text style={styles.detailText}>
                      {participant.costume_description}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.moreInfoButton}
              onPress={() => setShowDetailedInfo(true)}
              activeOpacity={0.7}>
              <Info size={20} color="#ffffff" />
              <Text style={styles.moreInfoButtonText}>Više informacija</Text>
            </TouchableOpacity>
          </View>
        </View>

        {participant.name === 'Mesopustari' && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.formationHeader}
              onPress={() => setIsFormationExpanded(!isFormationExpanded)}
              activeOpacity={0.7}>
              <View style={styles.formationHeaderContent}>
                <Text style={styles.sectionTitle}>Formacija</Text>
                <ChevronDown
                  size={24}
                  color="#1f2937"
                  style={{
                    transform: [{ rotate: isFormationExpanded ? '180deg' : '0deg' }],
                  }}
                />
              </View>
            </TouchableOpacity>

            {isFormationExpanded && (
              <>
              <Text style={styles.sectionSubtitle}>
                Raspored Mesopustara u formaciji
              </Text>
              <View style={styles.formationContainer}>
              <View style={styles.formationRow}>
                <View style={styles.formationColumn}>
                  <Text style={styles.formationColumnLabel}>Lijevi red</Text>
                  <TouchableOpacity style={styles.formationCircleLeader} onPress={() => navigateToRole('drugi kapetan')} activeOpacity={0.7}>
                    <Users size={18} color="#f59e0b" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.formationCircleSupport} onPress={() => navigateToRole('kasir')} activeOpacity={0.7}>
                    <Wallet size={16} color="#059669" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.formationCircleInstrument} onPress={() => navigateToInstrument('odgovaralica')} activeOpacity={0.7}>
                    <Megaphone size={16} color="#7c3aed" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.formationCircleInstrument} onPress={() => navigateToInstrument('švikavac')} activeOpacity={0.7}>
                    <Wind size={16} color="#7c3aed" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.formationCircleInstrument} onPress={() => navigateToInstrument('činele')} activeOpacity={0.7}>
                    <Disc3 size={16} color="#7c3aed" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.formationCircleInstrument} onPress={() => navigateToInstrument('mali bubanj')} activeOpacity={0.7}>
                    <Drum size={16} color="#7c3aed" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.formationCircleInstrument} onPress={() => navigateToInstrument('veli bubanj')} activeOpacity={0.7}>
                    <Drum size={16} color="#7c3aed" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.formationCircleInstrument} onPress={() => navigateToInstrument('zvonca')} activeOpacity={0.7}>
                    <Bell size={16} color="#7c3aed" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.formationCircleInstrument} onPress={() => navigateToInstrument('triangl')} activeOpacity={0.7}>
                    <Triangle size={16} color="#7c3aed" />
                  </TouchableOpacity>
                </View>

                <View style={styles.formationColumnMiddle}>
                  <Text style={styles.formationColumnLabel}>Srednji red</Text>
                  <View style={styles.formationSpacer} />
                  <TouchableOpacity style={styles.formationCircleLeader} onPress={() => navigateToRole('advitor')} activeOpacity={0.7}>
                    <Crown size={20} color="#f59e0b" />
                  </TouchableOpacity>
                  <View style={styles.formationSpacer} />
                  <View style={styles.formationSpacer} />
                  <View style={styles.formationSpacer} />
                  <View style={styles.formationSpacer} />
                  <View style={styles.formationSpacer} />
                  <View style={styles.formationSpacer} />
                  <View style={styles.formationSpacer} />
                  <View style={styles.formationSpacer} />
                  <View style={styles.formationSpacer} />
                  <View style={styles.formationSpacer} />
                  <View style={styles.formationSpacer} />
                  <View style={styles.formationSpacer} />
                  <TouchableOpacity style={styles.formationCircleFlag} onPress={() => navigateToInstrument('bandira')} activeOpacity={0.7}>
                    <Flag size={18} color="#15803d" />
                  </TouchableOpacity>
                  <View style={styles.formationSpacer} />
                  <View style={styles.formationSpacer} />
                  <View style={styles.formationSpacer} />
                  <View style={styles.formationSpacer} />
                  <View style={styles.formationSpacer} />
                  <TouchableOpacity style={styles.formationCircleSupport} onPress={() => navigateToRole('magaziner')} activeOpacity={0.7}>
                    <PackageOpen size={16} color="#059669" />
                  </TouchableOpacity>
                </View>

                <View style={styles.formationColumnRight}>
                  <Text style={styles.formationColumnLabel}>Desni red</Text>
                  <TouchableOpacity style={styles.formationCircleLeader} onPress={() => navigateToRole('prvi kapetan')} activeOpacity={0.7}>
                    <Users size={18} color="#f59e0b" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.formationCircleSupport} onPress={() => navigateToRole('kasir')} activeOpacity={0.7}>
                    <Wallet size={16} color="#059669" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.formationCircleInstrument} onPress={() => navigateToInstrument('odgovaralica')} activeOpacity={0.7}>
                    <Megaphone size={16} color="#7c3aed" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.formationCircleInstrument} onPress={() => navigateToInstrument('švikavac')} activeOpacity={0.7}>
                    <Wind size={16} color="#7c3aed" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.formationCircleInstrument} onPress={() => navigateToInstrument('činele')} activeOpacity={0.7}>
                    <Disc3 size={16} color="#7c3aed" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.formationCircleInstrument} onPress={() => navigateToInstrument('mali bubanj')} activeOpacity={0.7}>
                    <Drum size={16} color="#7c3aed" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.formationCircleInstrument} onPress={() => navigateToInstrument('veli bubanj')} activeOpacity={0.7}>
                    <Drum size={16} color="#7c3aed" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.formationCircleInstrument} onPress={() => navigateToInstrument('zvonca')} activeOpacity={0.7}>
                    <Bell size={16} color="#7c3aed" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.formationCircleInstrument} onPress={() => navigateToInstrument('triangl')} activeOpacity={0.7}>
                    <Triangle size={16} color="#7c3aed" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formationLegend}>
                <View style={styles.formationLegendItem}>
                  <View style={styles.formationLegendBoxLeader} />
                  <Text style={styles.formationLegendText}>Vođe - Advitor (s krunom) i Kapitani (3)</Text>
                </View>
                <View style={styles.formationLegendItem}>
                  <View style={styles.formationLegendBoxSupport} />
                  <Text style={styles.formationLegendText}>Podrška - Kasiri (2) i Magaziner (1)</Text>
                </View>
                <View style={styles.formationLegendItem}>
                  <View style={styles.formationLegendBoxInstrument} />
                  <Text style={styles.formationLegendText}>Instrumenti (14)</Text>
                </View>
                <View style={styles.formationLegendItem}>
                  <View style={styles.formationLegendBoxFlag} />
                  <Text style={styles.formationLegendText}>Bandiraš - nosač zastave (1)</Text>
                </View>
              </View>

              <View style={styles.formationPositions}>
                <Text style={styles.formationPositionsTitle}>Raspored pozicija:</Text>
                <View style={styles.formationPositionsList}>
                  <Text style={styles.formationPositionItem}>1. Kapitan (vođa reda)</Text>
                  <Text style={styles.formationPositionItem}>2. Kasir (blagajnik)</Text>
                  <Text style={styles.formationPositionItem}>3. Odgovaralica (truba)</Text>
                  <Text style={styles.formationPositionItem}>4. Trumbeta (tuba)</Text>
                  <Text style={styles.formationPositionItem}>5. Činele</Text>
                  <Text style={styles.formationPositionItem}>6. Veli bubanj</Text>
                  <Text style={styles.formationPositionItem}>7. Mali bubanj</Text>
                  <Text style={styles.formationPositionItem}>8. Zvonca</Text>
                  <Text style={styles.formationPositionItem}>9. Triangl</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.formationDescHeader}
                onPress={() => setIsFormationDescExpanded(!isFormationDescExpanded)}
                activeOpacity={0.7}>
                <View style={styles.formationDescHeaderContent}>
                  <View style={styles.formationDescTitleContainer}>
                    <Text style={styles.formationDescTitle}>Formacija mesopustara</Text>
                    <Text style={styles.formationDescSubtitle}>pogledaj više</Text>
                  </View>
                  <ChevronDown
                    size={20}
                    color="#e5e7eb"
                    style={{
                      transform: [{ rotate: isFormationDescExpanded ? '180deg' : '0deg' }],
                    }}
                  />
                </View>
              </TouchableOpacity>

              {isFormationDescExpanded && (
                <View style={styles.formationNote}>
                  <Info size={16} color="#6b7280" />
                  <Text style={styles.formationNoteText}>
                    Mesopustari stoje i kreću se u dva reda. Na prvom mjestu u lijevom i desnom redu stoje prvi i drugi mesopusni kapitan. Iza svakog kapitana redom jedan iza drugoga slijede: vela i mala sopila (svaka u jednom redu), vela trumbeta, manja trumbeta i odgovaralica, veli bubanj, činele, srednji bubanj, mali bubanj, zvončići, avan, triangul, kosa i kasiri. U sredini stoji advitor a iza njega magaziner. Od mesopusne nedilje do čiste srede (kada mesopustari nose svoje svečane odore) između advitora i magazinera stoji bandiraš koji nosi bandiru (zastavu) i puše po ritmu zoge u švikavac (žviždaljku). Svi se mesopustari kreću u ritmu zoge koju dirigira advitor, prema naprijed, sa sinkroniziranim korakom bez odstupanja.
                  </Text>
                </View>
              )}
            </View>
            </>
            )}
          </View>
        )}

        {hierarchyRoles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hijerarhija</Text>
            <Text style={styles.sectionSubtitle}>
              Struktura grupe Mesopustara
            </Text>

            <View style={styles.hierarchyGrid}>
              {hierarchyRoles
                .filter(role =>
                  role.title_croatian !== 'Magaziner' &&
                  role.title_croatian !== 'Bandiraš'
                )
                .map((role) => (
                  <TouchableOpacity
                    key={role.id}
                    style={styles.hierarchyCard}
                    onPress={() => handleRolePress(role)}
                    activeOpacity={0.7}>
                    <View style={styles.hierarchyHeader}>
                      <Users size={20} color="#dc2626" />
                      <View style={styles.hierarchyHeaderText}>
                        <Text style={styles.hierarchyTitle}>
                          {role.title_croatian}
                        </Text>
                      </View>
                      <ChevronRight size={20} color="#9ca3af" />
                    </View>
                    {role.description_croatian && (
                      <Text style={styles.hierarchyDescription}>
                        {role.description_croatian}
                      </Text>
                    )}
                    <Text style={styles.hierarchyViewUniform}>
                      Pogledaj uniformu →
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        )}

        {instruments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instrumenti</Text>
            <Text style={styles.sectionSubtitle}>
              Glazbala koja koriste Mesopustari
            </Text>

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
                        <ChevronRight size={18} color="#9ca3af" />
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
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Događaji</Text>
          <Text style={styles.sectionSubtitle}>
            Mesopust događaji s {participant.name}
          </Text>

          {events.length === 0 ? (
            <View style={styles.emptyEvents}>
              <Calendar size={48} color="#d1d5db" />
              <Text style={styles.emptyEventsText}>
                Nema zakazanih događaja
              </Text>
            </View>
          ) : (
            <View style={styles.eventsGrid}>
              {events.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => handleEventPress(event)}
                  activeOpacity={0.7}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  {event.title_local && (
                    <Text style={styles.eventTitleLocal}>
                      {event.title_local}
                    </Text>
                  )}
                  {event.role_description && (
                    <Text style={styles.eventRole}>{event.role_description}</Text>
                  )}
                  <Text style={styles.eventDescription} numberOfLines={2}>
                    {event.description_croatian || event.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showDetailedInfo}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailedInfo(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detaljne informacije</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDetailedInfo(false)}>
              <Text style={styles.modalCloseButtonText}>Zatvori</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalParticipantName}>{participant.name}</Text>
            {participant.name_croatian && (
              <Text style={styles.modalParticipantNameCroatian}>
                {participant.name_croatian}
              </Text>
            )}
            <Text style={styles.modalParticipantDescription}>
              {participant.description || participant.description_croatian}
            </Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    width: '100%',
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
    color: '#111827',
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
    width: '100%',
  },
  participantImage: {
    width: '100%',
    height: 280,
  },
  participantInfo: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 8,
    borderBottomColor: '#f3f4f6',
  },
  participantName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  participantNameCroatian: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  participantDescription: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 26,
    marginBottom: 8,
  },
  participantDescriptionCroatian: {
    fontSize: 15,
    color: '#9ca3af',
    lineHeight: 23,
    marginBottom: 16,
  },
  darkContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 20,
    padding: 20,
    marginTop: 4,
  },
  detailCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  detailCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  detailCardContent: {
    flex: 1,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  audioPlayButton: {
    backgroundColor: '#dc2626',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  visualizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  visualizerBar: {
    width: 6,
    backgroundColor: '#dc2626',
    borderRadius: 3,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  detailHint: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  detailTextExpanded: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  audioPlayButtonExpanded: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  audioButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  section: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  emptyEvents: {
    padding: 40,
    alignItems: 'center',
  },
  emptyEventsText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 12,
  },
  eventsGrid: {
    gap: 12,
    alignItems: 'center',
    width: '100%',
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    width: '100%',
    maxWidth: 600,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  eventTitleLocal: {
    fontSize: 15,
    fontWeight: '500',
    color: '#dc2626',
    marginBottom: 8,
  },
  eventRole: {
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '600',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  hierarchyGrid: {
    gap: 12,
  },
  hierarchyCard: {
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
  hierarchyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hierarchyHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  hierarchyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc2626',
  },
  hierarchyDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  hierarchyViewUniform: {
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '600',
  },
  instrumentsGrid: {
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
  moreInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 16,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  moreInfoButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalCloseButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalParticipantName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  modalParticipantNameCroatian: {
    fontSize: 22,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 16,
  },
  modalParticipantDescription: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 26,
    marginBottom: 24,
  },
  modalPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  modalPlaceholderText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 12,
  },
  formationContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  formationColumn: {
    flex: 1,
    gap: 8,
  },
  formationColumnRight: {
    flex: 1,
    gap: 8,
    alignItems: 'flex-end',
  },
  formationColumnMiddle: {
    flex: 1,
    gap: 8,
    alignItems: 'center',
  },
  formationColumnLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#dc2626',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  formationPerson: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
  },
  formationPersonText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '600',
  },
  formationCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formationCircleLeader: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fffbeb',
    borderWidth: 3,
    borderColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    marginVertical: 4,
  },
  formationPersonCaptain: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 2.5,
    borderColor: '#f59e0b',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  formationPersonCaptainText: {
    fontSize: 13,
    color: '#d97706',
    fontWeight: '700',
  },
  formationPersonFlag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#86efac',
  },
  formationPersonFlagText: {
    fontSize: 12,
    color: '#15803d',
    fontWeight: '600',
  },
  formationPersonInstrument: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#faf5ff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#c4b5fd',
  },
  formationPersonInstrumentText: {
    fontSize: 12,
    color: '#6d28d9',
    fontWeight: '600',
  },
  formationCircleInstrument: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f3ff',
    borderWidth: 2.5,
    borderColor: '#a78bfa',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  formationCircleFlag: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0fdf4',
    borderWidth: 2.5,
    borderColor: '#86efac',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  formationCircleSupport: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#d1fae5',
    borderWidth: 2.5,
    borderColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  formationPersonLeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 2.5,
    borderColor: '#f59e0b',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  formationPersonLeaderText: {
    fontSize: 13,
    color: '#d97706',
    fontWeight: '700',
  },
  formationSpacer: {
    height: 8,
  },
  formationLegend: {
    marginTop: 20,
    gap: 12,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  formationLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  formationLegendBox: {
    width: 28,
    height: 28,
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formationLegendBoxLeader: {
    width: 28,
    height: 28,
    backgroundColor: '#fef3c7',
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formationLegendBoxInstrument: {
    width: 28,
    height: 28,
    backgroundColor: '#faf5ff',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#c4b5fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formationLegendBoxFlag: {
    width: 28,
    height: 28,
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#86efac',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formationLegendBoxSupport: {
    width: 28,
    height: 28,
    backgroundColor: '#d1fae5',
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formationLegendText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  formationPositions: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fafaf9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  formationPositionsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#292524',
    marginBottom: 12,
  },
  formationPositionsList: {
    gap: 6,
  },
  formationPositionItem: {
    fontSize: 13,
    color: '#57534e',
    lineHeight: 20,
  },
  formationNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 16,
    padding: 14,
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  formationNoteText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 19,
  },
  formationHeader: {
    width: '100%',
    marginBottom: 16,
  },
  formationHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formationDescHeader: {
    width: '100%',
    marginTop: 16,
    marginBottom: 12,
  },
  formationDescHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#1f2937',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#374151',
  },
  formationDescTitleContainer: {
    flex: 1,
  },
  formationDescTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  formationDescSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9ca3af',
  },
  zogaInfoBox: {
    marginTop: 12,
    padding: 14,
    backgroundColor: '#f5f5f4',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#dc2626',
  },
  zogaInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  zogaTextContainer: {
    flex: 1,
  },
  zogaInfoTitle: {
    fontSize: 14,
    color: '#292524',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  zogaInfoSongName: {
    fontSize: 12,
    color: '#57534e',
    fontStyle: 'italic',
  },
  zogaPlayButton: {
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  rolesHeader: {
    width: '100%',
    marginBottom: 8,
  },
  rolesHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  rolesList: {
    marginTop: 16,
    gap: 12,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  roleNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  roleNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  roleText: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
    fontWeight: '600',
  },
  roleSubtext: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '400',
    fontStyle: 'italic',
  },
  uniformHeader: {
    width: '100%',
    marginBottom: 8,
  },
  uniformHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
});
