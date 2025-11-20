import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import { fonts } from '@/constants/fonts';
import { theme } from '@/constants/theme';
import { ModernButton } from '@/components/ModernButton';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={[theme.colors.primary.main, theme.colors.primary.dark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View entering={FadeIn} style={styles.content}>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <AlertCircle size={80} color={theme.colors.text.inverse} strokeWidth={1.5} />
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(200).springify()} style={styles.title}>
          404
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(300).springify()} style={styles.subtitle}>
          Stranica nije pronađena
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(400).springify()} style={styles.description}>
          Stranica koju tražite ne postoji ili je premještena
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.buttonContainer}>
          <ModernButton
            onPress={() => router.push('/')}
            variant="outline"
            gradient={false}
          >
            Povratak na početnu
          </ModernButton>
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    maxWidth: 400,
  },
  title: {
    ...theme.typography.display,
    fontSize: 72,
    color: theme.colors.text.inverse,
    fontFamily: fonts.title,
    marginTop: theme.spacing.lg,
  },
  subtitle: {
    ...theme.typography.h2,
    color: theme.colors.text.inverse,
    marginTop: theme.spacing.md,
  },
  description: {
    ...theme.typography.body1,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: theme.spacing.md,
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: theme.spacing.xl,
    width: '100%',
  },
});
