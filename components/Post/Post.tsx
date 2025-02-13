import { Dimensions, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useRef, useState } from 'react'
import { Image } from 'expo-image'

import Animated from 'react-native-reanimated'

import Text from '@/components/ui/Text'
import { Post as PostType } from '@/types/posts'

import GradientBlur from '../GradientBlur'

type Props = {
  item: PostType
  onPress: () => void
}

const Post = ({ item, onPress }: Props) => {
  const [descriptionHeight, setDescriptionHeight] = useState(0)

  const descriptionRef = useRef<View>(null)

  useEffect(() => {
    if (!descriptionRef.current) return

    descriptionRef.current.measure((x, y, width, height, pageX, pageY) => {
      setDescriptionHeight(height)
    })
  }, [])

  const { height } = Dimensions.get('screen')

  const IMAGE_SIZE = height * 0.62
  const DEFAULT_HEIGHT = 50
  const COMMENT_CONTAINER_HEIGHT = 90
  const ITEM_FULL_SIZE = IMAGE_SIZE + COMMENT_CONTAINER_HEIGHT

  return (
    <Animated.View
      style={{
        height: ITEM_FULL_SIZE,
      }}>
      <Animated.View
        className="rounded-3xl overflow-hidden"
        style={{
          height: IMAGE_SIZE,
        }}>
        <View className="relative flex-1">
          <GradientBlur height={descriptionHeight + DEFAULT_HEIGHT}>
            <Image
              source={`${item.image_url}?quality=50`}
              placeholder={{ blurhash: item.image_blurhash }}
              contentFit="cover"
              style={{ width: '100%', height: '100%' }}
            />
          </GradientBlur>
          <View className="absolute w-full gap-4">
            <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent']} locations={[0, 1]}>
              <View className="flex-row items-center gap-2 p-4">
                <Image
                  source={{ uri: `${item.author.avatar_url}?width=32&height=32` }}
                  contentFit="cover"
                  style={{ width: 32, height: 32, borderRadius: 32 }}
                />
                <Text type="subhead" className="text-white">
                  {item.author.name}
                </Text>
              </View>
            </LinearGradient>
          </View>
          <View
            className="absolute bottom-4 w-full px-4 flex-row items-center justify-between"
            ref={descriptionRef}>
            <View className="flex-1">
              <Text type="footnote" className="text-white">
                {item.description}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
      <View className="gap-2 mt-2 px-4" style={{ height: COMMENT_CONTAINER_HEIGHT }}>
        {item.comments?.slice(0, 2).map((comment) => (
          <View key={comment.id} className="flex-row flex-wrap">
            <Text type="footnote">
              <Text type="footnote" className="font-semibold">
                {comment.author.name}
              </Text>
              <Text type="footnote"> {comment.content}</Text>
            </Text>
          </View>
        ))}
        {item.comments?.length && item.comments?.length > 2 ? (
          <TouchableOpacity onPress={onPress}>
            <Text type="footnote" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              View all {item.comments.length} comment{item.comments.length > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onPress}>
            <Text type="footnote" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Add a comment...
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  )
}

export default Post
