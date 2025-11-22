import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MapPin, Calendar as CalendarIcon, Heart, ChevronDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts } from '@/constants/fonts';
import { theme } from '@/constants/theme';
import { ModernCard } from '@/components/ModernCard';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function InfoScreen() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isKulturoloskiExpanded, setIsKulturoloskiExpanded] = useState(false);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeIn} style={styles.header}>
        <LinearGradient
          colors={theme.colors.success.gradient || ['#10B981', '#059669'] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>Mesopust</Text>
          <Text style={styles.headerSubtitle}>Kulturna baština</Text>
        </LinearGradient>
      </Animated.View>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <ModernCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={24} color={theme.colors.primary.main} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Lokacija</Text>
            </View>
            <Text style={styles.sectionText}>
              <Text style={styles.bold}>Novi Vinodolski</Text> je povijesni grad na
              hrvatskom Jadranu gdje se Mesopust slavi već generacijama, predstavljajući
              važan dio lokalne kulturne baštine.
            </Text>
          </ModernCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <ModernCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <CalendarIcon size={24} color={theme.colors.primary.main} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Što je Mesopust?</Text>
            </View>
            <View>
              <Text style={styles.sectionText}>
                Novljanski mesopust pokladni je običaj koji seže duboko u prošlost Novog Vinodolskog i zauzima središnje mjesto u lokalnom identitetu koji se prenosi s naraštaja na naraštaj.{' '}
                {!isExpanded && (
                  <Text style={styles.fadeText}>
                    Stoljećima je uspijevao sačuvati svoju jezgru...
                  </Text>
                )}
              </Text>

              {isExpanded && (
                <Text style={styles.sectionText}>
                  Stoljećima je uspijevao sačuvati svoju jezgru, ostajući osebujan i lako prepoznatljiv fenomen, a ujedno i jedna od najbolje sačuvanih usmenih narodnih drama u Hrvata. Upravo zbog te jedinstvenosti privlačio je pozornost raznih struka, znatiželjnika i putnika koji u njemu prepoznaju autentičnu baštinu našega kraja.
                </Text>
              )}

              <TouchableOpacity
                style={styles.readMoreButton}
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.7}
              >
                <Text style={styles.readMoreText}>
                  {isExpanded ? 'Sakrij' : 'Pročitaj više'}
                </Text>
                <ChevronDown
                  size={16}
                  color={theme.colors.primary.main}
                  strokeWidth={2}
                  style={{
                    transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
                  }}
                />
              </TouchableOpacity>
            </View>
          </ModernCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <ModernCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <Heart size={24} color={theme.colors.primary.main} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Kulturološki značaj</Text>
            </View>
            <View>
              <Text style={styles.sectionText}>
                Priznanje Novljanskog mesopusta kao nematerijalnog kulturnog dobra nesumnjivo je važan trenutak za Novi Vinodolski – potvrda višestoljetne tradicije i dokaz njezine kulturne težine.{' '}
                {!isKulturoloskiExpanded && (
                  <Text style={styles.fadeText}>
                    No, iako takav status nosi svoju snagu...
                  </Text>
                )}
              </Text>

              {isKulturoloskiExpanded && (
                <>
                  <Text style={[styles.sectionText, { marginTop: theme.spacing.md }]}>
                    No, iako takav status nosi svoju snagu i vidljivost, za Novljane je vrijednost mesopusta uvijek bila i ostala mnogo veća. Ona proizlazi iz činjenice da je običaj opstao usprkos svim povijesnim mijenama, živeći kroz generacije koje su ga nosile u sebi. Njegova se snaga temelji upravo na neprekinutoj vezi između zajednice i običaja koji prati čovjeka od najranijeg djetinjstva.
                  </Text>
                  <Text style={[styles.sectionText, { marginTop: theme.spacing.md }]}>
                    Mesopust se ne može „obuzdati", jer njegova je bit u prelasku iz linearnog u cikličko vrijeme – u preokretu, privremenom oslobađanju i mijeni vlasti. Ne bi mogao preživjeti nijednu epohu da nije duboko ukorijenjen u narodu. Čak i kada se čini da je priklonjen – vjerujte, nije.
                  </Text>
                  <Text style={[styles.sectionText, { marginTop: theme.spacing.md }]}>
                    On nam oblikuje osjećaj pripadnosti, doziva ljubav predaka koji su ga s ponosom i pažnjom čuvali da ostane i za nas, i tako nas čvrsto veže uz grad, uz naš Novi.
                  </Text>
                </>
              )}

              <TouchableOpacity
                style={styles.readMoreButton}
                onPress={() => setIsKulturoloskiExpanded(!isKulturoloskiExpanded)}
                activeOpacity={0.7}
              >
                <Text style={styles.readMoreText}>
                  {isKulturoloskiExpanded ? 'Sakrij' : 'Pročitaj više'}
                </Text>
                <ChevronDown
                  size={16}
                  color={theme.colors.primary.main}
                  strokeWidth={2}
                  style={{
                    transform: [{ rotate: isKulturoloskiExpanded ? '180deg' : '0deg' }],
                  }}
                />
              </TouchableOpacity>
            </View>
          </ModernCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <ModernCard gradient gradientColors={theme.colors.primary.gradient} style={styles.footer}>
            <Text style={styles.footerText}>
              Doživite živu tradiciju Mesopusta
            </Text>
          </ModernCard>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
    borderRadius: theme.borderRadius.xl,
  },
  headerGradient: {
    padding: theme.spacing.xl,
    paddingTop: 80,
    paddingBottom: theme.spacing.xl,
  },
  headerTitle: {
    ...theme.typography.display,
    fontSize: 36,
    color: '#000000',
    fontFamily: fonts.title,
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    ...theme.typography.body1,
    color: 'rgba(0, 0, 0, 0.7)',
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 120,
    gap: theme.spacing.lg,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    fontWeight: '700',
  },
  sectionText: {
    ...theme.typography.body1,
    color: theme.colors.text.secondary,
    lineHeight: 26,
  },
  bold: {
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  fadeText: {
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  readMoreText: {
    ...theme.typography.body2,
    color: theme.colors.primary.main,
    fontWeight: '600',
  },
  footer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    ...theme.typography.h4,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    fontWeight: '600',
  },
});
