import { ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ArrowLeft } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { getImageSource } from '@/lib/imageUtils';
import { fonts } from '@/constants/fonts';
import { theme } from '@/constants/theme';

interface DetailPageTemplateProps {
  title: string;
  imageUrl?: string | null;
  gradientColors?: readonly [string, string];
  icon?: ReactNode;
  children: ReactNode;
}

export function DetailPageTemplate({
  title,
  imageUrl,
  gradientColors = theme.colors.primary.gradient,
  icon,
  children
}: DetailPageTemplateProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          {imageUrl && getImageSource(imageUrl) ? (
            <Image
              source={getImageSource(imageUrl)!}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroImage}
            >
              {icon}
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
              {title}
            </Animated.Text>
          </View>
        </View>

        <View style={styles.content}>
          {children}
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
  bottomSpacer: {
    height: 100,
  },
});
