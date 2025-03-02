import { Dimensions, StyleSheet } from 'react-native'
import Animated, { interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import { Image } from 'expo-image'

const MarqueeItem = ({
  image,
  index,
  offset,
  totalImageCount,
}: {
  image: string
  index: number
  offset: SharedValue<number>
  totalImageCount: number
}) => {
  const { width } = Dimensions.get('window')
  const itemWidth = width * 0.62
  const itemHeight = itemWidth * 1.67
  const itemSize = itemWidth + 16

  const animatedStyle = useAnimatedStyle(() => {
    const itemPosition = itemSize * index - width - itemSize / 2
    const totalSize = itemSize * totalImageCount
    const range =
      ((itemPosition - (offset.value + totalSize * 1000)) % totalSize) + width + itemSize / 2
    const inputRange = [-itemSize, (width - itemWidth) / 2, width]

    return {
      transform: [
        {
          rotate: `${interpolate(range, inputRange, [-3, 0, 3])}deg`,
        },
      ],
    }
  })

  return (
    <Animated.View
      className="justify-center items-center"
      style={[
        {
          width: itemWidth,
          height: itemHeight,
        },
        animatedStyle,
      ]}>
      <Image
        source={image}
        style={[
          StyleSheet.absoluteFillObject,
          {
            flex: 1,
            borderRadius: 16,
          },
        ]}
      />
    </Animated.View>
  )
}

export default MarqueeItem
