import { View, StyleSheet, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import { CalendarDays, UsersRound, Camera, Search, Home } from 'lucide-react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolation, SharedValue, interpolateColor, useDerivedValue, useAnimatedReaction, runOnJS, withSpring } from 'react-native-reanimated';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SwipeableTabBarProps {
  currentIndex: number;
  scrollOffset: SharedValue<number>;
  onTabPress: (index: number) => void;
}

const tabs = [
  { name: 'index', icon: CalendarDays },
  { name: 'browse', icon: UsersRound },
  { name: 'social', icon: Camera },
  { name: 'search', icon: Search },
  { name: 'glossary', icon: Home },
];

const TAB_COUNT = 5;

function AnimatedIcon({ icon: IconComponent, index, scrollOffset }: { icon: any; index: number; scrollOffset: SharedValue<number> }) {
  const [color, setColor] = useState('#ffffff');

  useAnimatedReaction(
    () => {
      const distance = Math.abs(scrollOffset.value - index);
      return interpolateColor(
        distance,
        [0, 1],
        ['#000000', '#ffffff']
      );
    },
    (result) => {
      runOnJS(setColor)(result);
    }
  );

  return (
    <IconComponent
      size={20}
      color={color}
      strokeWidth={1.5}
    />
  );
}

export function SwipeableTabBar({ currentIndex, scrollOffset, onTabPress }: SwipeableTabBarProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [screenWidth, setScreenWidth] = useState(0);
  const insets = useSafeAreaInsets();

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    setScreenWidth(event.nativeEvent.layout.width);
  };

  const indicatorStyle = useAnimatedStyle(() => {
    if (containerWidth === 0) return {};

    const horizontalPadding = 4.5;
    const circleSize = 56;
    const availableWidth = containerWidth - (horizontalPadding * 2);
    const tabWidth = availableWidth / TAB_COUNT;

    const translateX = interpolate(
      scrollOffset.value,
      [0, 1, 2, 3, 4],
      [
        tabWidth * 0.5 - (circleSize / 2),
        tabWidth * 1.5 - (circleSize / 2),
        tabWidth * 2.5 - (circleSize / 2),
        tabWidth * 3.5 - (circleSize / 2),
        tabWidth * 4.5 - (circleSize / 2),
      ],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateX: withSpring(translateX + horizontalPadding, {
        damping: 20,
        stiffness: 200,
        mass: 0.8,
      }) }],
    };
  });

  const EDGE_MARGIN = 24;
  const BASE_WIDTH = 277;
  const scale = screenWidth > 0 ? (screenWidth - 2 * EDGE_MARGIN) / BASE_WIDTH : 1;

  return (
    <View style={styles.outerContainer} onLayout={handleContainerLayout}>
      <View style={[styles.container, { bottom: EDGE_MARGIN + insets.bottom, transform: [{ scale }] }]} onLayout={handleLayout}>
        <Animated.View style={[styles.indicator, indicatorStyle]} />
        {tabs.map((tab, index) => {
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => onTabPress(index)}
              activeOpacity={0.7}
            >
              <AnimatedIcon icon={tab.icon} index={index} scrollOffset={scrollOffset} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    pointerEvents: 'box-none',
  },
  container: {
    position: 'absolute',
    left: '50%',
    width: 277,
    marginLeft: -138.5,
    height: 62,
    backgroundColor: '#0A1628',
    borderRadius: 31,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -0.5 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'visible',
  },
  tab: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  indicator: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    zIndex: 1,
    left: 0,
    top: 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
});
