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
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react-native';
import { getImageSource } from '@/lib/imageUtils';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, interpolate } from 'react-native-reanimated';
import { fonts } from '@/constants/fonts';

const { width: screenWidth } = Dimensions.get('window');
const getResponsiveImageHeight = () => {
  if (screenWidth < 375) return 140;
  if (screenWidth < 414) return 180;
  return 200;
};
const getResponsivePadding = () => {
  if (screenWidth < 375) return 12;
  return 16;
};

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
  onSubEventPress
}: {
  item: EventWithCategories;
  isExpanded: boolean;
  onToggle: () => void;
  onEventPress: () => void;
  onCategoryPress: (id: string) => void;
  onSubEventPress: (id: string) => void;
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
    <View style={styles.eventCard}>
      <TouchableOpacity
        style={styles.eventCardContent}
        onPress={onEventPress}
        activeOpacity={0.8}>
        <View style={styles.imageContainer}>
          {item.image_url && getImageSource(item.image_url) ? (
            <Image
              source={getImageSource(item.image_url)!}
              style={[styles.eventImage, isZeca && styles.zecaImage]}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.eventImagePlaceholder, isZeca && styles.zecaImagePlaceholder]}>
              <Calendar size={isZeca ? 32 : 48} color="#9ca3af" />
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageGradient}
          />
          <View style={styles.overlayContent}>
            <Text style={[styles.eventTitle, isZeca && styles.zecaTitle]}>
              {item.title_local || item.title}
            </Text>
            {item.day_name && (
              <Text style={styles.dayName}>{item.day_name}</Text>
            )}
          </View>
        </View>
        <View style={styles.eventContent}>
          <Text style={[styles.eventDescription, isZeca && styles.zecaDescription]} numberOfLines={isZeca ? 2 : 3}>
            {item.description_croatian || item.description}
          </Text>
        </View>
      </TouchableOpacity>

      {hasExpandableContent && (
        <>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={onToggle}
            activeOpacity={0.7}>
            <Text style={styles.expandButtonText}>
              {isExpanded ? 'Sakrij' : hasCategories ? 'Prikaži dane' : 'Prikaži događaje'}
            </Text>
            <Animated.View style={chevronAnimatedStyle}>
              <ChevronDown size={18} color="#6b7280" />
            </Animated.View>
          </TouchableOpacity>

          <Animated.View style={[styles.categoriesSection, contentAnimatedStyle]}>
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
          </Animated.View>
        </>
      )}
    </View>
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

      setEvents(eventsWithCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  function isEventHappeningToday(event: EventWithCategories): boolean {
    if (!event.event_date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDate = new Date(event.event_date);
    eventDate.setHours(0, 0, 0, 0);

    return today.getTime() === eventDate.getTime();
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
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>Učitavanje događaja...</Text>
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
          <Calendar size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>Nema zakazanih događaja</Text>
          <Text style={styles.emptySubtext}>
            Provjerite kasnije za događaje Mesopusta
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Novljanski mesopust i Novljansko kolo</Text>
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const isExpanded = expandedEvents.has(item.id);
            const isZeca = item.title === 'Zeča';
            const isHappeningToday = isEventHappeningToday(item);

            return (
              <View style={styles.eventCardWrapper}>
                {isHappeningToday && (
                  <View style={[styles.liveBadge, isZeca && styles.liveBadgeOffset]}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveBadgeText}>UŽIVO</Text>
                  </View>
                )}
                <View style={[
                  isZeca && styles.zecaCard,
                  isHappeningToday && styles.eventCardLive
                ]}>
                  {isZeca && (
                    <View style={styles.zecaNotice}>
                      <Text style={styles.zecaNoticeText}>Nije dio narodne pučke drame</Text>
                    </View>
                  )}
                  {item.day_name && isZeca && (
                    <View style={styles.zecaBadge}>
                      <Text style={styles.zecaBadgeText}>{item.day_name}</Text>
                    </View>
                  )}
                  {item.day_name && !isZeca && (
                    <View style={styles.zecaBadge}>
                      <Text style={styles.zecaBadgeText}>{item.day_name}</Text>
                    </View>
                  )}
                  <AnimatedEventCard
                    item={item}
                    isExpanded={isExpanded}
                    onToggle={() => toggleEventExpand(item.id)}
                    onEventPress={() => handleEventPress(item)}
                    onCategoryPress={handleCategoryPress}
                    onSubEventPress={handleSubEventPress}
                  />
                </View>
              </View>
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
    backgroundColor: '#f5f5f7',
    overflow: 'hidden',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  headerContent: {
    width: '100%',
    maxWidth: 600,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: fonts.title,
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: fonts.medium,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: '#4b5563',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: getResponsivePadding(),
    paddingBottom: 120,
  },
  eventCardWrapper: {
    marginBottom: 24,
    width: '100%',
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  eventCardContent: {
    width: '100%',
  },
  expandButton: {
    backgroundColor: '#f9fafb',
    marginTop: -20,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  expandButtonText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: '#6b7280',
  },
  categoriesSection: {
    backgroundColor: '#f9fafb',
    marginHorizontal: 20,
    marginTop: -32,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc2626',
  },
  categoryItemTitle: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: '#111827',
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  eventImage: {
    width: '100%',
    height: getResponsiveImageHeight(),
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
    padding: 20,
  },
  eventImagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventContent: {
    padding: 20,
    paddingTop: 20,
  },
  eventTitle: {
    fontSize: 22,
    fontFamily: fonts.title,
    color: '#ffffff',
  },
  dayName: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  eventDescription: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: '#4b5563',
    lineHeight: 22,
  },
  zecaBadge: {
    position: 'absolute',
    top: 64,
    left: 16,
    backgroundColor: '#6b7280',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  zecaBadgeText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    right: 16,
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveBadgeOffset: {
    right: 'auto',
    left: 150,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  liveBadgeText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  eventCardLive: {
    borderColor: '#dc2626',
    borderWidth: 2,
  },
  zecaCard: {
    opacity: 0.95,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  zecaTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  zecaTitleLocal: {
    fontSize: 14,
  },
  zecaDescription: {
    fontSize: 13,
  },
  zecaImage: {
    height: 140,
  },
  zecaImagePlaceholder: {
    height: 140,
  },
  zecaNotice: {
    backgroundColor: '#fef3c7',
    borderBottomWidth: 1,
    borderBottomColor: '#fbbf24',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  zecaNoticeText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: '#78350f',
    textAlign: 'center',
  },
});
