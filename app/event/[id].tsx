import { useEffect, useState } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, interpolate } from 'react-native-reanimated';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Event, Participant, Category } from '@/types/database';

interface EventStep {
  id: string;
  step_number: number;
  title: string;
  image_url: string | null;
  note: string | null;
}

interface EventCrossroad {
  id: string;
  crossroad_number: number;
  title: string;
  image_url: string | null;
}
import { ArrowLeft, Users, ChevronRight, Info, Shirt, HelpCircle, ChevronDown, ChevronUp, Clock, AlertCircle } from 'lucide-react-native';
import { getImageSource } from '@/lib/imageUtils';

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
  const [eventCrossroads, setEventCrossroads] = useState<EventCrossroad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailedInfo, setShowDetailedInfo] = useState(false);
  const [showDispetInfo, setShowDispetInfo] = useState(false);
  const [showImenovanjeInfo, setShowImenovanjeInfo] = useState(false);
  const [showMisenjeInfo, setShowMisenjeInfo] = useState(false);
  const [showEventSteps, setShowEventSteps] = useState(false);
  const [showCrossroads, setShowCrossroads] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showPozivanjeInfo, setShowPozivanjeInfo] = useState(false);
  const eventStepsAnimation = useSharedValue(0);
  const crossroadsAnimation = useSharedValue(0);
  const router = useRouter();

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(eventStepsAnimation.value, [0, 1], [0, 180])}deg` }],
  }));

  const chevronCrossroadsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(crossroadsAnimation.value, [0, 1], [0, 180])}deg` }],
  }));

  const timelineAnimatedStyle = useAnimatedStyle(() => ({
    maxHeight: interpolate(eventStepsAnimation.value, [0, 1], [0, 5000]),
    opacity: interpolate(eventStepsAnimation.value, [0, 0.5, 1], [0, 1, 1]),
    overflow: 'hidden',
  }));

  const crossroadsAnimatedStyle = useAnimatedStyle(() => ({
    maxHeight: interpolate(crossroadsAnimation.value, [0, 1], [0, 5000]),
    opacity: interpolate(crossroadsAnimation.value, [0, 0.5, 1], [0, 1, 1]),
    overflow: 'hidden',
  }));

  useEffect(() => {
    loadEventDetails();
  }, [id]);

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

      // If this is a Zeča sub-event, redirect to the main Zeča event
      if (eventData.title === 'Zeča' && eventData.parent_event_id) {
        const { data: mainZeca } = await supabase
          .from('events')
          .select('id')
          .eq('title', 'Zeča')
          .is('parent_event_id', null)
          .maybeSingle();

        if (mainZeca) {
          router.replace(`/event/${mainZeca.id}`);
          return;
        }
      }

      setEvent(eventData);

      const { data: participantData, error: participantError } = await supabase
        .from('event_participants')
        .select('role_description, participants(*)')
        .eq('event_id', id);

      if (participantError) throw participantError;

      const eventParticipants: ParticipantWithRole[] = (
        participantData || []
      ).map((ep: any) => ({
        ...ep.participants,
        role_description: ep.role_description,
      }));

      eventParticipants.sort((a, b) => a.display_order - b.display_order);
      setParticipants(eventParticipants);

      const { data: subEventsData, error: subEventsError } = await supabase
        .from('events')
        .select('*')
        .eq('parent_event_id', id)
        .order('display_order', { ascending: true });

      if (subEventsError) throw subEventsError;
      setSubEvents(subEventsData || []);

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('event_id', id)
        .order('display_order', { ascending: true });

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      const { data: stepsData, error: stepsError } = await supabase
        .from('event_steps')
        .select('*')
        .eq('event_id', id)
        .order('step_number', { ascending: true });

      if (stepsError) throw stepsError;
      setEventSteps(stepsData || []);

      const { data: crossroadsData, error: crossroadsError } = await supabase
        .from('event_crossroads')
        .select('*')
        .eq('event_id', id)
        .order('crossroad_number', { ascending: true });

      if (crossroadsError) throw crossroadsError;
      setEventCrossroads(crossroadsData || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load event details'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleParticipantPress(participant: Participant) {
    router.push(`/participant/${participant.id}`);
  }

  function handleCategoryPress(category: Category) {
    router.push(`/category/${category.id}`);
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Događaj nije pronađen'}</Text>
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
      <ScrollView style={styles.content} bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          {event.image_url && getImageSource(event.image_url) ? (
            <>
              <Image
                source={getImageSource(event.image_url)!}
                style={styles.eventImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
                style={styles.heroGradient}
              />
            </>
          ) : (
            <View style={styles.eventImagePlaceholder} />
          )}
          <View style={styles.heroContent}>
            <Text style={styles.eventTitle}>{event.title_local || event.title}</Text>
          </View>
        </View>

        <View style={styles.eventInfo}>
          {event.title === 'Zeča' ? (
            <View>
              <View style={styles.descriptionContainer}>
                <Text
                  style={styles.eventDescription}
                  numberOfLines={isDescriptionExpanded ? undefined : 4}>
                  {event.description_croatian || event.description}
                </Text>
                {!isDescriptionExpanded && (
                  <LinearGradient
                    colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
                    style={styles.descriptionFade}
                    pointerEvents="none"
                  />
                )}
              </View>
              <TouchableOpacity
                style={styles.readMoreButton}
                onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                activeOpacity={0.7}>
                <Text style={styles.readMoreText}>
                  {isDescriptionExpanded ? 'Prikaži manje' : 'Prikaži više'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.eventDescription}>{event.description_croatian || event.description}</Text>
          )}

          {event.costume_note && (
            <View style={styles.costumeNoteCard}>
              <View style={styles.costumeNoteHeader}>
                <Shirt size={18} color="#6b7280" />
                <Text style={styles.costumeNoteText}>{event.costume_note}</Text>
              </View>
              <Text style={styles.costumeNoteDescription}>Mesopustari su obučeni u civilnu odjeću</Text>
            </View>
          )}

          {event.title === 'Zeča' && (
            <TouchableOpacity
              style={styles.collapsibleCard}
              onPress={() => setShowPozivanjeInfo(!showPozivanjeInfo)}
              activeOpacity={0.7}>
              <View style={styles.collapsibleHeader}>
                <View style={styles.collapsibleTitleContainer}>
                  <Info size={20} color="#dc2626" />
                  <Text style={styles.collapsibleTitle}>IZVEDBA POZIVANJA NA ZEČU</Text>
                </View>
                {showPozivanjeInfo ? (
                  <ChevronUp size={20} color="#6b7280" />
                ) : (
                  <ChevronDown size={20} color="#6b7280" />
                )}
              </View>
              {showPozivanjeInfo && (
                <View style={styles.collapsibleContent}>
                  <Text style={styles.collapsibleQuote}>
                    „Spravljajte se spravljajte, vesla su na barki-i-i-i!"
                  </Text>
                  <Text style={styles.collapsibleQuote}>
                    „ Gremo na Zeču pobirat datul-e-e-e-e!"
                  </Text>
                  <Text style={styles.collapsibleText}>
                    Opis simbolike i značenja pozivanja na Zeču zabilježen je u knjizi „Narodno kolo i mesopusni običaji" autora Srećka Kabalina:
                  </Text>
                  <Text style={styles.collapsibleDescription}>
                    "Riječ „ZEČA" izmijenjeno je ime za pusti i nenastanjeni otok ZEC koji se nalazi u Povelebitskom kanalu, u trokutu između Novog Vinodolskog, Senja i Baške na otoku Krku. Obzirom da na Zecu žive samo galebovi i gušterice, smatra se da u ovom pozivu kulminira mesopusna lakrdija oko mesopusne ženidbe udovaca i udovica, kada ih upućuju upravo tamo na svadbeno putovanje i po datule.
                  </Text>
                  <Text style={styles.collapsibleDescription}>
                    Simbolike radi uobičajeno je da se mlađe snahe, koje imaju smisla za humor i maškare, obuku u „kotige"-dugačko žensko krilo postavljeno janjećom kožom-i takav prsluk, na leđima užem oprte slamnice, pokrivače i jastuke, kao da se spremaju na putovanje. U ruci običavaju nositi petrolejsku lampu (fenjer), često sa crveno obojenim staklom te skupa sa mesopustarima obilaze gradom pozivajući „na Zeču"."
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {event.id === '4bacfe02-bdda-4bdf-8f4d-c589647fb0c3' && (
            <>
              <TouchableOpacity
                style={styles.dispetNoteCard}
                onPress={() => setShowDispetInfo(true)}
                activeOpacity={0.7}>
                <View style={styles.costumeNoteHeader}>
                  <HelpCircle size={18} color="#6b7280" />
                  <Text style={styles.costumeNoteText}>Mesopustari rade "dešpet"</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.performanceNoteCard}
                onPress={() => {
                  const napovidanjePerformance = categories.find(cat => cat.title_local === 'Napovidanje (izvedba)');
                  if (napovidanjePerformance) {
                    router.push(`/category/${napovidanjePerformance.id}`);
                  }
                }}
                activeOpacity={0.7}>
                <View style={styles.costumeNoteHeader}>
                  <Info size={18} color="#dc2626" />
                  <Text style={styles.performanceNoteText}>Napovidanje (izvedba)</Text>
                </View>
              </TouchableOpacity>
            </>
          )}

          {event.id === 'c67ad74c-2cd6-4aec-8351-799c052c72d8' && (
            <>
              <TouchableOpacity
                style={styles.dispetNoteCard}
                onPress={() => setShowImenovanjeInfo(true)}
                activeOpacity={0.7}>
                <View style={styles.costumeNoteHeader}>
                  <HelpCircle size={18} color="#6b7280" />
                  <Text style={styles.costumeNoteText}>Imenovanje mesopusta</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dispetNoteCard}
                onPress={() => setShowMisenjeInfo(true)}
                activeOpacity={0.7}>
                <View style={styles.costumeNoteHeader}>
                  <HelpCircle size={18} color="#6b7280" />
                  <Text style={styles.costumeNoteText}>Mišenje / izrada mesopusta</Text>
                </View>
              </TouchableOpacity>
            </>
          )}

          {event.id === '7f85e2b6-f6cf-4d5b-be4d-6b21da19bfe8' && (
            <View style={styles.infoNoteCard}>
              <View style={styles.infoNoteHeader}>
                <Info size={18} color="#6b7280" />
                <Text style={styles.infoNoteText}>Cijela Mlada mesopustova je sastavljena od muških glumaca</Text>
              </View>
            </View>
          )}

          {event.id === 'a3b4c5d6-e7f8-a9b0-c1d2-e3f4a5b6c7d8' ? (
            <TouchableOpacity
              style={styles.relatedEventButtonMain}
              onPress={() => {
                const tretoNapovidanjeCategory = categories.find(cat => cat.title_local === 'Treto napovidanje - izvedba');
                if (tretoNapovidanjeCategory) {
                  router.push(`/category/${tretoNapovidanjeCategory.id}`);
                }
              }}
              activeOpacity={0.8}>
              <Info size={20} color="#ffffff" />
              <Text style={styles.relatedEventButtonMainText}>Treto napovidanje - izvedba</Text>
            </TouchableOpacity>
          ) : event.related_event_id ? (
            <TouchableOpacity
              style={styles.relatedEventButtonMain}
              onPress={() => router.push(`/event/${event.related_event_id}`)}
              activeOpacity={0.8}>
              <Info size={20} color="#ffffff" />
              <Text style={styles.relatedEventButtonMainText}>Napovidanje dovcen i dovican</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.moreInfoButton}
              onPress={() => setShowDetailedInfo(true)}
              activeOpacity={0.8}>
              <Info size={20} color="#ffffff" />
              <Text style={styles.moreInfoButtonText}>Više informacija</Text>
            </TouchableOpacity>
          )}
        </View>

        {eventSteps.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.timelineHeader}
              onPress={() => {
                setShowEventSteps(!showEventSteps);
                eventStepsAnimation.value = withTiming(showEventSteps ? 0 : 1, { duration: 300 });
              }}
              activeOpacity={0.7}>
              <View style={styles.timelineHeaderContent}>
                <View>
                  <Text style={styles.sectionTitle}>Tijek događaja</Text>
                  <Text style={styles.sectionSubtitle}>
                    {eventSteps.length} {eventSteps.length === 1 ? 'korak' : 'koraka'}
                  </Text>
                </View>
                <Animated.View style={chevronAnimatedStyle}>
                  <ChevronDown size={24} color="#dc2626" />
                </Animated.View>
              </View>
            </TouchableOpacity>
            <Animated.View
              style={[
                styles.timelineContainer,
                timelineAnimatedStyle,
              ]}>
                {(() => {
                  let stationCounter = 0;
                  const napovidanjePerformance = categories.find(cat => cat.title_local === 'Napovidanje (izvedba)');
                  const items: any[] = [];

                  eventSteps.forEach((step, index) => {
                    const titleLower = step.title.toLowerCase();
                    const isStation = titleLower.includes('stanica') || titleLower.includes('stanici') || titleLower.includes('stanicu');
                    if (isStation) stationCounter++;
                    const stationNumber = isStation ? stationCounter : null;

                    items.push(
                      <View key={step.id} style={styles.timelineItem}>
                        <View style={styles.timelineMarker}>
                          <View style={[styles.timelineNumber, isStation && styles.stationNumber]}>
                            <Text style={[styles.timelineNumberText, isStation && styles.stationNumberText]}>
                              {step.step_number}
                            </Text>
                          </View>
                          {(index < eventSteps.length - 1 || step.step_number === 4) && <View style={styles.timelineLine} />}
                        </View>
                        <View style={styles.timelineContent}>
                          {step.image_url && getImageSource(step.image_url) && (
                            <Image
                              source={getImageSource(step.image_url)!}
                              style={styles.timelineImage}
                              resizeMode="cover"
                            />
                          )}
                          <View style={[styles.timelineTextContainer, isStation && styles.stationTextContainer]}>
                            {isStation && (
                              <View style={styles.stationBadgeInline}>
                                <Text style={styles.stationBadgeInlineText}>{stationNumber}</Text>
                              </View>
                            )}
                            <Text style={[styles.timelineStepTitle, isStation && styles.stationTitle]}>
                              {step.title}
                            </Text>
                          </View>
                          {step.step_number === 3 && event?.title === 'Napovidanje' && (
                            <View style={styles.stationTimeNote}>
                              <Clock size={14} color="#dc2626" />
                              <Text style={styles.stationTimeNoteText}>
                                1. Četrtak 22:00 • 2. Četrtak 23:00 • 3. Četrtak 00:00
                              </Text>
                            </View>
                          )}
                          {step.note && (
                            <View style={styles.stepNoteContainer}>
                              <Info size={14} color="#6b7280" />
                              <Text style={styles.stepNoteText}>{step.note}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    );

                    // Insert the clickable performance category after step 4
                    if (step.step_number === 4 && napovidanjePerformance) {
                      items.push(
                        <TouchableOpacity
                          key={napovidanjePerformance.id}
                          style={styles.timelineItem}
                          onPress={() => router.push(`/category/${napovidanjePerformance.id}`)}
                          activeOpacity={0.7}>
                          <View style={styles.timelineMarker}>
                            <View style={styles.timelinePerformanceMarker}>
                              <Info size={16} color="#dc2626" />
                            </View>
                            <View style={styles.timelineLine} />
                          </View>
                          <View style={[styles.timelineContent, styles.performanceContent]}>
                            {napovidanjePerformance.image_url && getImageSource(napovidanjePerformance.image_url) && (
                              <Image
                                source={getImageSource(napovidanjePerformance.image_url)!}
                                style={styles.timelineImage}
                                resizeMode="cover"
                              />
                            )}
                            <View style={[styles.timelineTextContainer, styles.performanceTextContainer]}>
                              <Text style={styles.performanceTitle}>
                                {napovidanjePerformance.title_local || napovidanjePerformance.title}
                              </Text>
                              <ChevronRight size={20} color="#dc2626" style={styles.performanceChevron} />
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    }
                  });

                  return items;
                })()}
              </Animated.View>
          </View>
        )}

        {eventCrossroads.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.timelineHeader}
              onPress={() => {
                setShowCrossroads(!showCrossroads);
                crossroadsAnimation.value = withTiming(showCrossroads ? 0 : 1, { duration: 300 });
              }}
              activeOpacity={0.7}>
              <View style={styles.timelineHeaderContent}>
                <View>
                  <Text style={styles.sectionTitle}>Raskrižja napovidi</Text>
                  <Text style={styles.sectionSubtitle}>
                    {eventCrossroads.length} {eventCrossroads.length === 1 ? 'raskrižje' : 'raskrižja'}
                  </Text>
                </View>
                <Animated.View style={chevronCrossroadsAnimatedStyle}>
                  <ChevronDown size={24} color="#dc2626" />
                </Animated.View>
              </View>
            </TouchableOpacity>
            <Animated.View
              style={[
                styles.timelineContainer,
                crossroadsAnimatedStyle,
              ]}>
                {eventCrossroads.map((crossroad, index) => (
                  <View key={crossroad.id} style={styles.timelineItem}>
                    <View style={styles.timelineMarker}>
                      <View style={[styles.timelineNumber, styles.crossroadNumber]}>
                        <Text style={[styles.timelineNumberText, styles.crossroadNumberText]}>
                          {crossroad.crossroad_number}
                        </Text>
                      </View>
                      {index < eventCrossroads.length - 1 && <View style={styles.timelineLine} />}
                    </View>
                    <View style={styles.timelineContent}>
                      {crossroad.image_url && getImageSource(crossroad.image_url) && (
                        <Image
                          source={getImageSource(crossroad.image_url)!}
                          style={styles.timelineImage}
                          resizeMode="cover"
                        />
                      )}
                      <View style={[styles.timelineTextContainer, styles.crossroadTextContainer]}>
                        <Text style={[styles.timelineStepTitle, styles.crossroadTitle]}>
                          {crossroad.title}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </Animated.View>
          </View>
        )}

        {(categories.length > 0 || subEvents.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Događaji</Text>
            <Text style={styles.sectionSubtitle}>
              {(() => {
                const filteredCount = categories.filter(c => c.title_local !== 'Napovidanje (izvedba)').length + subEvents.length;
                return `${filteredCount} ${filteredCount === 1 ? 'događaj' : 'događaja'}`;
              })()}
            </Text>

            <View style={styles.categoriesGrid}>
              {(() => {
                const allItems = [...categories.filter(c => c.title_local !== 'Napovidanje (izvedba)').map(c => ({ ...c, type: 'category' })), ...subEvents.map(e => ({ ...e, type: 'event' }))]
                  .sort((a, b) => a.display_order - b.display_order);

                const zecaIndex = allItems.findIndex(item => item.title === 'Zeča');
                const tretiCetvrtakIndex = allItems.findIndex(item => item.title === 'Treti četrtak - Poberuhi');

                // If both exist, move Zeča after Treti četrtak
                if (zecaIndex !== -1 && tretiCetvrtakIndex !== -1 && zecaIndex < tretiCetvrtakIndex) {
                  const zecaItem = allItems.splice(zecaIndex, 1)[0];
                  const newTretiIndex = allItems.findIndex(item => item.title === 'Treti četrtak - Poberuhi');
                  allItems.splice(newTretiIndex + 1, 0, zecaItem);
                }

                return allItems.map((item, index) => {
                  const isZeca = item.title === 'Zeča';
                  const isTretiCetvrtak = item.title === 'Treti mesopusni četrtak – „POBERUHI"';
                  const shouldIndent = isZeca;
                  const prevItem = index > 0 ? allItems[index - 1] : null;
                  const isPrevTretiCetvrtak = prevItem?.title === 'Treti mesopusni četrtak – „POBERUHI"';

                  return (
                    <View key={item.id}>
                      {isPrevTretiCetvrtak && isZeca && (
                        <View style={styles.sameDayIndicator}>
                          <View style={styles.sameDayLine} />
                          <Text style={styles.sameDayText}>Istog dana:</Text>
                        </View>
                      )}
                      <TouchableOpacity
                        style={[styles.categoryCard, shouldIndent && styles.categoryCardIndented]}
                        onPress={() => item.type === 'category' ? handleCategoryPress(item) : router.push(`/event/${item.id}`)}
                        activeOpacity={0.7}>
                        <View style={styles.categoryContent}>
                          <Text style={styles.categoryTitle}>{item.title}</Text>
                          {item.title_local && item.title_local !== item.title && (
                            <Text style={styles.categoryTitleLocal}>
                              {item.title_local}
                            </Text>
                          )}
                          <Text style={styles.categoryDescription} numberOfLines={2}>
                            {item.description_croatian || item.description}
                          </Text>
                        </View>
                        <ChevronRight size={20} color="#9ca3af" />
                      </TouchableOpacity>
                    </View>
                  );
                });
              })()}
            </View>
          </View>
        )}

        {participants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Akteri</Text>
            <Text style={styles.sectionSubtitle}>
              {participants.length}{' '}
              {participants.length === 1 ? 'akter nastupa' : 'aktera nastupa'} na ovom
              događaju
            </Text>

            <View style={styles.participantsGrid}>
              {participants.map((participant) => (
                <TouchableOpacity
                  key={participant.id}
                  style={styles.participantCard}
                  onPress={() => handleParticipantPress(participant)}
                  activeOpacity={0.7}>
                  <View style={styles.participantHeader}>
                    <Users size={20} color="#dc2626" />
                    <View style={styles.participantHeaderText}>
                      <Text style={styles.participantName}>
                        {participant.name}
                      </Text>
                      {participant.name_croatian && participant.name_croatian !== participant.name && (
                        <Text style={styles.participantNameCroatian}>
                          {participant.name_croatian}
                        </Text>
                      )}
                    </View>
                  </View>
                  {participant.role_description && (
                    <Text style={styles.participantRole}>
                      {participant.role_description}
                    </Text>
                  )}
                  <Text style={styles.participantDescription} numberOfLines={2}>
                    {participant.description_croatian || participant.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.fixedBackButtonContainer}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.back()}>
          <View style={styles.backButtonCircle}>
            <ArrowLeft size={22} color="#000000" />
          </View>
        </TouchableOpacity>
      </View>

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
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalEventTitle}>{event.title}</Text>
            {event.title_local && (
              <Text style={styles.modalEventTitleLocal}>{event.title_local}</Text>
            )}
            <Text style={styles.modalEventDescription}>{event.description_croatian_full || event.description_croatian || event.description}</Text>

            {event.title === 'Zeča' && (
              <View style={styles.criticalNoteCard}>
                <View style={styles.criticalNoteHeader}>
                  <AlertCircle size={20} color="#dc2626" />
                  <Text style={styles.criticalNoteTitle}>Očuvanje tradicije</Text>
                </View>
                <Text style={styles.criticalNoteText}>
                  Iako se običaj s vremenom prilagođava, u duhu očuvanja autentičnosti, prioritet je zadržati ono što je izvorno. Običaj nalaže povratak tradicionalnim kostimima (kotige i sarze), s obzirom na to da su prikazi u kostimima mornara i kapetana sve učestaliji.
                </Text>
                <Text style={styles.criticalNoteText}>
                  Izvorni prikaz podrazumijeva pjevanje narodnih pjesama, dok se elementi poput baklji i razne netradicionalne glazbe ne nalaze u temeljnoj izvedbi običaja.
                </Text>
                <Text style={styles.criticalNoteText}>
                  Da bi se očuvala izvorna simbolika civilne odjeće na ,napovidanjima', poželjno je da se ,mesopustari' — koji danas sudjeluju u ,Zeči', iako to nije dio tradicije — nakon tog segmenta vrate u civilno ruho, što je danas izvedivo jer ,Zeča' započinje za dana, a ne predvečer, kao nekada. Na taj bi se način očuvala nekadašnja praksa, a ,mesopustari' bi ostali usmjereni na obavljanje svog dijela običaja i svoje primarne obveze, što zahtijeva punu usredotočenost.
                </Text>
              </View>
            )}

            <View style={styles.modalPlaceholder}>
              <Info size={48} color="#d1d5db" />
              <Text style={styles.modalPlaceholderText}>
                Ovdje možete dodati detaljne informacije o događaju
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showDispetInfo}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDispetInfo(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Dešpet</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDispetInfo(false)}>
              <Text style={styles.modalCloseButtonText}>Zatvori</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalEventTitle}>Što je "dešpet"?</Text>
            <Text style={styles.modalEventDescription}>
              U starija vremena, nakon službenog dijela napovidanja, mesopustari su se raspuštali i odlazili na prela – druženja po kućama kod mladih djevojaka. Nakon što bi prela završila, znali su napraviti "dešpet" (šaljivu nepodopštinu) obiteljima koje imaju neudanu djevojku, osobito onima koji im nisu otvorili vrata. Ukrali bi nešto i izložili to na Placu (glavnom gradskom trgu, centru), pazeći da se ukradeno ne uništi. Ujutro bi ukradene stvari bile dostupne za povratak kući. Premda su prela nestala, bar u navedenom obliku („po kućama"), dešpet se i dalje prakticira.
            </Text>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showImenovanjeInfo}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowImenovanjeInfo(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Imenovanje mesopusta</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowImenovanjeInfo(false)}>
              <Text style={styles.modalCloseButtonText}>Zatvori</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalEventTitle}>Kršćenje i imenovanje Mesopusta</Text>
            <Text style={styles.modalEventDescription}>
              U proceduri kršćenja, Mesopust dobiva godišnje (aktualno) ime koje izruguje, osuđuje ili ironizira neki mjesni događaj ili pojavu.
            </Text>
            <Text style={styles.modalEventDescription} style={{ marginTop: 16 }}>
              Ime koje dobije najširu podršku u nadmetanju ponuđenih imena pričvrsti se Mesopustu na prsa. Ovaj ritual je duboko ukorijenjeni dio tradicije koja omogućuje zajednici da kroz humor i satiru komentira događaje iz protekle godine.
            </Text>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showMisenjeInfo}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMisenjeInfo(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Mišenje / izrada mesopusta</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowMisenjeInfo(false)}>
              <Text style={styles.modalCloseButtonText}>Zatvori</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalEventTitle}>Izrada lutke Mesopusta</Text>
            <Text style={styles.modalEventDescription}>
              Od slame se napravi lutka u ljudskoj veličini koja predstavlja Mesopust. Lutka se oblaži u tradicionalnu odjeću: bijele hlače, bijelu košulju i crnu jaketu (sako).
            </Text>
            <Text style={styles.modalEventDescription} style={{ marginTop: 16 }}>
              Mesopust se pokrije polucilindrom i posjede na kantridu (stolicu). Ovaj ritual "mišenja" ili izrade Mesopusta središnji je dio pripreme za mesopusne dane. Nakon izrade, lutka će biti nosač svih simboličkih značenja kroz cijelo razdoblje mesopusta.
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
    backgroundColor: '#f5f5f7',
    width: '100%',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  heroContainer: {
    position: 'relative',
    width: '100%',
    height: 400,
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 250,
  },
  heroContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
    padding: 24,
    paddingBottom: 20,
  },
  fixedBackButtonContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 100,
  },
  headerBackButton: {
    zIndex: 100,
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
    width: '100%',
  },
  eventImage: {
    width: '100%',
    height: 400,
  },
  eventImagePlaceholder: {
    width: '100%',
    height: 400,
    backgroundColor: '#1f2937',
  },
  eventInfo: {
    marginTop: -30,
    marginHorizontal: 16,
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  eventTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  eventTitleLocal: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fca5a5',
  },
  eventDescription: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 26,
    marginBottom: 8,
  },
  costumeNoteCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  costumeNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  costumeNoteText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 0.5,
  },
  costumeNoteDescription: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    fontWeight: '400',
  },
  dispetNoteCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  performanceNoteCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  performanceNoteText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#dc2626',
    letterSpacing: 0.5,
  },
  infoNoteCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  infoNoteText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
    flex: 1,
  },
  subEventsContainer: {
    gap: 12,
  },
  subEventCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  subEventContent: {
    flex: 1,
  },
  subEventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  subEventTitleLocal: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc2626',
    marginBottom: 4,
  },
  subEventDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
  categoriesGrid: {
    gap: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  categoryCardIndented: {
    marginLeft: 24,
    borderLeftColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  sameDayIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    marginLeft: 12,
  },
  sameDayLine: {
    width: 2,
    height: 20,
    backgroundColor: '#d1d5db',
    marginRight: 8,
  },
  sameDayText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
    fontStyle: 'italic',
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  categoryTitleLocal: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc2626',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  participantsGrid: {
    gap: 12,
    alignItems: 'center',
    width: '100%',
  },
  participantCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 18,
    width: '100%',
    maxWidth: 600,
  },
  participantHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  participantHeaderText: {
    flex: 1,
    marginLeft: 12,
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
  participantRole: {
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '600',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  participantDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  relatedEventButtonMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  relatedEventButtonMainText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8,
  },
  moreInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 20,
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
  modalEventTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  modalEventTitleLocal: {
    fontSize: 22,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 16,
  },
  modalEventDescription: {
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
  timelineHeader: {
    marginBottom: 16,
  },
  timelineHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineContainer: {
    paddingTop: 8,
    paddingLeft: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  timelineMarker: {
    alignItems: 'center',
    marginRight: 12,
    width: 40,
  },
  timelineNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelinePerformanceMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    borderColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineNumberText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e5e7eb',
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  timelineImage: {
    width: '100%',
    height: 160,
  },
  timelineTextContainer: {
    padding: 12,
    paddingLeft: 8,
  },
  timelineStepTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    lineHeight: 20,
  },
  stationNumber: {
    backgroundColor: '#dc2626',
  },
  stationNumberText: {
    fontSize: 13,
    fontWeight: '600',
  },
  stationTextContainer: {
    backgroundColor: '#f9fafb',
  },
  stationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  performanceContent: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  performanceTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  performanceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
    flex: 1,
  },
  performanceChevron: {
    marginLeft: 8,
  },
  stationTimeNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  stationTimeNoteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#991b1b',
    flex: 1,
  },
  stationBadgeInline: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#2563eb',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  stationBadgeInlineText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  crossroadNumber: {
    backgroundColor: '#dc2626',
  },
  crossroadNumberText: {
    fontSize: 13,
    fontWeight: '600',
  },
  crossroadTextContainer: {
    backgroundColor: '#f9fafb',
  },
  crossroadTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  stepNoteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  stepNoteText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#78350f',
    flex: 1,
    lineHeight: 18,
  },
  descriptionContainer: {
    position: 'relative',
  },
  descriptionFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  readMoreButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#dc2626',
  },
  criticalNoteCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#fecaca',
  },
  criticalNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  criticalNoteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#dc2626',
    letterSpacing: 0.3,
  },
  criticalNoteText: {
    fontSize: 14,
    color: '#991b1b',
    lineHeight: 22,
    marginBottom: 12,
  },
  collapsibleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collapsibleTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  collapsibleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#dc2626',
    letterSpacing: 0.3,
    flex: 1,
  },
  collapsibleContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  collapsibleQuote: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 24,
  },
  collapsibleText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
    fontWeight: '600',
  },
  collapsibleDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 12,
  },
});
