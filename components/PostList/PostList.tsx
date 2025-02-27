import { Dimensions, FlatList, FlatListProps, RefreshControl, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  runOnJS,
} from 'react-native-reanimated'
import React, { ForwardedRef, forwardRef, useEffect, useState } from 'react'

import { Post as PostType } from '@/types/posts'

import mixpanel from '@/libs/mixpanel'

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
  emptyState?: FlatListProps<PostType>['ListEmptyComponent']
}

const PostList = forwardRef(
  (
    {
      posts: data,
      onVisibleItemChange,
      headerHeight,
      isRefreshing,
      handleRefresh,
      onEndReached,
      onEndReachedThreshold,
      emptyState,
    }: Props,
    ref: ForwardedRef<FlatList>,
  ) => {
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null)
    const [visiblePostIndex, setVisiblePostIndex] = useState<number | null>(null)

    const scrollY = useSharedValue(0)

    const { height } = Dimensions.get('screen')

    const ITEM_SIZE = height - headerHeight

    useEffect(() => {
      if (!visiblePostIndex || visiblePostIndex === 0) return
      if (!data[visiblePostIndex]) return

      mixpanel.track('Engage', {
        'Content Type': 'Post',
        'Engagement Type': 'View',
        'Post Id': data[visiblePostIndex].id.toString(),
      })
    }, [data, visiblePostIndex])

    const onScroll = useAnimatedScrollHandler((e) => {
      scrollY.value = e.contentOffset.y / ITEM_SIZE

      if (!onVisibleItemChange) return

      const assumedIndex = Math.round(scrollY.value)
      const isValidIndex = assumedIndex >= 0 && assumedIndex < data.length

      if (!isValidIndex) return

      runOnJS(setVisiblePostIndex)(assumedIndex)
      runOnJS(onVisibleItemChange)(data[assumedIndex].image_blurhash || '')
    })

    return (
      <>
        <Animated.FlatList
          ref={ref}
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
          ListEmptyComponent={emptyState}
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
  },
)

PostList.displayName = 'PostList'

export default PostList
