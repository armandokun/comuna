import { View, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import Animated, { FadeIn } from 'react-native-reanimated'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'

import { Colors } from '@/constants/colors'
import ImagePickerButton from '@/components/ImagePickerButton'

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets()

  const getTabIcon = (routeName: string) => {
    switch (routeName) {
      case 'home':
        return 'home'
      case 'profile':
        return 'person'
      default:
        return 'home'
    }
  }

  const beforeTabs = state.routes.slice(0, Math.floor(state.routes.length / 2))
  const afterTabs = state.routes.slice(Math.floor(state.routes.length / 2))

  const renderTab = (route: any, index: number) => {
    const { options } = descriptors[route.key]
    const isFocused = state.index === index

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      })

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name)
      } else if (isFocused) {
        navigation.emit({
          type: 'tabRePress',
          target: route.key,
          data: { routeName: route.name },
        })
      }
    }

    return (
      <TouchableOpacity
        key={route.key}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        onPress={onPress}
        className="items-center p-2">
        <View className={`p-2 rounded-[20px] ${isFocused ? 'bg-white/15' : ''}`}>
          <Ionicons
            name={getTabIcon(route.name)}
            size={24}
            color={isFocused ? Colors.text : 'rgba(255, 255, 255, 0.5)'}
          />
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View
      className="absolute bottom-0 w-full items-center z-50"
      style={{ paddingBottom: insets.bottom }}>
      <Animated.View
        entering={FadeIn.duration(500)}
        className="rounded-[30px] overflow-hidden shadow-lg"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 10,
        }}>
        <BlurView
          intensity={80}
          tint="systemChromeMaterialDark"
          className="rounded-full overflow-hidden border border-white/10">
          <View className="flex-row rounded-full items-center">
            {beforeTabs.map((route, index) => renderTab(route, index))}
            <View className="w-[80px] items-center">
              <ImagePickerButton buttonType="icon" />
            </View>
            {afterTabs.map((route, index) => renderTab(route, index + beforeTabs.length))}
          </View>
        </BlurView>
      </Animated.View>
    </View>
  )
}

export default CustomTabBar
