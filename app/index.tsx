import { Image, SafeAreaView, StyleSheet, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { BlurView } from 'expo-blur'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import mockData from '@/constants/mockData'

import Text from '@/components/ui/Text'
import MediaList from '@/components/MediaList'
import GradientBlur from '@/components/GradientBlur'

const HomeScreen = () => {
  const [backgroundImage, setBackgroundImage] = useState(mockData[0]?.image)
  const [headerHeight, setHeaderHeight] = useState(0)

  const insets = useSafeAreaInsets()
  const headerRef = useRef<View>(null)

  useEffect(() => {
    if (headerRef.current) {
      headerRef.current.measure((x, y, width, height, pageX, pageY) => {
        setHeaderHeight(height)
      })
    }
  }, [headerRef])

  return (
    <>
      <Animated.Image
        key={backgroundImage}
        source={{ uri: backgroundImage }}
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        style={StyleSheet.absoluteFill}
      />
      <BlurView
        intensity={80}
        tint="systemChromeMaterialDark"
        style={StyleSheet.absoluteFill}
        className="absolute w-full h-full"
      />
      <View className="flex-1 justify-center">
        <MediaList
          data={mockData}
          onVisibleItemChange={setBackgroundImage}
          headerHeight={insets.top + headerHeight}
        />
      </View>
      <GradientBlur position="top" height={insets.top + headerHeight + 50}>
        <SafeAreaView style={{ position: 'absolute', width: '100%', zIndex: 10 }}>
          <View ref={headerRef} className="px-4 py-4 justify-between items-center flex-row">
            <Text type="heading">Album</Text>
            <Image
              source={{ uri: mockData[0]?.author.avatar }}
              className="w-10 h-10 rounded-full"
            />
          </View>
        </SafeAreaView>
      </GradientBlur>
    </>
  )
}

export default HomeScreen
