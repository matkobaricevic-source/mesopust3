import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { CalendarDays, UsersRound, Camera, Search, BookText } from 'lucide-react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolation, SharedValue, interpolateColor, useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';

interface GlassTabBarProps {
  currentIndex: number;
  scrollOffset: SharedValue<number>;
  onTabPress: (index: number) => void;
}

const tabs = [
  { name: 'index', icon: CalendarDays },
  { name: 'browse', icon: UsersRound },
  { name: 'social', icon: Camera },
  { name: 'search', icon: Search },
  { name: 'glossary', icon: BookText },
];

const TAB_COUNT = 5;

function AnimatedIcon({ icon: IconComponent, index, scrollOffset }: { icon: any; index: number; scrollOffset: SharedValue<number> }) {
  const [color, setColor] = useState('#FFFFFF');

  useAnimatedReaction(
    () => {
      const distance = Math.abs(scrollOffset.value - index);
      return interpolateColor(
        distance,
        [0, 1],
        ['#FFFFFF', '#737373']
      );
    },
    (result) => {
      runOnJS(setColor)(result);
    }
  );

  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(scrollOffset.value - index);
    const scale = interpolate(
      distance,
      [0, 1],
      [1.1, 1],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <IconComponent
        size={24}
        color={color}
        strokeWidth={2.5}
      />
    </Animated.View>
  );
}

export function GlassTabBar({ currentIndex, scrollOffset, onTabPress }: GlassTabBarProps) {
  const insets = useSafeAreaInsets();

  const indicatorStyle = useAnimatedStyle(() => {
    const progress = scrollOffset.value;

    return {
      left: `${(progress * 100) / TAB_COUNT}%`,
    };
  });

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 12 }]}>
      <BlurView intensity={90} tint="dark" style={styles.blur}>
        <View style={styles.content}>
          <Animated.View style={[styles.indicator, indicatorStyle]}>
            <LinearGradient
              colors={theme.colors.primary.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.indicatorGradient}
            />
          </Animated.View>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => onTabPress(index)}
              activeOpacity={0.7}
            >
              <AnimatedIcon icon={tab.icon} index={index} scrollOffset={scrollOffset} />
            </TouchableOpacity>
          ))}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: theme.spacing.md,
    right: theme.spacing.md,
    bottom: theme.spacing.md,
    borderRadius: theme.borderRadius.xxl,
    overflow: 'hidden',
    ...theme.shadows.xl,
  },
  blur: {
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    position: 'relative',
  },
  tab: {
    flex: 1,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  indicator: {
    position: 'absolute',
    width: `${100 / TAB_COUNT}%`,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    zIndex: 1,
    top: theme.spacing.md,
    overflow: 'hidden',
  },
  indicatorGradient: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
  },
});
