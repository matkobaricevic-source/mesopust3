import { useEffect, useState } from 'react';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Participant, Event, HierarchyRole, Instrument } from '@/types/database';
import { ArrowLeft, Calendar, Music, Shirt, Users, ChevronRight, Crown, ChevronDown, ChevronUp, Award, User, Flag } from 'lucide-react-native';
import { getImageSource } from '@/lib/imageUtils';
import { fonts } from '@/constants/fonts';
import { theme } from '@/constants/theme';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';

interface ParticipantEvent extends Event {
  role_description: string | null;
}

export default function ParticipantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [events, setEvents] = useState<ParticipantEvent[]>([]);
  const [hierarchyRoles, setHierarchyRoles] = useState<HierarchyRole[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isInstrumentsExpanded, setIsInstrumentsExpanded] = useState(false);
  const [isRolesExpanded, setIsRolesExpanded] = useState(false);
  const [isFormationExpanded, setIsFormationExpanded] = useState(false);
  const router = useRouter();

  function getHierarchyIcon(displayOrder: number) {
    switch (displayOrder) {
      case 1:
        return <Crown size={20} color={theme.colors.accent.main} strokeWidth={2} />;
      case 2:
        return <Award size={20} color={theme.colors.primary.main} strokeWidth={2} />;
      case 3:
        return <Award size={20} color={theme.colors.primary.main} strokeWidth={2} />;
      case 4:
        return <User size={20} color={theme.colors.text.secondary} strokeWidth={2} />;
      default:
        return <User size={20} color={theme.colors.text.secondary} strokeWidth={2} />;
    }
  }

  const handleFormationRolePress = (roleTitle: string) => {
    router.push(`/role/${encodeURIComponent(roleTitle)}`);
  };

  useEffect(() => {
    loadParticipantDetails();
  }, [id]);

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

      const [eventsResult, rolesResult, instrumentsResult] = await Promise.all([
        supabase
          .from('event_participants')
          .select('*, events(*)')
          .eq('participant_id', id)
          .order('display_order', { ascending: true }),
        supabase
          .from('hierarchy_roles')
          .select('*')
          .eq('participant_id', id)
          .eq('show_in_main_menu', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('instruments')
          .select('*')
          .eq('participant_id', id)
          .order('display_order', { ascending: true }),
      ]);

      const eventsWithRoles = (eventsResult.data || []).map((ep: any) => ({
        ...ep.events,
        role_description: ep.role_description,
      }));

      setEvents(eventsWithRoles);
      setHierarchyRoles(rolesResult.data || []);
      setInstruments(instrumentsResult.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load participant');
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

  if (error || !participant) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Participant not found'}</Text>
        <ModernButton onPress={() => router.back()}>Natrag</ModernButton>
      </View>
    );
  }

  const description = participant.description_croatian || participant.description;
  const shouldTruncate = description && description.length > 200;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          {participant.image_url && getImageSource(participant.image_url) ? (
            <Image
              source={getImageSource(participant.image_url)!}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={theme.colors.secondary.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroImage}
            >
              <Users size={64} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
            </LinearGradient>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            style={styles.heroGradient}
          />

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <BlurView intensity={20} tint="dark" style={styles.backButtonBlur}>
              <ArrowLeft size={24} color={theme.colors.text.inverse} strokeWidth={2} />
            </BlurView>
          </TouchableOpacity>

          <View style={styles.heroContent}>
            <Animated.Text entering={FadeIn.delay(100)} style={styles.heroTitle}>
              {participant.name_croatian || participant.name}
            </Animated.Text>
          </View>
        </View>

        <View style={styles.content}>
          {description && (
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <ModernCard style={styles.descriptionCard}>
                <Text
                  style={styles.description}
                  numberOfLines={!isDescriptionExpanded && shouldTruncate ? 6 : undefined}
                >
                  {description}
                </Text>
                {shouldTruncate && (
                  <TouchableOpacity
                    style={styles.readMoreButton}
                    onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  >
                    <Text style={styles.readMoreText}>
                      {isDescriptionExpanded ? 'Prikaži manje' : 'Prikaži više'}
                    </Text>
                  </TouchableOpacity>
                )}
              </ModernCard>
            </Animated.View>
          )}

          {participant.song_rhythm && (
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <ModernCard style={styles.infoCard}>
                <View style={styles.infoHeader}>
                  <Music size={24} color={theme.colors.primary.main} strokeWidth={2} />
                  <Text style={styles.infoTitle}>Glazba i ritam</Text>
                </View>
                <Text style={styles.infoText}>{participant.song_rhythm}</Text>
              </ModernCard>
            </Animated.View>
          )}

          {participant.costume_description && (
            <Animated.View entering={FadeInDown.delay(350).springify()}>
              <ModernCard style={styles.infoCard}>
                <View style={styles.infoHeader}>
                  <Shirt size={24} color={theme.colors.primary.main} strokeWidth={2} />
                  <Text style={styles.infoTitle}>
                    {['Novljansko kolo', 'Pivači kola', 'Sopci'].includes(participant.name_croatian || '') ? 'Nošnja' : 'Odora'}
                  </Text>
                </View>
                <Text style={styles.infoText}>{participant.costume_description}</Text>
              </ModernCard>
            </Animated.View>
          )}

          {instruments.length > 0 && (
            <Animated.View entering={FadeInDown.delay(400).springify()}>
              <TouchableOpacity
                onPress={() => setIsInstrumentsExpanded(!isInstrumentsExpanded)}
                activeOpacity={0.7}
              >
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderLeft}>
                    <Music size={24} color={theme.colors.primary.main} strokeWidth={2} />
                    <Text style={styles.sectionTitle}>Instrumenti ({instruments.length})</Text>
                  </View>
                  {isInstrumentsExpanded ? (
                    <ChevronUp size={20} color={theme.colors.text.tertiary} strokeWidth={2} />
                  ) : (
                    <ChevronDown size={20} color={theme.colors.text.tertiary} strokeWidth={2} />
                  )}
                </View>
              </TouchableOpacity>
              {isInstrumentsExpanded && instruments.map((instrument, index) => (
                <Animated.View
                  key={instrument.id}
                  entering={FadeInDown.delay(50 + index * 30).springify()}
                  style={styles.cardWrapper}
                >
                  <ModernCard onPress={() => router.push(`/instrument/${instrument.id}`)}>
                    <View style={styles.listCard}>
                      <View style={styles.listCardContent}>
                        <Text style={styles.listCardTitle}>
                          {instrument.name_croatian || instrument.name}
                        </Text>
                        {instrument.description_croatian && (
                          <Text style={styles.listCardDescription} numberOfLines={2}>
                            {instrument.description_croatian}
                          </Text>
                        )}
                      </View>
                      <ChevronRight size={20} color={theme.colors.text.tertiary} strokeWidth={2} />
                    </View>
                  </ModernCard>
                </Animated.View>
              ))}
            </Animated.View>
          )}

          {hierarchyRoles.length > 0 && (
            <Animated.View entering={FadeInDown.delay(500).springify()}>
              <TouchableOpacity
                onPress={() => setIsRolesExpanded(!isRolesExpanded)}
                activeOpacity={0.7}
              >
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderLeft}>
                    <Crown size={24} color={theme.colors.primary.main} strokeWidth={2} />
                    <Text style={styles.sectionTitle}>Uloge u hijerarhiji ({hierarchyRoles.length})</Text>
                  </View>
                  {isRolesExpanded ? (
                    <ChevronUp size={20} color={theme.colors.text.tertiary} strokeWidth={2} />
                  ) : (
                    <ChevronDown size={20} color={theme.colors.text.tertiary} strokeWidth={2} />
                  )}
                </View>
              </TouchableOpacity>
              {isRolesExpanded && hierarchyRoles.map((role, index) => (
                  <Animated.View
                    key={role.id}
                    entering={FadeInDown.delay(50 + index * 30).springify()}
                    style={styles.cardWrapper}
                  >
                    <ModernCard
                      onPress={() => router.push(`/role/${role.id}`)}
                    >
                      <View style={styles.roleCard}>
                        <View style={styles.roleIconContainer}>
                          {getHierarchyIcon(role.display_order)}
                        </View>
                        <View style={styles.roleCardContent}>
                          <Text style={styles.roleTitle}>
                            {role.title_croatian || role.title}
                          </Text>
                          {role.short_description_croatian && (
                            <Text style={styles.roleDescription}>
                              {role.short_description_croatian}
                            </Text>
                          )}
                        </View>
                        <ChevronRight size={20} color={theme.colors.text.tertiary} strokeWidth={2} />
                      </View>
                    </ModernCard>
                  </Animated.View>
              ))}
            </Animated.View>
          )}

          {participant.id === '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d' && (
            <Animated.View entering={FadeInDown.delay(550).springify()}>
              <TouchableOpacity
                onPress={() => setIsFormationExpanded(!isFormationExpanded)}
                activeOpacity={0.7}
              >
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderLeft}>
                    <Users size={24} color={theme.colors.primary.main} strokeWidth={2} />
                    <Text style={styles.sectionTitle}>Formacija</Text>
                  </View>
                  {isFormationExpanded ? (
                    <ChevronUp size={20} color={theme.colors.text.tertiary} strokeWidth={2} />
                  ) : (
                    <ChevronDown size={20} color={theme.colors.text.tertiary} strokeWidth={2} />
                  )}
                </View>
              </TouchableOpacity>
              {isFormationExpanded && (
                <Animated.View entering={FadeInDown.delay(100).springify()}>
                  <ModernCard onPress={() => router.push('/formacija')}>
                    <View style={styles.formationScheme}>
                      <Text style={styles.formationHeader}>Formacija u dva reda</Text>

                      <Text style={styles.formationExplanation}>
                        Mesopustari stoje i kreću se u dva reda sa sinkroniziranim korakom kojeg predvode kapitani. Advitor dirigira zogu iz sredine.
                      </Text>

                      <View style={styles.formationContainer}>
                        <View style={styles.formationColumn}>
                          <Text style={styles.formationColumnTitle}>Lijevi Red</Text>
                          <TouchableOpacity
                            style={styles.formationMember}
                            onPress={() => handleFormationRolePress('Drugi kapitan')}
                            activeOpacity={0.7}
                          >
                            <Award size={14} color={theme.colors.primary.main} strokeWidth={2} />
                            <Text style={styles.formationMemberText}>Drugi kapitan</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.formationMember}
                            onPress={() => handleFormationRolePress('Kasir')}
                            activeOpacity={0.7}
                          >
                            <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                            <Text style={styles.formationMemberText}>Kasir</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.formationMember}
                            onPress={() => handleFormationRolePress('Vela Sopila')}
                            activeOpacity={0.7}
                          >
                            <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                            <Text style={styles.formationMemberText}>Vela Sopila</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.formationMember}
                            onPress={() => handleFormationRolePress('Vela Trumbeta')}
                            activeOpacity={0.7}
                          >
                            <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                            <Text style={styles.formationMemberText}>Vela Trumbeta</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.formationMember}
                            onPress={() => handleFormationRolePress('Veli Bubanj')}
                            activeOpacity={0.7}
                          >
                            <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                            <Text style={styles.formationMemberText}>Veli Bubanj</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.formationMember}
                            onPress={() => handleFormationRolePress('Srednji Bubanj')}
                            activeOpacity={0.7}
                          >
                            <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                            <Text style={styles.formationMemberText}>Srednji Bubanj</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.formationMember}
                            onPress={() => handleFormationRolePress('Zvončići')}
                            activeOpacity={0.7}
                          >
                            <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                            <Text style={styles.formationMemberText}>Zvončići</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.formationMember}
                            onPress={() => handleFormationRolePress('Triangul')}
                            activeOpacity={0.7}
                          >
                            <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                            <Text style={styles.formationMemberText}>Triangul</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.formationMember}
                            onPress={() => handleFormationRolePress('Kosa')}
                            activeOpacity={0.7}
                          >
                            <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                            <Text style={styles.formationMemberText}>Kosa</Text>
                          </TouchableOpacity>
                        </View>

                        <View style={styles.formationColumn}>
                          <Text style={styles.formationColumnTitle}>Sredina</Text>
                          <TouchableOpacity
                            style={[styles.formationMember, styles.highlightedMember]}
                            onPress={() => handleFormationRolePress('Advitor')}
                            activeOpacity={0.7}
                          >
                            <Crown size={14} color={theme.colors.accent.main} strokeWidth={2} />
                            <Text style={[styles.formationMemberText, styles.highlightedText]}>Advitor</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.formationMember, styles.highlightedMember]}
                            onPress={() => handleFormationRolePress('Bandiraš')}
                            activeOpacity={0.7}
                          >
                            <Flag size={14} color={theme.colors.accent.main} strokeWidth={2} />
                            <Text style={[styles.formationMemberText, styles.highlightedText]}>Bandiraš</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.formationMember}
                            onPress={() => handleFormationRolePress('Magaziner')}
                            activeOpacity={0.7}
                          >
                            <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                            <Text style={styles.formationMemberText}>Magaziner</Text>
                          </TouchableOpacity>
                        </View>

                        <View style={styles.formationColumn}>
                          <Text style={styles.formationColumnTitle}>Desni Red</Text>
                          <TouchableOpacity
                            style={styles.formationMember}
                            onPress={() => handleFormationRolePress('Prvi kapitan')}
                            activeOpacity={0.7}
                          >
                            <Award size={14} color={theme.colors.primary.main} strokeWidth={2} />
                            <Text style={styles.formationMemberText}>Prvi kapitan</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.formationMember}
                            onPress={() => handleFormationRolePress('Kasir')}
                            activeOpacity={0.7}
                          >
                            <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                            <Text style={styles.formationMemberText}>Kasir</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.formationMember}
                            onPress={() => handleFormationRolePress('Mala Sopila')}
                            activeOpacity={0.7}
                          >
                            <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                            <Text style={styles.formationMemberText}>Mala Sopila</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.formationMember}
                            onPress={() => handleFormationRolePress('Odgovaralica')}
                            activeOpacity={0.7}
                          >
                            <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                            <Text style={styles.formationMemberText}>Odgovaralica</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.formationMember}
                            onPress={() => handleFormationRolePress('Manja Trumbeta')}
                            activeOpacity={0.7}
                          >
                            <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                            <Text style={styles.formationMemberText}>Manja Trumbeta</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.formationMember}
                            onPress={() => handleFormationRolePress('Činele')}
                            activeOpacity={0.7}
                          >
                            <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                            <Text style={styles.formationMemberText}>Činele</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.formationMember}
                            onPress={() => handleFormationRolePress('Mali Bubanj')}
                            activeOpacity={0.7}
                          >
                            <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                            <Text style={styles.formationMemberText}>Mali Bubanj</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.formationMember}
                            onPress={() => handleFormationRolePress('Aran')}
                            activeOpacity={0.7}
                          >
                            <User size={14} color={theme.colors.text.secondary} strokeWidth={2} />
                            <Text style={styles.formationMemberText}>Aran</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <Text style={styles.formationFootnote}>
                        * Bandiraš stoji između Advitora i Magazinera od mesopusne srede do žitne srede
                      </Text>

                      <Text style={styles.formationTip}>
                        Dodirnite za više informacija
                      </Text>
                    </View>
                  </ModernCard>
                </Animated.View>
              )}
            </Animated.View>
          )}

          {events.length > 0 && (
            <Animated.View entering={FadeInDown.delay(600).springify()}>
              <View style={styles.sectionHeader}>
                <Calendar size={24} color={theme.colors.primary.main} strokeWidth={2} />
                <Text style={styles.sectionTitle}>Događaji ({events.length})</Text>
              </View>
              {events.map((event, index) => (
                <Animated.View
                  key={event.id}
                  entering={FadeInDown.delay(600 + index * 50).springify()}
                  style={styles.cardWrapper}
                >
                  <ModernCard onPress={() => router.push(`/event/${event.id}`)}>
                    <View style={styles.eventCard}>
                      {event.image_url && getImageSource(event.image_url) && (
                        <Image
                          source={getImageSource(event.image_url)!}
                          style={styles.eventImage}
                          resizeMode="cover"
                        />
                      )}
                      <View style={styles.eventInfo}>
                        <Text style={styles.eventTitle}>
                          {event.title_local || event.title}
                        </Text>
                        {event.role_description && (
                          <Text style={styles.eventRole}>{event.role_description}</Text>
                        )}
                      </View>
                      <ChevronRight size={20} color={theme.colors.text.tertiary} strokeWidth={2} />
                    </View>
                  </ModernCard>
                </Animated.View>
              ))}
            </Animated.View>
          )}

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
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
    padding: theme.spacing.lg,
  },
  errorText: {
    ...theme.typography.body1,
    color: theme.colors.error.main,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  heroContainer: {
    position: 'relative',
    height: 400,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  backButtonBlur: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: theme.spacing.lg,
  },
  heroTitle: {
    ...theme.typography.display,
    fontSize: 32,
    color: theme.colors.text.inverse,
    fontFamily: fonts.title,
  },
  content: {
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  descriptionCard: {
    padding: theme.spacing.lg,
  },
  description: {
    ...theme.typography.body1,
    color: theme.colors.text.secondary,
    lineHeight: 26,
  },
  readMoreButton: {
    marginTop: theme.spacing.md,
  },
  readMoreText: {
    ...theme.typography.body2,
    color: theme.colors.primary.main,
    fontWeight: '600',
  },
  infoCard: {
    padding: theme.spacing.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  infoTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    fontWeight: '700',
  },
  infoText: {
    ...theme.typography.body1,
    color: theme.colors.text.secondary,
    lineHeight: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    fontWeight: '700',
  },
  cardWrapper: {
    marginBottom: theme.spacing.md,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  listCardContent: {
    flex: 1,
  },
  listCardTitle: {
    ...theme.typography.body1,
    color: theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  listCardDescription: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  roleIconContainer: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  roleCardContent: {
    flex: 1,
  },
  roleTitle: {
    ...theme.typography.body1,
    color: theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  roleDescription: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
  roleReadMoreButton: {
    marginTop: theme.spacing.sm,
  },
  roleReadMoreText: {
    ...theme.typography.body2,
    color: theme.colors.primary.main,
    fontWeight: '600',
    fontSize: 13,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    ...theme.typography.body1,
    color: theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventRole: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
  },
  formationScheme: {
    gap: 12,
  },
  formationHeader: {
    fontSize: 18,
    fontFamily: fonts.heading,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  formationExplanation: {
    fontSize: 14,
    fontFamily: fonts.body,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  formationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  formationColumn: {
    flex: 1,
    gap: 6,
  },
  formationColumnTitle: {
    fontSize: 11,
    fontFamily: fonts.heading,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formationMember: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.background.secondary,
    padding: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
  },
  highlightedMember: {
    backgroundColor: theme.colors.accent.main + '15',
    borderColor: theme.colors.accent.main + '40',
  },
  formationMemberText: {
    fontSize: 10,
    fontFamily: fonts.body,
    color: theme.colors.text.primary,
    flex: 1,
  },
  highlightedText: {
    fontFamily: fonts.heading,
    color: theme.colors.accent.main,
  },
  formationFootnote: {
    fontSize: 10,
    fontFamily: fonts.body,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: 6,
  },
  formationTip: {
    fontSize: 11,
    fontFamily: fonts.body,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    marginTop: 6,
  },
  bottomSpacer: {
    height: 100,
  },
});
