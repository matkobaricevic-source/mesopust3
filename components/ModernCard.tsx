import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { theme } from '@/constants/theme';
import { ReactNode } from 'react';

interface ModernCardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  gradient?: boolean;
  gradientColors?: string[];
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ModernCard({ children, onPress, style, gradient = false, gradientColors }: ModernCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, {
      damping: 15,
      stiffness: 400,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 400,
    });
  };

  const content = (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );

  if (gradient) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
        disabled={!onPress}
      >
        <LinearGradient
          colors={(gradientColors || theme.colors.primary.gradient) as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, style]}
        >
          {children}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.md,
    overflow: 'hidden',
  },
});
