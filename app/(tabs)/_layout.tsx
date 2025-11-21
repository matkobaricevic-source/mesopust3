import { useState } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
// Add GestureHandlerRootView import
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { GlassTabBar } from '@/components/GlassTabBar';
import IndexScreen from './index';
import BrowseScreen from './browse';
import SearchScreen from './search';
import GlossaryScreen from './glossary';

const { width } = Dimensions.get('window');
const TABS_COUNT = 4;

export default function TabLayout() {
  const [currentPage, setCurrentPage] = useState(0);
  const translateX = useSharedValue(0);
  const scrollOffset = useSharedValue(0);
  const startX = useSharedValue(0);

  const tabs = [
    <IndexScreen key="index" />,
    <BrowseScreen key="browse" />,
    <SearchScreen key="search" />,
    <GlossaryScreen key="glossary" />,
  ];

  const updatePage = (newPage: number) => {
    setCurrentPage(newPage);
    scrollOffset.value = newPage;
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      const newTranslate = startX.value + event.translationX;
      const minTranslate = -(TABS_COUNT - 1) * width;
      const maxTranslate = 0;

      translateX.value = Math.max(minTranslate, Math.min(maxTranslate, newTranslate));
      scrollOffset.value = -translateX.value / width;
    })
    .onEnd((event) => {
      const shouldSwipe = Math.abs(event.velocityX) > 500 || Math.abs(event.translationX) > width / 3;

      let targetPage = currentPage;
      if (shouldSwipe) {
        if (event.translationX < 0 && currentPage < TABS_COUNT - 1) {
          targetPage = currentPage + 1;
        } else if (event.translationX > 0 && currentPage > 0) {
          targetPage = currentPage - 1;
        }
      }

      translateX.value = withSpring(-targetPage * width, {
        damping: 20,
        stiffness: 90,
      });
      scrollOffset.value = withSpring(targetPage, {
        damping: 20,
        stiffness: 90,
      });

      if (targetPage !== currentPage) {
        runOnJS(updatePage)(targetPage);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleTabPress = (index: number) => {
    translateX.value = withSpring(-index * width, {
      damping: 20,
      stiffness: 200,
      mass: 0.8,
    });
    scrollOffset.value = withSpring(index, {
      damping: 20,
      stiffness: 200,
      mass: 0.8,
    });
    updatePage(index);
  };

  return (
    // ✨ FIX: Wrap the entire component in GestureHandlerRootView
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.pagesContainer, animatedStyle]}>
            {tabs.map((tab, index) => (
              <View key={index} style={styles.page}>
                {tab}
              </View>
            ))}
          </Animated.View>
        </GestureDetector>
        <GlassTabBar
          currentIndex={currentPage}
          scrollOffset={scrollOffset}
          onTabPress={handleTabPress}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  pagesContainer: {
    flex: 1,
    flexDirection: 'row',
    width: width * TABS_COUNT,
    backgroundColor: '#000000',
  },
  page: {
    width,
    flex: 1,
    backgroundColor: '#000000',
  },
});