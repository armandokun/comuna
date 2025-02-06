import { Dimensions } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  runOnJS,
} from 'react-native-reanimated'
import { useEffect } from 'react'

import AnimatedCard from '../AnimatedCard'

type Item = {
  title: string
  description: string
  image: string
  author: {
    name: string
    avatar: string
  }
}

type Props = {
  data: Array<Item>
  headerHeight: number
  onVisibleItemChange?: (imageSrc: string) => void
}

const MediaList = ({ data, onVisibleItemChange, headerHeight }: Props) => {
  const { height } = Dimensions.get('screen')

  const SPACING = 8
  const ITEM_SIZE = height * 0.62
  const ITEM_FULL_SIZE = ITEM_SIZE + SPACING * 2

  const scrollY = useSharedValue(0)
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y / ITEM_FULL_SIZE

    if (!onVisibleItemChange) return

    const currentIndex = Math.round(scrollY.value)
    if (currentIndex >= 0 && currentIndex < data.length) {
      runOnJS(onVisibleItemChange)(data[currentIndex].image)
    }
  })

  useEffect(() => {
    if (!data.length) return

    if (onVisibleItemChange && data.length > 0) {
      onVisibleItemChange(data[0].image)
    }
  }, [data, onVisibleItemChange])

  return (
    <Animated.FlatList
      data={data}
      contentContainerStyle={{
        gap: SPACING * 2,
        paddingHorizontal: SPACING * 2,
        paddingBottom: SPACING * 4,
        paddingTop: headerHeight,
      }}
      onScroll={onScroll}
      scrollEventThrottle={1000 / 60} // 16.6ms
      snapToInterval={ITEM_FULL_SIZE}
      decelerationRate="fast"
      renderItem={({ item }) => <AnimatedCard item={item} />}
    />
  )
}

export default MediaList
