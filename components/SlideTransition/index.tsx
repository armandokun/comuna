import React, { ReactNode } from 'react'
import { View, StyleProp, ViewStyle, ViewProps } from 'react-native'
import Animated, { AnimatedProps } from 'react-native-reanimated'

interface SlideTransitionProps {
  mainContent: ReactNode
  slideInContent: ReactNode
  showSlideContent: boolean
  mainContentStyle: StyleProp<ViewStyle>
  slideInContentStyle: StyleProp<ViewStyle>
}

const animatedProps: AnimatedProps<ViewProps> = {
  shouldRasterizeIOS: true,
  renderToHardwareTextureAndroid: true,
}

const SlideTransition = ({
  mainContent,
  slideInContent,
  showSlideContent,
  mainContentStyle,
  slideInContentStyle,
}: SlideTransitionProps) => (
  <View className="flex-1">
    <Animated.View style={mainContentStyle} className="flex-1" {...animatedProps}>
      {mainContent}
    </Animated.View>

    {showSlideContent && (
      <Animated.View style={slideInContentStyle} {...animatedProps}>
        {slideInContent}
      </Animated.View>
    )}
  </View>
)

export default SlideTransition
