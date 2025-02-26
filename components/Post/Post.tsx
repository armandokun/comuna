import { Dimensions, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useRef, useState } from 'react'
import { Image } from 'expo-image'
import Animated from 'react-native-reanimated'

import Text from '@/components/ui/Text'
import { Post as PostType } from '@/types/posts'
import { Colors } from '@/constants/colors'

import GradientBlur from '../GradientBlur'
import VideoPost from './Video'

type Props = {
  item: PostType
  onPress: () => void
  isVisible: boolean
}

const Post = ({ item, onPress, isVisible }: Props) => {
  const [descriptionHeight, setDescriptionHeight] = useState(0)
  const [commentContainerHeight, setCommentContainerHeight] = useState(0)

  const descriptionRef = useRef<View>(null)
  const commentContainerRef = useRef<View>(null)

  useEffect(() => {
    if (!descriptionRef.current) return

    descriptionRef.current.measure((x, y, width, height, pageX, pageY) => {
      setDescriptionHeight(height)
    })
  }, [])

  useEffect(() => {
    if (!commentContainerRef.current) return

    commentContainerRef.current.measure((x, y, width, height, pageX, pageY) => {
      setCommentContainerHeight(height)
    })
  }, [])

  const { height: screenHeight } = Dimensions.get('screen')

  const DEFAULT_HEIGHT = 50
  const SAFE_AREA_HEIGHT = 40
  const IMAGE_SIZE = screenHeight * 0.8 - commentContainerHeight - SAFE_AREA_HEIGHT

  return (
    <Animated.View
      style={{
        height: IMAGE_SIZE + DEFAULT_HEIGHT,
      }}>
      <Animated.View
        className="rounded-3xl overflow-hidden"
        style={{
          height: IMAGE_SIZE,
        }}>
        <View className="relative flex-1">
          <GradientBlur height={descriptionHeight + DEFAULT_HEIGHT}>
            {item.image_url && (
              <Image
                source={`${item.image_url}?quality=50`}
                placeholder={{ blurhash: item.image_blurhash }}
                contentFit="cover"
                style={{ width: '100%', height: '100%' }}
              />
            )}
            {item.video_url && (
              <VideoPost
                isVisible={isVisible}
                videoUrl={item.video_url!}
                videoThumbnailUrl={item.video_thumbnail_url!}
                videoThumbnailBlurhash={item.video_thumbnail_blurhash!}
              />
            )}
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
                  {item.author.username || item.author.name}
                </Text>
                {item.author.name === 'Tadas Audinis' && (
                  <View className="flex-row items-center gap-1 py-1 pl-2 pr-3 rounded-full overflow-hidden border border-black bg-white">
                    <Image
                      source={require('@/assets/images/dr-pepper-badge-icon.gif')}
                      contentFit="contain"
                      style={{ width: 24, height: 24 }}
                    />
                    <Text type="subhead" style={{ color: Colors.background }}>
                      dr. pepper
                    </Text>
                  </View>
                )}
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
      <View className="gap-2 mt-2 px-4" ref={commentContainerRef}>
        {item.comments?.slice(0, 2).map((comment) => (
          <View key={comment.id} className="flex-row flex-wrap">
            <Text type="footnote">
              <Text type="footnote" className="font-semibold">
                {comment.author.username || comment.author.name}
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
