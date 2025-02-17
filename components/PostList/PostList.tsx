import { Dimensions, RefreshControl } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  runOnJS,
} from 'react-native-reanimated'
import React, { useEffect, useState } from 'react'

import amplitude from '@/libs/amplitude'
import { Post as PostType } from '@/types/posts'

import Post from '../Post'
import CommentsBottomSheet from '../CommentsBottomSheet'

type Props = {
  posts: Array<PostType>
  headerHeight: number
  onVisibleItemChange?: (imageBlurhash: string) => void
  isRefreshing: boolean
  handleRefresh: () => void
  onEndReached: () => void
  onEndReachedThreshold: number
}

const PostList = ({
  posts: data,
  onVisibleItemChange,
  headerHeight,
  isRefreshing,
  handleRefresh,
  onEndReached,
  onEndReachedThreshold,
}: Props) => {
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)

  const scrollY = useSharedValue(0)

  const { height } = Dimensions.get('screen')

  const SPACING = 8
  const COMMENT_CONTAINER_HEIGHT = 90
  const ITEM_SIZE = height * 0.62 + COMMENT_CONTAINER_HEIGHT
  const ITEM_FULL_SIZE = ITEM_SIZE + SPACING * 4

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y / ITEM_FULL_SIZE

    if (!onVisibleItemChange) return

    const currentIndex = Math.round(scrollY.value)
    const isValidIndex = currentIndex >= 0 && currentIndex < data.length

    if (!isValidIndex) return

    runOnJS(onVisibleItemChange)(data[currentIndex].image_blurhash)
  })

  useEffect(() => {
    if (!data.length) return

    if (!onVisibleItemChange || !data.length) return

    onVisibleItemChange(data[0].image_blurhash)

    amplitude.track('Post Viewed', {
      'Post ID': data[0].id,
    })
  }, [data, onVisibleItemChange])

  return (
    <>
      <Animated.FlatList
        data={data}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            progressViewOffset={headerHeight}
            tintColor="#FFFFFF"
            style={{ backgroundColor: 'transparent' }}
          />
        }
        contentContainerStyle={{
          gap: SPACING * 4,
          paddingHorizontal: SPACING * 2,
          paddingBottom: SPACING * 4,
          marginTop: headerHeight,
        }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        snapToInterval={ITEM_FULL_SIZE}
        decelerationRate="fast"
        renderItem={({ item }) => <Post item={item} onPress={() => setSelectedPostId(item.id)} />}
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
