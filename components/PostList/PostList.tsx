import { Dimensions, RefreshControl } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  runOnJS,
} from 'react-native-reanimated'
import React, { useEffect, useState } from 'react'

import PostType from '@/types/post'

import Post from '../Post'
import CommentsBottomSheet from '../CommentsBottomSheet'

type Props = {
  data: Array<PostType>
  headerHeight: number
  onVisibleItemChange?: (imageBlurhash: string) => void
  isRefreshing: boolean
  handleRefresh: () => void
  onEndReached: () => void
  onEndReachedThreshold: number
}

const PostList = ({
  data,
  onVisibleItemChange,
  headerHeight,
  isRefreshing,
  handleRefresh,
  onEndReached,
  onEndReachedThreshold,
}: Props) => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

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
      runOnJS(onVisibleItemChange)(data[currentIndex].image_blurhash)
    }
  })

  useEffect(() => {
    if (!data.length) return

    if (onVisibleItemChange && data.length > 0) {
      onVisibleItemChange(data[0].image_blurhash)
    }
  }, [data, onVisibleItemChange])

  return (
    <>
      <Animated.FlatList
        data={data}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            progressViewOffset={250}
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
        renderItem={({ item }) => (
          <Post item={item} onPress={() => setSelectedPostId(item.id.toString())} />
        )}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
      />
      <CommentsBottomSheet
        show={!!selectedPostId}
        postId={selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />
    </>
  )
}

export default PostList
