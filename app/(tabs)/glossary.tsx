import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MapPin, Calendar as CalendarIcon, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts } from '@/constants/fonts';
import { theme } from '@/constants/theme';
import { ModernCard } from '@/components/ModernCard';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function InfoScreen() {
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
            <Text style={styles.sectionText}>
              Mesopust je tradicionalna karnevalska proslava koja obilježava
              razdoblje prije korizme u kršćanskom kalendaru. Riječ "Mesopust" dolazi
              od "meso" i "pustiti", što se odnosi na oproštaj od mesa prije posta.
            </Text>
          </ModernCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <ModernCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <Heart size={24} color={theme.colors.primary.main} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Kulturni značaj</Text>
            </View>
            <Text style={styles.sectionText}>
              Tradicija Mesopusta čuva hrvatsku kulturnu baštinu i okuplja
              zajednicu. Povezuje mlađe generacije s njihovim precima kroz
              glazbu, ples i tradicionalne običaje. Slavlje prikazuje regionalni
              identitet i čuva priče i tradicije Novog Vinodolskog.
            </Text>
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
