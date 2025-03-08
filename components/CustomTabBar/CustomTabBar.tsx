import React from 'react'
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import Animated, { FadeIn } from 'react-native-reanimated'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { router } from 'expo-router'

import { Colors } from '@/constants/colors'
import ImagePickerButton from '@/components/ImagePickerButton'

const { width } = Dimensions.get('window')
const TAB_BAR_WIDTH = width * 0.5

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets()

  const getTabIcon = (routeName: string) => {
    switch (routeName) {
      case 'home':
        return 'home'
      case 'profile/index':
        return 'person'
      default:
        return 'home'
    }
  }

  // Split the tabs into two groups - before and after the center button
  const beforeTabs = state.routes.slice(0, Math.floor(state.routes.length / 2))
  const afterTabs = state.routes.slice(Math.floor(state.routes.length / 2))

  const renderTab = (route: any, index: number) => {
    const { options } = descriptors[route.key]
    const isFocused = state.index === index

    const onPress = () => {
      // Use router.push directly for more reliable navigation
      if (!isFocused) {
        // For profile/index, we need to navigate to /profile
        if (route.name === 'profile/index') {
          router.push('/profile')
        } else {
          // Only push to valid routes
          const validRoutes = ['home', 'profile/index']
          if (validRoutes.includes(route.name)) {
            router.push(`/${route.name}`)
          }
        }
      }
    }

    return (
      <TouchableOpacity
        key={route.key}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarTestID}
        onPress={onPress}
        style={styles.tab}>
        <Ionicons
          name={getTabIcon(route.name) as any}
          size={24}
          color={isFocused ? Colors.text : 'rgba(255, 255, 255, 0.2)'}
        />
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Animated.View entering={FadeIn.duration(500)} style={styles.tabBarContainer}>
        <BlurView intensity={80} tint="systemChromeMaterialDark" style={styles.blurView}>
          <View style={styles.tabBar}>
            {/* Left side tabs */}
            {beforeTabs.map(renderTab).filter(Boolean)}

            {/* Center button */}
            <View style={styles.centerButtonContainer}>
              <ImagePickerButton buttonType="icon" />
            </View>

            {/* Right side tabs */}
            {afterTabs.map(renderTab).filter(Boolean)}
          </View>
        </BlurView>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    zIndex: 999,
  },
  tabBarContainer: {
    width: TAB_BAR_WIDTH,
    borderRadius: 30, // Rounded corners
    overflow: 'hidden',
    elevation: 10, // Android shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  blurView: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 30,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButtonContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default CustomTabBar
