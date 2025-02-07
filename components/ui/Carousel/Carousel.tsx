import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { Dimensions, View, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  runOnJS,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { faker } from '@faker-js/faker'

import { BlurView } from 'expo-blur'

import Slide from './Slide'
import Button from '../Button'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

type Props = {
  slides: Array<{
    title: string
    subtitle?: string
    mediaPosition?: 'top' | 'bottom'
    media?: ReactNode
    actionLabel?: string
    onActionPress?: () => void
    actionDisabled?: boolean
  }>
  onSlideChange?: (index: number) => void
  onSkip?: () => void
}

const Carousel = ({ slides, onSlideChange, onSkip }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [backgroundImage] = useState(
    faker.image.urlPicsumPhotos({
      width: 300,
      height: 300 * 1.4,
      blur: 0,
    }),
  )

  const scrollX = useSharedValue(0)
  const scrollViewRef = useRef<Animated.ScrollView>(null)

  useEffect(() => {
    if (!onSlideChange) return

    onSlideChange(activeIndex)
  }, [activeIndex, onSlideChange])

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x
    },

    onMomentumEnd: (event) => {
      runOnJS(setActiveIndex)(Math.floor(event.contentOffset.x / SCREEN_WIDTH))
    },
  })

  const handleContinue = () => {
    if (!scrollViewRef.current) return

    if (slides[activeIndex].onActionPress) {
      slides[activeIndex].onActionPress()
    }

    scrollViewRef.current.scrollTo({ x: scrollX.value + SCREEN_WIDTH, animated: true })
  }

  return (
    <>
      <Animated.Image
        key={faker.string.uuid()}
        source={{
          uri: backgroundImage,
        }}
        style={StyleSheet.absoluteFill}
      />
      <BlurView intensity={80} tint="systemChromeMaterialDark" style={StyleSheet.absoluteFill} />
      <SafeAreaView className="flex-1">
        <Animated.View className="flex-1">
          <Animated.ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}>
            {slides.map((slide) => (
              <View key={slide.title} style={{ width: SCREEN_WIDTH }}>
                <Slide
                  title={slide.title}
                  subtitle={slide.subtitle}
                  media={slide.media}
                  mediaPosition={slide.mediaPosition || 'top'}
                />
              </View>
            ))}
          </Animated.ScrollView>
        </Animated.View>
        {onSkip && (
          <View className="absolute top-20 right-6">
            <Button
              title="Skip"
              onPress={onSkip}
              type="flat"
              iconName="chevron-forward"
              iconPosition="right"
            />
          </View>
        )}
        <View className="absolute bottom-20 left-0 right-0 mx-28">
          <Button
            disabled={slides[activeIndex].actionDisabled}
            size="medium"
            title={slides[activeIndex].actionLabel ?? 'Continue'}
            onPress={slides[activeIndex].onActionPress ?? handleContinue}
          />
        </View>
      </SafeAreaView>
    </>
  )
}

export default Carousel
