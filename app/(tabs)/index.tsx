import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Event, Category } from '@/types/database';
import { Calendar, ChevronDown } from 'lucide-react-native';
import { getImageSource } from '@/lib/imageUtils';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, interpolate, FadeIn, FadeInDown } from 'react-native-reanimated';
import { fonts } from '@/constants/fonts';
import { theme } from '@/constants/theme';
import { ModernCard } from '@/components/ModernCard';
import { BlurView } from 'expo-blur';

const { width: screenWidth } = Dimensions.get('window');
const CARD_PADDING = theme.spacing.md;

interface EventWithCategories extends Event {
  categories?: Category[];
  sub_events?: Event[];
}

function AnimatedEventCard({
  item,
  isExpanded,
  onToggle,
  onEventPress,
  onCategoryPress,
  onSubEventPress,
  index
}: {
  item: EventWithCategories;
  isExpanded: boolean;
  onToggle: () => void;
  onEventPress: () => void;
  onCategoryPress: (id: string) => void;
  onSubEventPress: (id: string) => void;
  index: number;
}) {
  const animation = useSharedValue(isExpanded ? 1 : 0);

  useEffect(() => {
    animation.value = withTiming(isExpanded ? 1 : 0, { duration: 300 });
  }, [isExpanded]);

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(animation.value, [0, 1], [0, 180])}deg` }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    maxHeight: interpolate(animation.value, [0, 1], [0, 1000]),
    opacity: interpolate(animation.value, [0, 0.5, 1], [0, 1, 1]),
    overflow: 'hidden',
  }));

  const isZeca = item.title === 'Zeča';
  const hasCategories = item.categories && item.categories.length > 0;
  const hasSubEvents = item.sub_events && item.sub_events.length > 0;
  const hasExpandableContent = hasCategories || hasSubEvents;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.eventCardWrapper}
    >
      <ModernCard onPress={onEventPress}>
        <View style={styles.imageContainer}>
          {item.image_url && getImageSource(item.image_url) ? (
            <Image
              source={getImageSource(item.image_url)!}
              style={styles.eventImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={theme.colors.primary.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.eventImagePlaceholder}
            >
              <Calendar size={48} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
            </LinearGradient>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageGradient}
          />
          <View style={styles.overlayContent}>
            {item.day_name && (
              <View style={styles.dayBadge}>
                <BlurView intensity={20} tint="dark" style={styles.dayBadgeBlur}>
                  <Text style={styles.dayBadgeText}>{item.day_name}</Text>
                </BlurView>
              </View>
            )}
            <Text style={styles.eventTitle}>
              {item.title_local || item.title}
            </Text>
          </View>
        </View>

        <View style={styles.eventContent}>
          <Text style={styles.eventDescription} numberOfLines={3}>
            {item.description_croatian || item.description}
          </Text>
        </View>

        {hasExpandableContent && (
          <>
            <TouchableOpacity
              style={styles.expandButton}
              onPress={onToggle}
              activeOpacity={0.7}>
              <Text style={styles.expandButtonText}>
                {isExpanded ? 'Sakrij detalje' : hasCategories ? 'Prikaži dane' : 'Prikaži događaje'}
              </Text>
              <Animated.View style={chevronAnimatedStyle}>
                <ChevronDown size={18} color={theme.colors.text.secondary} strokeWidth={2} />
              </Animated.View>
            </TouchableOpacity>

            <Animated.View style={contentAnimatedStyle}>
              <View style={styles.categoriesSection}>
                {hasSubEvents && item.sub_events!
                  .filter(subEvent => subEvent.title !== 'Zeča')
                  .map((subEvent) => (
                    <TouchableOpacity
                      key={subEvent.id}
                      style={styles.categoryItem}
                      onPress={() => onSubEventPress(subEvent.id)}
                      activeOpacity={0.7}>
                      <View style={styles.categoryDot} />
                      <Text style={styles.categoryItemTitle}>
                        {subEvent.title_local || subEvent.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                {hasCategories && item.categories!.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryItem}
                    onPress={() => onCategoryPress(category.id)}
                    activeOpacity={0.7}>
                    <View style={styles.categoryDot} />
                    <Text style={styles.categoryItemTitle}>
                      {category.title_local || category.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </>
        )}
      </ModernCard>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const [events, setEvents] = useState<EventWithCategories[]>([]);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);
      setError(null);

      const { data: eventsData, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('show_in_main_menu', true)
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      const eventsWithCategories = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { data: categoriesData } = await supabase
            .from('categories')
            .select('*')
            .eq('event_id', event.id)
            .eq('show_in_main_menu', true)
            .order('display_order', { ascending: true });

          const { data: subEventsData } = await supabase
            .from('events')
            .select('*')
            .eq('parent_event_id', event.id)
            .order('display_order', { ascending: true });

          return {
            ...event,
            categories: categoriesData || [],
            sub_events: subEventsData || [],
          };
        })
      );

      const napovidanjeIndex = eventsWithCategories.findIndex(e =>
        e.title === 'Napovidanje dovčen i dovičan' || e.title === 'Napovidanje dovcen i dovican'
      );
      const zecaIndex = eventsWithCategories.findIndex(e => e.title === 'Zeča');

      let sortedEvents = [...eventsWithCategories];

      if (napovidanjeIndex !== -1 && zecaIndex !== -1) {
        const [zeca] = sortedEvents.splice(zecaIndex, 1);
        const newNapovidanjeIndex = sortedEvents.findIndex(e =>
          e.title === 'Napovidanje dovčen i dovičan' || e.title === 'Napovidanje dovcen i dovican'
        );
        sortedEvents.splice(newNapovidanjeIndex + 1, 0, zeca);
      }

      setEvents(sortedEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  function handleEventPress(event: EventWithCategories) {
    router.push(`/event/${event.id}`);
  }

  function handleCategoryPress(categoryId: string) {
    router.push(`/category/${categoryId}`);
  }

  function handleSubEventPress(subEventId: string) {
    router.push(`/event/${subEventId}`);
  }

  function toggleEventExpand(eventId: string) {
    setExpandedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
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
        <TouchableOpacity style={styles.retryButton} onPress={loadEvents}>
          <Text style={styles.retryButtonText}>Pokušaj ponovno</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Calendar size={64} color={theme.colors.neutral[300]} strokeWidth={1.5} />
          <Text style={styles.emptyText}>Nema zakazanih događaja</Text>
          <Text style={styles.emptySubtext}>
            Provjerite kasnije za nove događaje
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Animated.View entering={FadeIn} style={styles.header}>
              <LinearGradient
                colors={theme.colors.primary.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
              >
                <Text style={styles.headerTitle}>Novljanski{'\n'}Mesopust</Text>
                <Text style={styles.headerSubtitle}>Tradicija koja živi</Text>
              </LinearGradient>
            </Animated.View>
          }
          renderItem={({ item, index }) => {
            const isExpanded = expandedEvents.has(item.id);

            return (
              <AnimatedEventCard
                item={item}
                isExpanded={isExpanded}
                onToggle={() => toggleEventExpand(item.id)}
                onEventPress={() => handleEventPress(item)}
                onCategoryPress={handleCategoryPress}
                onSubEventPress={handleSubEventPress}
                index={index}
              />
            );
          }}
        />
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
    marginHorizontal: CARD_PADDING,
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
  emptySubtext: {
    ...theme.typography.body2,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  listContent: {
    paddingTop: theme.spacing.lg,
    paddingBottom: 120,
  },
  eventCardWrapper: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: CARD_PADDING,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventImagePlaceholder: {
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
    height: 120,
  },
  overlayContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: theme.spacing.lg,
  },
  dayBadge: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  dayBadgeBlur: {
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
  eventTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.inverse,
    fontFamily: fonts.title,
  },
  eventContent: {
    padding: theme.spacing.lg,
  },
  eventDescription: {
    ...theme.typography.body1,
    color: theme.colors.text.secondary,
    lineHeight: 24,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
  },
  expandButtonText: {
    ...theme.typography.body2,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  categoriesSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary.main,
  },
  categoryItemTitle: {
    ...theme.typography.body1,
    fontWeight: '600',
    color: theme.colors.text.primary,
    flex: 1,
  },
});
