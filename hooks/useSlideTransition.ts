import { useState } from 'react'
import { Dimensions } from 'react-native'
import { useAnimatedStyle, withTiming, useSharedValue, Easing } from 'react-native-reanimated'

const SCREEN_TRANSITION_DURATION = 250

const useSlideTransition = () => {
  const [showContent, setShowContent] = useState(false)
  const slideAnim = useSharedValue(0)

  const { width: screenWidth } = Dimensions.get('window')

  const mainContentStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(slideAnim.value ? -screenWidth : 0, {
          duration: SCREEN_TRANSITION_DURATION,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
      },
    ],
  }))

  const slideInContentStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(slideAnim.value ? 0 : screenWidth, {
          duration: SCREEN_TRANSITION_DURATION,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
      },
    ],
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }))

  const showSlideContent = () => {
    setShowContent(true)

    slideAnim.value = 1
  }

  const hideSlideContent = () => {
    slideAnim.value = 0

    setTimeout(() => setShowContent(false), SCREEN_TRANSITION_DURATION)
  }

  return {
    showContent,
    mainContentStyle,
    slideInContentStyle,
    showSlideContent,
    hideSlideContent,
  }
}

export default useSlideTransition
