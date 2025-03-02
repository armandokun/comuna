import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { Dimensions, View, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  runOnJS,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'

import { BlurView } from 'expo-blur'

import Slide from './Slide'
import Button from '../Button'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

type Props = {
  slides: Array<{
    id: string
    title?: string
    subtitle?: string
    mediaPosition?: 'top' | 'bottom'
    media?: ReactNode
    actionLabel?: string
    onActionPress?: (onPress: () => void) => Promise<void> | void
    actionDisabled?: boolean
    backgroundImage: string
  }>
  onSlideChange?: (index: number) => void
  onSkip?: () => void
}

const Carousel = ({ slides, onSlideChange, onSkip }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)

  console.log({ activeIndex })

  const scrollX = useSharedValue(0)
  const scrollViewRef = useRef<Animated.ScrollView>(null)

  useEffect(() => {
    if (!onSlideChange) return

    onSlideChange(activeIndex)
  }, [activeIndex, onSlideChange])

  useEffect(() => {
    if (!slides[activeIndex].backgroundImage) return

    setBackgroundImage(slides[activeIndex].backgroundImage)
  }, [activeIndex, slides])

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x
    },

    onMomentumEnd: (event) => {
      runOnJS(setActiveIndex)(Math.floor(event.contentOffset.x / SCREEN_WIDTH))
    },
  })

  const handleContinue = async () => {
    if (!scrollViewRef.current) return
    if (slides[activeIndex].actionDisabled) return

    const scrollToNextSlide = () => {
      scrollViewRef.current?.scrollTo({ x: scrollX.value + SCREEN_WIDTH, animated: true })
    }

    if (slides[activeIndex].onActionPress) {
      if (slides[activeIndex].onActionPress instanceof Promise) {
        await slides[activeIndex].onActionPress(scrollToNextSlide)
      } else {
        slides[activeIndex].onActionPress(scrollToNextSlide)
      }

      return
    }

    scrollToNextSlide()
  }

  return (
    <>
      <Animated.View
        entering={FadeIn.duration(400)}
        exiting={FadeOut.duration(250).delay(200)}
        style={StyleSheet.absoluteFill}>
        <Image
          source={backgroundImage || require('@/assets/images/onboarding-background-1.png')}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={250}
        />
      </Animated.View>
      <BlurView intensity={80} tint="systemMaterialDark" style={StyleSheet.absoluteFill} />
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
              <View key={slide.id} style={{ width: SCREEN_WIDTH }}>
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
            onPress={handleContinue}
          />
        </View>
      </SafeAreaView>
    </>
  )
}

export default Carousel
