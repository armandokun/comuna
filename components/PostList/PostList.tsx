import { Dimensions, RefreshControl } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  runOnJS,
} from 'react-native-reanimated'
import { useEffect } from 'react'

import { Post } from '@/constants/mockData'

import AnimatedCard from '../AnimatedCard'

type Props = {
  data: Array<Post>
  headerHeight: number
  onVisibleItemChange?: (imageSrc: string) => void
  isRefreshing: boolean
  handleRefresh: () => void
}

const PostList = ({
  data,
  onVisibleItemChange,
  headerHeight,
  isRefreshing,
  handleRefresh,
}: Props) => {
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
      runOnJS(onVisibleItemChange)(data[currentIndex].image_url)
    }
  })

  useEffect(() => {
    if (!data.length) return

    if (onVisibleItemChange && data.length > 0) {
      onVisibleItemChange(data[0].image_url)
    }
  }, [data, onVisibleItemChange])

  return (
    <Animated.FlatList
      data={data}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          progressViewOffset={headerHeight}
        />
      }
      contentContainerStyle={{
        gap: SPACING * 2,
        paddingHorizontal: SPACING * 2,
        paddingBottom: SPACING * 4,
        marginTop: headerHeight,
      }}
      onScroll={onScroll}
      scrollEventThrottle={16}
      snapToInterval={ITEM_FULL_SIZE}
      decelerationRate="fast"
      renderItem={({ item }) => <AnimatedCard item={item} />}
    />
  )
}

export default PostList
