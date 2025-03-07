/* eslint-disable no-plusplus */
/* eslint-disable react/no-array-index-key */
import { View, Animated } from 'react-native'
import { Image } from 'expo-image'
import { useRef, useState, useEffect, useMemo } from 'react'

import { PLACEHOLDER_AVATAR_URL } from '@/constants/url'

type Props = {
  memberAvatarUrls: Array<string | null>
}

const TOTAL_CIRCLES = 25
const BORDER_COLOR = 'rgba(255,255,255,0.5)'
const BORDER_COLOR_EMPTY = 'rgba(255,255,255,0.1)'
const EMPTY_CIRCLE_BACKGROUND_COLOR = 'rgba(255,255,255,0.2)'
const FILLED_CIRCLE_BACKGROUND_COLOR = 'rgba(255, 255, 255, 0)'

const INITIAL_OPACITY = 0.3
const FILLED_OPACITY = 1
const EMPTY_OPACITY = 0.7

const CENTER_CIRCLE = {
  size: 60,
  borderRadius: 30,
  borderWidth: 2,
  emptyBorderWidth: 1.5,
}
const INNER_CIRCLE = {
  size: 42,
  borderRadius: 21,
  borderWidth: 1.5,
}
const OUTER_CIRCLE = {
  size: 28,
  borderRadius: 14,
  borderWidth: 1.5,
}
const CORNER_CIRCLE = {
  size: 18,
  borderRadius: 9,
  borderWidth: 1,
}

const AnimatedMemberCircle = ({ memberAvatarUrls }: Props) => {
  const [isAnimationReady, setIsAnimationReady] = useState(false)
  const [isAnimationStarted, setIsAnimationStarted] = useState(false)

  const isMountedRef = useRef(true)
  const animatedValues = useRef(
    Array(TOTAL_CIRCLES)
      .fill(0)
      .map(() => new Animated.Value(0)),
  ).current

  const shuffledAvatarUrls = useMemo(() => {
    const validUrls = memberAvatarUrls.filter(Boolean)

    const shuffled = [...validUrls]

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    const result = Array(TOTAL_CIRCLES).fill(null)

    const positionOrder = [
      0, // Center
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8, // Inner ring
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20, // Outer ring
      21,
      22,
      23,
      24, // Corners
    ]

    for (let i = 0; i < Math.min(shuffled.length, TOTAL_CIRCLES); i++) {
      result[positionOrder[i]] = shuffled[i]
    }

    return result
  }, [memberAvatarUrls])

  // Preload images with ref for mount tracking
  useEffect(() => {
    const preloadImages = async () => {
      if (isMountedRef.current) {
        setIsAnimationReady(false)
        setIsAnimationStarted(false)
      }

      const validUrls = shuffledAvatarUrls.filter(Boolean) as Array<string>

      if (validUrls.length === 0) {
        if (isMountedRef.current) setIsAnimationReady(true)
        return
      }

      try {
        const prefetchPromises = validUrls.map((url) => Image.prefetch(url))

        await Promise.all(prefetchPromises)

        if (isMountedRef.current) setIsAnimationReady(true)
      } catch (error) {
        console.warn('Failed to preload some images', error)

        if (isMountedRef.current) setIsAnimationReady(true)
      }
    }

    preloadImages()

    return () => {
      isMountedRef.current = false
    }
  }, [shuffledAvatarUrls])

  useEffect(() => {
    if (isAnimationReady && !isAnimationStarted) {
      setIsAnimationStarted(true)

      animatedValues.forEach((value) => value.setValue(0))

      const animations = animatedValues.map((value, index) => {
        let delay = 0

        if (index === 0) {
          delay = 0
        } else if (index < 9) {
          delay = 100 + (index - 1) * 30
        } else if (index < 21) {
          delay = 350 + (index - 9) * 20
        } else {
          delay = 600 + (index - 21) * 20
        }

        return Animated.spring(value, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
          delay,
        })
      })

      Animated.stagger(10, animations).start()
    }
  }, [isAnimationReady, isAnimationStarted, animatedValues])

  // Add this to ensure initial rendering is correct
  useEffect(() => {
    // Force a re-render after component mounts to ensure styles are applied correctly
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        // This will trigger a re-render
        setIsAnimationReady((prevState) => prevState)
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  if (!isAnimationReady) {
    return (
      <View
        style={{
          width: 240,
          height: 240,
          justifyContent: 'center',
          alignItems: 'center',
          // Add this to make the container visible during loading
          backgroundColor: 'transparent',
        }}
      />
    )
  }

  return (
    <View
      style={{
        width: 240,
        height: 240,
        justifyContent: 'center',
        alignItems: 'center',
        // Add this to ensure consistent rendering
        backgroundColor: 'transparent',
      }}>
      {/* Center circle */}
      {shuffledAvatarUrls[0] ? (
        <Animated.View
          style={{
            position: 'absolute',
            width: CENTER_CIRCLE.size,
            height: CENTER_CIRCLE.size,
            borderRadius: CENTER_CIRCLE.borderRadius,
            borderWidth: CENTER_CIRCLE.borderWidth,
            borderColor: BORDER_COLOR,
            backgroundColor: FILLED_CIRCLE_BACKGROUND_COLOR,
            zIndex: 10,
            transform: [{ scale: animatedValues[0] }, { translateX: 0 }, { translateY: 0 }],
            opacity: animatedValues[0].interpolate({
              inputRange: [0, 1],
              outputRange: [INITIAL_OPACITY, FILLED_OPACITY],
            }),
          }}>
          <Image
            source={{ uri: shuffledAvatarUrls[0] || PLACEHOLDER_AVATAR_URL }}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: CENTER_CIRCLE.borderRadius,
            }}
          />
        </Animated.View>
      ) : (
        <Animated.View
          style={{
            position: 'absolute',
            width: CENTER_CIRCLE.size,
            height: CENTER_CIRCLE.size,
            borderRadius: CENTER_CIRCLE.borderRadius,
            borderWidth: CENTER_CIRCLE.emptyBorderWidth,
            borderColor: BORDER_COLOR_EMPTY,
            backgroundColor: EMPTY_CIRCLE_BACKGROUND_COLOR,
            zIndex: 10,
            transform: [{ scale: animatedValues[0] }, { translateX: 0 }, { translateY: 0 }],
            opacity: animatedValues[0].interpolate({
              inputRange: [0, 1],
              outputRange: [INITIAL_OPACITY, EMPTY_OPACITY],
            }),
          }}
        />
      )}

      {/* Inner ring */}
      {Array.from({ length: 8 }).map((_, index) => {
        const realIndex = index + 1
        const angle = (index * Math.PI) / 4 + Math.PI / 8
        const radius = 65
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        const avatarUrl = shuffledAvatarUrls[realIndex]
        const bgColor = avatarUrl ? FILLED_CIRCLE_BACKGROUND_COLOR : EMPTY_CIRCLE_BACKGROUND_COLOR

        return (
          <Animated.View
            key={`inner-${index}`}
            style={{
              position: 'absolute',
              width: INNER_CIRCLE.size,
              height: INNER_CIRCLE.size,
              borderRadius: INNER_CIRCLE.borderRadius,
              borderWidth: INNER_CIRCLE.borderWidth,
              borderColor: avatarUrl ? BORDER_COLOR : BORDER_COLOR_EMPTY,
              borderStyle: 'solid',
              backgroundColor: bgColor,
              zIndex: 5,
              transform: [
                { scale: animatedValues[realIndex] },
                { translateX: x },
                { translateY: y },
              ],
              opacity: animatedValues[realIndex].interpolate({
                inputRange: [0, 1],
                outputRange: [INITIAL_OPACITY, avatarUrl ? FILLED_OPACITY : EMPTY_OPACITY],
              }),
            }}>
            {avatarUrl && (
              <Image
                source={{ uri: avatarUrl || PLACEHOLDER_AVATAR_URL }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: INNER_CIRCLE.borderRadius,
                }}
              />
            )}
          </Animated.View>
        )
      })}

      {/* Outer ring */}
      {Array.from({ length: 12 }).map((_, index) => {
        const realIndex = index + 9
        const angle = (index * Math.PI) / 6
        const radius = 105
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        const avatarUrl = shuffledAvatarUrls[realIndex]
        const bgColor = avatarUrl ? FILLED_CIRCLE_BACKGROUND_COLOR : EMPTY_CIRCLE_BACKGROUND_COLOR

        return (
          <Animated.View
            key={`outer-${index}`}
            style={{
              position: 'absolute',
              width: OUTER_CIRCLE.size,
              height: OUTER_CIRCLE.size,
              borderRadius: OUTER_CIRCLE.borderRadius,
              borderWidth: OUTER_CIRCLE.borderWidth,
              borderColor: avatarUrl ? BORDER_COLOR : BORDER_COLOR_EMPTY,
              borderStyle: 'solid',
              backgroundColor: bgColor,
              zIndex: 3,
              transform: [
                { scale: animatedValues[realIndex] },
                { translateX: x },
                { translateY: y },
              ],
              opacity: animatedValues[realIndex].interpolate({
                inputRange: [0, 1],
                outputRange: [INITIAL_OPACITY, avatarUrl ? FILLED_OPACITY : EMPTY_OPACITY],
              }),
            }}>
            {avatarUrl && (
              <Image
                source={{ uri: avatarUrl || PLACEHOLDER_AVATAR_URL }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: OUTER_CIRCLE.borderRadius,
                }}
              />
            )}
          </Animated.View>
        )
      })}

      {/* Corner circles */}
      {Array.from({ length: 4 }).map((_, index) => {
        const realIndex = index + 21
        const angles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4]
        const radius = 110
        const x = Math.cos(angles[index]) * radius
        const y = Math.sin(angles[index]) * radius
        const avatarUrl = shuffledAvatarUrls[realIndex]
        const bgColor = avatarUrl ? FILLED_CIRCLE_BACKGROUND_COLOR : EMPTY_CIRCLE_BACKGROUND_COLOR

        return (
          <Animated.View
            key={`corner-${index}`}
            style={{
              position: 'absolute',
              width: CORNER_CIRCLE.size,
              height: CORNER_CIRCLE.size,
              borderRadius: CORNER_CIRCLE.borderRadius,
              borderWidth: CORNER_CIRCLE.borderWidth,
              borderColor: avatarUrl ? BORDER_COLOR : BORDER_COLOR_EMPTY,
              borderStyle: 'solid',
              backgroundColor: bgColor,
              zIndex: 2,
              transform: [
                { scale: animatedValues[realIndex] },
                { translateX: x },
                { translateY: y },
              ],
              opacity: animatedValues[realIndex].interpolate({
                inputRange: [0, 1],
                outputRange: [INITIAL_OPACITY, avatarUrl ? FILLED_OPACITY : EMPTY_OPACITY],
              }),
            }}>
            {avatarUrl && (
              <Image
                source={{ uri: avatarUrl || PLACEHOLDER_AVATAR_URL }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: CORNER_CIRCLE.borderRadius,
                }}
              />
            )}
          </Animated.View>
        )
      })}
    </View>
  )
}

export default AnimatedMemberCircle
