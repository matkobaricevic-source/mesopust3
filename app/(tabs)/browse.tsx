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
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Participant } from '@/types/database';
import { Users, Music, Shirt, Crown, Award, Flag, ChevronDown, ChevronUp } from 'lucide-react-native';
import { getImageSource } from '@/lib/imageUtils';
import { fonts } from '@/constants/fonts';
import { theme } from '@/constants/theme';
import { ModernCard } from '@/components/ModernCard';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

interface HierarchyRole {
  id: string;
  participant_id: string;
  title: string;
  title_croatian: string;
  description: string;
  description_croatian: string;
  display_order: number;
}

export default function ParticipantsScreen() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [hierarchyRoles, setHierarchyRoles] = useState<HierarchyRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHierarchyExpanded, setIsHierarchyExpanded] = useState(false);
  const [isFormationExpanded, setIsFormationExpanded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      // Load participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select('*, instruments(*)')
        .eq('show_in_main_menu', true)
        .order('display_order', { ascending: true });

      if (participantsError) throw participantsError;

      // Load hierarchy roles for Mesopustari
      const { data: hierarchyData, error: hierarchyError } = await supabase
        .from('hierarchy_roles')
        .select('*')
        .order('display_order', { ascending: true });

      if (hierarchyError) throw hierarchyError;

      setParticipants(participantsData || []);
      setHierarchyRoles(hierarchyData || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load participants'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleParticipantPress(participant: Participant) {
    router.push(`/participant/${participant.id}`);
  }

  function getHierarchyIcon(displayOrder: number) {
    if (displayOrder === 1) return <Crown size={20} color={theme.colors.accent.main} strokeWidth={2} />;
    if (displayOrder <= 3) return <Award size={20} color={theme.colors.primary.main} strokeWidth={2} />;
    if (displayOrder >= 50) return <Flag size={20} color={theme.colors.secondary.main} strokeWidth={2} />;
    return <Users size={20} color={theme.colors.neutral[400]} strokeWidth={2} />;
  }

  function findParticipantByName(searchName: string) {
    return participants.find((p) =>
      p.name_croatian?.toLowerCase().includes(searchName.toLowerCase())
    );
  }

  function handleFormationRolePress(roleName: string) {
    const lowerRoleName = roleName.toLowerCase();

    if (lowerRoleName.includes('advitor')) {
      const advitor = participants.find(p => p.name_croatian?.toLowerCase() === 'advitor');
      if (advitor) {
        router.push(`/participant/${advitor.id}`);
        return;
      }
    }

    if (lowerRoleName.includes('kapetan') || lowerRoleName.includes('kasir') ||
        lowerRoleName.includes('bandiraš') || lowerRoleName.includes('magaziner')) {
      const mesopustari = participants.find(p => p.name_croatian?.toLowerCase() === 'mesopustari');
      if (mesopustari) {
        router.push(`/participant/${mesopustari.id}`);
        return;
      }
    }

    const mesopustari = participants.find(p => p.name_croatian?.toLowerCase() === 'mesopustari');
    if (mesopustari && mesopustari.instruments && mesopustari.instruments.length > 0) {
      const instrumentName = roleName
        .replace('vela', '')
        .replace('veli', '')
        .replace('mala', '')
        .replace('mali', '')
        .replace('manja', '')
        .replace('srednji', '')
        .trim()
        .toLowerCase();

      const instrument = mesopustari.instruments.find((i: any) =>
        i.name_croatian?.toLowerCase().includes(instrumentName) ||
        instrumentName.includes(i.name_croatian?.toLowerCase())
      );

      if (instrument) {
        router.push(`/instrument/${instrument.id}`);
        return;
      }
    }

    if (mesopustari) {
      router.push(`/participant/${mesopustari.id}`);
    }
  }

  function handleHierarchyRolePress(role: HierarchyRole) {
    router.push(`/participant/${role.participant_id}`);
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Učitavanje...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadData}>
          <Text style={styles.retryButtonText}>Pokušaj ponovno</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Find Mesopustari participant to show hierarchy
  const mesopustari = participants.find(p => p.name === 'Mesopustari');
  const mesopustariRoles = hierarchyRoles.filter(r => r.participant_id === mesopustari?.id);
  const otherParticipants = participants.filter(p => p.name !== 'Mesopustari');

  return (
    <View style={styles.container}>
      {participants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Users size={64} color={theme.colors.neutral[300]} strokeWidth={1.5} />
          <Text style={styles.emptyText}>Nema dostupnih sudionika</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn} style={styles.header}>
            <LinearGradient
              colors={theme.colors.secondary.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <Text style={styles.headerTitle}>Sudionici{'\n'}Mesopusta</Text>
              <Text style={styles.headerSubtitle}>Otkrijte sve uloge i ljude</Text>
            </LinearGradient>
          </Animated.View>

          {/* Mesopustari with Hierarchy Section */}
          {mesopustari && (
            <Animated.View
              entering={FadeInDown.delay(100).springify()}
              style={styles.participantCardWrapper}
            >
              <ModernCard onPress={() => handleParticipantPress(mesopustari)}>
                <View style={styles.imageContainer}>
                  {mesopustari.image_url && getImageSource(mesopustari.image_url) ? (
                    <Image
                      source={getImageSource(mesopustari.image_url)!}
                      style={styles.participantImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <LinearGradient
                      colors={theme.colors.secondary.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.participantImagePlaceholder}
                    >
                      <Users size={48} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
                    </LinearGradient>
                  )}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.imageGradient}
                  />
                  <View style={styles.overlayContent}>
                    <Text style={styles.participantNameOverlay}>
                      {mesopustari.name_croatian || mesopustari.name}
                    </Text>
                  </View>
                </View>
                <View style={styles.participantContent}>
                  <Text style={styles.participantDescription} numberOfLines={3}>
                    {mesopustari.description_croatian || mesopustari.description}
                  </Text>

                  {/* Hierarchy Dropdown */}
                  {mesopustariRoles.filter(r => r.display_order <= 4).length > 0 && (
                    <View style={styles.dropdownContainer}>
                      <TouchableOpacity
                        style={styles.dropdownHeader}
                        onPress={() => setIsHierarchyExpanded(!isHierarchyExpanded)}
                        activeOpacity={0.7}
                      >
                        <Crown size={20} color={theme.colors.accent.main} strokeWidth={2} />
                        <Text style={styles.dropdownTitle}>Hijerarhija</Text>
                        {isHierarchyExpanded ? (
                          <ChevronUp size={20} color={theme.colors.text.secondary} strokeWidth={2} />
                        ) : (
                          <ChevronDown size={20} color={theme.colors.text.secondary} strokeWidth={2} />
                        )}
                      </TouchableOpacity>
                      {isHierarchyExpanded && (
                        <View style={styles.dropdownContent}>
                          {mesopustariRoles
                            .filter(r => r.display_order <= 4)
                            .map((role, index) => (
                              <TouchableOpacity
                                key={role.id}
                                style={styles.hierarchyRole}
                                onPress={() => handleHierarchyRolePress(role)}
                                activeOpacity={0.7}
                              >
                                <View style={styles.roleIconContainer}>
                                  {getHierarchyIcon(role.display_order)}
                                </View>
                                <View style={styles.roleInfo}>
                                  <Text style={styles.hierarchyRoleName}>{role.title_croatian}</Text>
                                  {role.description_croatian && (
                                    <Text style={styles.hierarchyRoleDesc}>
                                      {role.description_croatian}
                                    </Text>
                                  )}
                                </View>
                              </TouchableOpacity>
                            ))}
                          <Text style={styles.formationTip}>
                            💡 Dodirnite bilo koju ulogu za više detalja
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Formation Dropdown */}
                  <View style={styles.dropdownContainer}>
                    <TouchableOpacity
                      style={styles.dropdownHeader}
                      onPress={() => setIsFormationExpanded(!isFormationExpanded)}
                      activeOpacity={0.7}
                    >
                      <Users size={20} color={theme.colors.primary.main} strokeWidth={2} />
                      <Text style={styles.dropdownTitle}>Formacija</Text>
                      {isFormationExpanded ? (
                        <ChevronUp size={20} color={theme.colors.text.secondary} strokeWidth={2} />
                      ) : (
                        <ChevronDown size={20} color={theme.colors.text.secondary} strokeWidth={2} />
                      )}
                    </TouchableOpacity>
                    {isFormationExpanded && (
                      <View style={styles.dropdownContent}>
                        <View style={styles.formationScheme}>
                          <Text style={styles.formationHeader}>Formacija u Dva Reda</Text>

                          <Text style={styles.formationExplanation}>
                            Mesopustari stoje i kreću se u dva reda sa sinkroniziranim korakom. Advitor dirigira zoge iz sredine, dok bandiraš nosi zastavu i puše u žviždaljku.
                          </Text>

                          {/* Three columns: Left row, Center, Right row */}
                          <View style={styles.formationContainer}>
                            {/* Left Row */}
                            <View style={styles.formationColumn}>
                              <Text style={styles.formationColumnTitle}>Lijevi Red</Text>
                              <TouchableOpacity
                                style={styles.formationMember}
                                onPress={() => handleFormationRolePress('Kapetan')}
                                activeOpacity={0.7}
                              >
                                <Award size={14} color={theme.colors.primary.main} strokeWidth={2} />
                                <Text style={styles.formationMemberText}>Prvi Kapetan</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.formationMember}
                                onPress={() => handleFormationRolePress('Kasir')}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.formationMemberText}>Kasir</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.formationMember}
                                onPress={() => handleFormationRolePress('Sopila')}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.formationMemberText}>Vela Sopila</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.formationMember}
                                onPress={() => handleFormationRolePress('Trumbeta')}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.formationMemberText}>Vela Trumbeta</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.formationMember}
                                onPress={() => handleFormationRolePress('Bubanj')}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.formationMemberText}>Veli Bubanj</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.formationMember}
                                onPress={() => handleFormationRolePress('Bubanj')}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.formationMemberText}>Srednji Bubanj</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.formationMember}
                                onPress={() => handleFormationRolePress('Zvončić')}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.formationMemberText}>Zvončići</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.formationMember}
                                onPress={() => handleFormationRolePress('Triangul')}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.formationMemberText}>Triangul</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.formationMember}
                                onPress={() => handleFormationRolePress('Kosa')}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.formationMemberText}>Kosa</Text>
                              </TouchableOpacity>
                            </View>

                            {/* Center */}
                            <View style={styles.formationColumn}>
                              <Text style={styles.formationColumnTitle}>Sredina</Text>
                              <View style={styles.formationSpacer} />
                              <View style={styles.formationSpacer} />
                              <TouchableOpacity
                                style={[styles.formationMember, styles.formationLeader]}
                                onPress={() => handleFormationRolePress('Advitor')}
                                activeOpacity={0.7}
                              >
                                <Crown size={16} color={theme.colors.accent.main} strokeWidth={2} />
                                <Text style={styles.formationLeaderText}>Advitor</Text>
                              </TouchableOpacity>
                              <View style={styles.formationSpacer} />
                              <View style={styles.formationSpacer} />
                              <TouchableOpacity
                                style={styles.formationMember}
                                onPress={() => handleFormationRolePress('Bandiraš')}
                                activeOpacity={0.7}
                              >
                                <Flag size={14} color={theme.colors.secondary.main} strokeWidth={2} />
                                <Text style={styles.formationMemberText}>Bandiraš</Text>
                              </TouchableOpacity>
                              <View style={styles.formationSpacer} />
                              <View style={styles.formationSpacer} />
                              <TouchableOpacity
                                style={styles.formationMember}
                                onPress={() => handleFormationRolePress('Magaziner')}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.formationMemberText}>Magaziner</Text>
                              </TouchableOpacity>
                            </View>

                            {/* Right Row */}
                            <View style={styles.formationColumn}>
                              <Text style={styles.formationColumnTitle}>Desni Red</Text>
                              <TouchableOpacity
                                style={styles.formationMember}
                                onPress={() => handleFormationRolePress('Kapetan')}
                                activeOpacity={0.7}
                              >
                                <Award size={14} color={theme.colors.primary.main} strokeWidth={2} />
                                <Text style={styles.formationMemberText}>Drugi Kapetan</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.formationMember}
                                onPress={() => handleFormationRolePress('Kasir')}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.formationMemberText}>Kasir</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.formationMember}
                                onPress={() => handleFormationRolePress('Sopila')}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.formationMemberText}>Mala Sopila</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.formationMember}
                                onPress={() => handleFormationRolePress('Trumbeta')}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.formationMemberText}>Manja Trumbeta</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.formationMember}
                                onPress={() => handleFormationRolePress('Odgovaralica')}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.formationMemberText}>Odgovaralica</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.formationMember}
                                onPress={() => handleFormationRolePress('Činele')}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.formationMemberText}>Činele</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.formationMember}
                                onPress={() => handleFormationRolePress('Bubanj')}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.formationMemberText}>Mali Bubanj</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.formationMember}
                                onPress={() => handleFormationRolePress('Avan')}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.formationMemberText}>Avan</Text>
                              </TouchableOpacity>
                            </View>
                          </View>

                          <Text style={styles.formationNote}>
                            * Bandiraš stoji između Advitora i Magazinera od mesopusne nedilje do čiste srede
                          </Text>
                          <Text style={styles.formationTip}>
                            💡 Dodirnite bilo koju ulogu za više informacija
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </ModernCard>
            </Animated.View>
          )}

          {/* Other Participants */}
          {otherParticipants.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(300 + index * 80).springify()}
              style={styles.participantCardWrapper}
            >
              <ModernCard onPress={() => handleParticipantPress(item)}>
                <View style={styles.imageContainer}>
                  {item.image_url && getImageSource(item.image_url) ? (
                    <Image
                      source={getImageSource(item.image_url)!}
                      style={styles.participantImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <LinearGradient
                      colors={theme.colors.secondary.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.participantImagePlaceholder}
                    >
                      <Users size={48} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
                    </LinearGradient>
                  )}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.imageGradient}
                  />
                  <View style={styles.overlayContent}>
                    <Text style={styles.participantNameOverlay}>
                      {item.name_croatian || item.name}
                    </Text>
                  </View>
                </View>
                <View style={styles.participantContent}>
                  <Text style={styles.participantDescription} numberOfLines={3}>
                    {item.description_croatian || item.description}
                  </Text>
                  <View style={styles.badgesContainer}>
                    {item.song_rhythm && (
                      <View style={styles.badge}>
                        <Music size={14} color={theme.colors.primary.main} strokeWidth={2} />
                        <Text style={styles.badgeText}>Glazba</Text>
                      </View>
                    )}
                    {item.costume_description && (
                      <View style={styles.badge}>
                        <Shirt size={14} color={theme.colors.primary.main} strokeWidth={2} />
                        <Text style={styles.badgeText}>Nošnja</Text>
                      </View>
                    )}
                  </View>
                </View>
              </ModernCard>
            </Animated.View>
          ))}
        </ScrollView>
      )}
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
  header: {
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
    borderRadius: theme.borderRadius.xl,
    marginHorizontal: theme.spacing.md,
  },
  headerGradient: {
    padding: theme.spacing.xl,
    paddingTop: 80,
    paddingBottom: theme.spacing.xl,
  },
  headerTitle: {
    ...theme.typography.display,
    fontSize: 36,
    color: theme.colors.text.inverse,
    fontFamily: fonts.title,
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    ...theme.typography.body1,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: fonts.regular,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    ...theme.typography.body1,
    color: theme.colors.text.secondary,
  },
  errorText: {
    ...theme.typography.body1,
    color: theme.colors.error.main,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: theme.colors.text.inverse,
    ...theme.typography.button,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  emptyText: {
    ...theme.typography.h4,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  listContent: {
    paddingTop: theme.spacing.lg,
    paddingBottom: 120,
  },
  participantCardWrapper: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  participantImage: {
    width: '100%',
    height: '100%',
  },
  participantImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  overlayContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: theme.spacing.lg,
  },
  participantNameOverlay: {
    ...theme.typography.h3,
    color: theme.colors.text.inverse,
    fontFamily: fonts.title,
  },
  participantContent: {
    padding: theme.spacing.lg,
  },
  participantDescription: {
    ...theme.typography.body1,
    color: theme.colors.text.secondary,
    lineHeight: 24,
    marginBottom: theme.spacing.md,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary.main + '15',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary.light + '30',
    gap: theme.spacing.xs,
  },
  badgeText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.primary.main,
  },
  dropdownContainer: {
    marginTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    paddingTop: theme.spacing.md,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  dropdownTitle: {
    ...theme.typography.body1,
    fontFamily: fonts.title,
    color: theme.colors.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  dropdownContent: {
    marginTop: theme.spacing.sm,
    paddingLeft: theme.spacing.sm,
  },
  hierarchyRole: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  roleIconContainer: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleInfo: {
    flex: 1,
  },
  hierarchyRoleName: {
    ...theme.typography.body1,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  hierarchyRoleDesc: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  formationScheme: {
    paddingVertical: theme.spacing.md,
  },
  formationHeader: {
    ...theme.typography.body1,
    fontFamily: fonts.title,
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  formationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.xs,
  },
  formationColumn: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  formationColumnTitle: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formationMember: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.neutral[100],
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
    minHeight: 28,
  },
  formationSpacer: {
    minHeight: 28,
  },
  formationLeader: {
    backgroundColor: theme.colors.accent.main + '15',
    borderWidth: 1,
    borderColor: theme.colors.accent.main + '40',
  },
  formationMemberText: {
    ...theme.typography.caption,
    fontSize: 10,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  formationLeaderText: {
    ...theme.typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  formationNote: {
    ...theme.typography.caption,
    fontSize: 9,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: theme.spacing.md,
    textAlign: 'center',
    lineHeight: 12,
  },
  formationExplanation: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  formationTip: {
    ...theme.typography.caption,
    fontSize: 10,
    color: theme.colors.accent.main,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    fontWeight: '500',
  },
});
