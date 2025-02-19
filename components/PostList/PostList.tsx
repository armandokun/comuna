import { Dimensions, RefreshControl, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  runOnJS,
} from 'react-native-reanimated'
import React, { useState } from 'react'

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
  const [visiblePostIndex, setVisiblePostIndex] = useState<number | null>(null)

  const scrollY = useSharedValue(0)

  const { height } = Dimensions.get('screen')

  const ITEM_SIZE = height - headerHeight

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y / ITEM_SIZE

    if (!onVisibleItemChange) return

    const assumedIndex = Math.round(scrollY.value)
    const isValidIndex = assumedIndex >= 0 && assumedIndex < data.length

    if (!isValidIndex) return

    runOnJS(setVisiblePostIndex)(assumedIndex)
    runOnJS(onVisibleItemChange)(data[assumedIndex].image_blurhash || '')
    runOnJS(amplitude.track)('Post Viewed', {
      'Post ID': data[assumedIndex].id,
    })
  })

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
          paddingTop: headerHeight,
          paddingHorizontal: 16,
        }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        pagingEnabled
        snapToInterval={ITEM_SIZE}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: ITEM_SIZE,
          offset: ITEM_SIZE * index,
          index,
        })}
        renderItem={({ item, index }) => (
          <View style={{ height: ITEM_SIZE }}>
            <Post
              item={item}
              onPress={() => setSelectedPostId(item.id)}
              isVisible={visiblePostIndex === index}
            />
          </View>
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
