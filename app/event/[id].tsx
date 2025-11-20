import { useEffect, useState } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, interpolate, FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Event, Participant, Category } from '@/types/database';
import { ArrowLeft, Users, ChevronRight, ChevronDown, Clock, MapPin, Calendar } from 'lucide-react-native';
import { getImageSource } from '@/lib/imageUtils';
import { fonts } from '@/constants/fonts';
import { theme } from '@/constants/theme';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';

const { width: screenWidth } = Dimensions.get('window');

interface EventStep {
  id: string;
  step_number: number;
  title: string;
  image_url: string | null;
  note: string | null;
}

interface ParticipantWithRole extends Participant {
  role_description: string | null;
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<ParticipantWithRole[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subEvents, setSubEvents] = useState<Event[]>([]);
  const [eventSteps, setEventSteps] = useState<EventStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEventSteps, setShowEventSteps] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const eventStepsAnimation = useSharedValue(0);
  const router = useRouter();

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(eventStepsAnimation.value, [0, 1], [0, 180])}deg` }],
  }));

  const timelineAnimatedStyle = useAnimatedStyle(() => ({
    maxHeight: interpolate(eventStepsAnimation.value, [0, 1], [0, 5000]),
    opacity: interpolate(eventStepsAnimation.value, [0, 0.5, 1], [0, 1, 1]),
    overflow: 'hidden',
  }));

  useEffect(() => {
    loadEventDetails();
  }, [id]);

  useEffect(() => {
    eventStepsAnimation.value = withTiming(showEventSteps ? 1 : 0, { duration: 300 });
  }, [showEventSteps]);

  async function loadEventDetails() {
    try {
      setLoading(true);
      setError(null);

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (eventError) throw eventError;
      if (!eventData) throw new Error('Event not found');

      setEvent(eventData);

      const [participantsResult, categoriesResult, subEventsResult, stepsResult] = await Promise.all([
        supabase
          .from('event_participants')
          .select('*, participants(*)')
          .eq('event_id', id)
          .order('display_order', { ascending: true }),
        supabase
          .from('categories')
          .select('*')
          .eq('event_id', id)
          .order('display_order', { ascending: true }),
        supabase
          .from('events')
          .select('*')
          .eq('parent_event_id', id)
          .order('display_order', { ascending: true }),
        supabase
          .from('event_steps')
          .select('*')
          .eq('event_id', id)
          .order('step_number', { ascending: true }),
      ]);

      const participantsWithRoles = (participantsResult.data || []).map((ep: any) => ({
        ...ep.participants,
        role_description: ep.role_description,
      }));

      setParticipants(participantsWithRoles);
      setCategories(categoriesResult.data || []);
      setSubEvents(subEventsResult.data || []);
      setEventSteps(stepsResult.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event');
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

  if (error || !event) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Event not found'}</Text>
        <ModernButton onPress={() => router.back()}>
          Natrag
        </ModernButton>
      </View>
    );
  }

  const description = event.description_croatian_full || event.description_croatian || event.description;
  const shouldTruncate = description.length > 200;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          {event.image_url && getImageSource(event.image_url) ? (
            <Image
              source={getImageSource(event.image_url)!}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={theme.colors.primary.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroImage}
            />
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
            {event.day_name && (
              <View style={styles.dayBadge}>
                <BlurView intensity={20} tint="dark" style={styles.dayBadgeBlur}>
                  <Calendar size={14} color={theme.colors.text.inverse} strokeWidth={2} />
                  <Text style={styles.dayBadgeText}>{event.day_name}</Text>
                </BlurView>
              </View>
            )}
            <Animated.Text entering={FadeIn.delay(100)} style={styles.heroTitle}>
              {event.title_local || event.title}
            </Animated.Text>
          </View>
        </View>

        <View style={styles.content}>
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
                  <ChevronDown
                    size={16}
                    color={theme.colors.primary.main}
                    style={{
                      transform: [{ rotate: isDescriptionExpanded ? '180deg' : '0deg' }],
                    }}
                  />
                </TouchableOpacity>
              )}
            </ModernCard>
          </Animated.View>

          {eventSteps.length > 0 && (
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <ModernCard style={styles.sectionCard}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => setShowEventSteps(!showEventSteps)}
                  activeOpacity={0.7}
                >
                  <View style={styles.sectionHeaderLeft}>
                    <Clock size={24} color={theme.colors.primary.main} strokeWidth={2} />
                    <Text style={styles.sectionTitle}>Tijek događaja ({eventSteps.length})</Text>
                  </View>
                  <Animated.View style={chevronAnimatedStyle}>
                    <ChevronDown size={20} color={theme.colors.text.secondary} strokeWidth={2} />
                  </Animated.View>
                </TouchableOpacity>

                <Animated.View style={timelineAnimatedStyle}>
                  {eventSteps.map((step, index) => (
                    <View key={step.id} style={styles.timelineItem}>
                      <View style={styles.timelineDot} />
                      {index < eventSteps.length - 1 && <View style={styles.timelineLine} />}
                      <View style={styles.timelineContent}>
                        <Text style={styles.stepNumber}>Korak {step.step_number}</Text>
                        <Text style={styles.stepTitle}>{step.title}</Text>
                        {step.note && <Text style={styles.stepNote}>{step.note}</Text>}
                        {step.image_url && getImageSource(step.image_url) && (
                          <Image
                            source={getImageSource(step.image_url)!}
                            style={styles.stepImage}
                            resizeMode="cover"
                          />
                        )}
                      </View>
                    </View>
                  ))}
                </Animated.View>
              </ModernCard>
            </Animated.View>
          )}

          {participants.length > 0 && (
            <Animated.View entering={FadeInDown.delay(400).springify()}>
              <View style={styles.sectionHeaderStatic}>
                <Users size={24} color={theme.colors.primary.main} strokeWidth={2} />
                <Text style={styles.sectionTitle}>Sudionici ({participants.length})</Text>
              </View>
              {participants.map((participant, index) => (
                <Animated.View
                  key={participant.id}
                  entering={FadeInDown.delay(400 + index * 50).springify()}
                  style={styles.participantCardWrapper}
                >
                  <ModernCard onPress={() => router.push(`/participant/${participant.id}`)}>
                    <View style={styles.participantCard}>
                      {participant.image_url && getImageSource(participant.image_url) ? (
                        <Image
                          source={getImageSource(participant.image_url)!}
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
                          <Users size={24} color="rgba(255,255,255,0.8)" strokeWidth={2} />
                        </LinearGradient>
                      )}
                      <View style={styles.participantInfo}>
                        <Text style={styles.participantName}>
                          {participant.name_croatian || participant.name}
                        </Text>
                        {participant.role_description && (
                          <Text style={styles.participantRole}>{participant.role_description}</Text>
                        )}
                      </View>
                      <ChevronRight size={20} color={theme.colors.text.tertiary} strokeWidth={2} />
                    </View>
                  </ModernCard>
                </Animated.View>
              ))}
            </Animated.View>
          )}

          {categories.length > 0 && (
            <Animated.View entering={FadeInDown.delay(500).springify()}>
              <View style={styles.sectionHeaderStatic}>
                <MapPin size={24} color={theme.colors.primary.main} strokeWidth={2} />
                <Text style={styles.sectionTitle}>Dani ({categories.length})</Text>
              </View>
              {categories.map((category, index) => (
                <Animated.View
                  key={category.id}
                  entering={FadeInDown.delay(500 + index * 50).springify()}
                  style={styles.categoryCardWrapper}
                >
                  <ModernCard onPress={() => router.push(`/category/${category.id}`)}>
                    <View style={styles.categoryCard}>
                      <Text style={styles.categoryTitle}>
                        {category.title_local || category.title}
                      </Text>
                      <ChevronRight size={20} color={theme.colors.text.tertiary} strokeWidth={2} />
                    </View>
                  </ModernCard>
                </Animated.View>
              ))}
            </Animated.View>
          )}

          {subEvents.length > 0 && (
            <Animated.View entering={FadeInDown.delay(600).springify()}>
              <View style={styles.sectionHeaderStatic}>
                <Calendar size={24} color={theme.colors.primary.main} strokeWidth={2} />
                <Text style={styles.sectionTitle}>Povezani događaji ({subEvents.length})</Text>
              </View>
              {subEvents.map((subEvent, index) => (
                <Animated.View
                  key={subEvent.id}
                  entering={FadeInDown.delay(600 + index * 50).springify()}
                  style={styles.subEventCardWrapper}
                >
                  <ModernCard onPress={() => router.push(`/event/${subEvent.id}`)}>
                    <View style={styles.subEventCard}>
                      {subEvent.image_url && getImageSource(subEvent.image_url) && (
                        <Image
                          source={getImageSource(subEvent.image_url)!}
                          style={styles.subEventImage}
                          resizeMode="cover"
                        />
                      )}
                      <View style={styles.subEventInfo}>
                        <Text style={styles.subEventTitle}>
                          {subEvent.title_local || subEvent.title}
                        </Text>
                        {subEvent.description_croatian && (
                          <Text style={styles.subEventDescription} numberOfLines={2}>
                            {subEvent.description_croatian}
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
  dayBadge: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  dayBadgeBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  dayBadgeText: {
    ...theme.typography.caption,
    color: theme.colors.text.inverse,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  readMoreText: {
    ...theme.typography.body2,
    color: theme.colors.primary.main,
    fontWeight: '600',
  },
  sectionCard: {
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  sectionHeaderStatic: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    fontWeight: '700',
  },
  timelineItem: {
    flexDirection: 'row',
    marginTop: theme.spacing.lg,
    position: 'relative',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary.main,
    marginTop: 4,
  },
  timelineLine: {
    position: 'absolute',
    left: 5.5,
    top: 16,
    bottom: -theme.spacing.lg,
    width: 1,
    backgroundColor: theme.colors.neutral[300],
  },
  timelineContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  stepNumber: {
    ...theme.typography.caption,
    color: theme.colors.primary.main,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.xs,
  },
  stepTitle: {
    ...theme.typography.body1,
    color: theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  stepNote: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginTop: theme.spacing.xs,
  },
  stepImage: {
    width: '100%',
    height: 180,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  participantCardWrapper: {
    marginBottom: theme.spacing.md,
  },
  participantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  participantImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
  },
  participantImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    ...theme.typography.body1,
    color: theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  participantRole: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
  },
  categoryCardWrapper: {
    marginBottom: theme.spacing.md,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  categoryTitle: {
    ...theme.typography.body1,
    color: theme.colors.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  subEventCardWrapper: {
    marginBottom: theme.spacing.md,
  },
  subEventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  subEventImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
  },
  subEventInfo: {
    flex: 1,
  },
  subEventTitle: {
    ...theme.typography.body1,
    color: theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  subEventDescription: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 100,
  },
});
