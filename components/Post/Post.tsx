import { Alert, Dimensions, Platform, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Image } from 'expo-image'
import Animated from 'react-native-reanimated'
import { SnapbackZoom } from 'react-native-zoom-toolkit'
import { Ionicons } from '@expo/vector-icons'

import { router } from 'expo-router'

import Text from '@/components/ui/Text'
import { Post as PostType } from '@/types/posts'
import { Colors } from '@/constants/colors'
import { HOME } from '@/constants/routes'
import { SessionContext } from '@/containers/SessionProvider'
import { supabase } from '@/libs/supabase'

import GradientBlur from '../GradientBlur'
import VideoPost from './Video'
import ContextMenu from '../ui/ContextMenu'

type Props = {
  item: PostType
  onPress: () => void
  isVisible: boolean
}

const Post = ({ item, onPress, isVisible }: Props) => {
  const [descriptionHeight, setDescriptionHeight] = useState(0)
  const [commentContainerHeight, setCommentContainerHeight] = useState(0)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })

  const { profile } = useContext(SessionContext)

  const descriptionRef = useRef<View>(null)
  const commentContainerRef = useRef<View>(null)
  const imageContainerRef = useRef<View>(null)

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

  useEffect(() => {
    if (!imageContainerRef.current) return

    imageContainerRef.current.measure((x, y, width, height, pageX, pageY) => {
      setImageDimensions({ width, height: IMAGE_SIZE })
    })
  }, [IMAGE_SIZE])

  const deletePost = async () => {
    const { error } = await supabase.from('posts').delete().eq('id', item.id)

    if (error) Alert.alert('Error deleting post', error.message)

    router.replace(HOME)
  }

  const reportPost = async () => {
    const { error } = await supabase.from('feedback').insert({
      post_id: item.id,
      user_id: profile?.id,
      type: 'report',
      feedback: 'Reported content violates our guidelines.',
    })

    if (error) Alert.alert('Error reporting post', error.message)

    Alert.alert(
      'Post reported',
      'Thank you for reporting this post. We will review it and remove it if it violates our guidelines.',
    )
  }

  const blockMember = async () => {
    const { error } = await supabase.from('member_blocks').insert({
      user_id: profile?.id,
      blocked_user_id: item.author.id,
      community_id: item.community_id,
    })

    if (error) Alert.alert('Error blocking member', error.message)

    Alert.alert('Member blocked', 'You will no longer be able to see posts from this member.')
  }

  const handleContextMenuPress = (actionId: string) => {
    switch (actionId) {
      case `delete-${item.id}`:
        Alert.alert('Delete post', 'Are you sure you want to delete this post?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: deletePost },
        ])

        break
      case `report-${item.id}`:
        Alert.alert(
          'Report post?',
          'Reported content will be reviewed and removed from the community if they violate our guidelines.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Report', style: 'destructive', onPress: reportPost },
          ],
        )

        break
      case `block-${item.id}`:
        Alert.alert('Block member?', 'You will no longer be able to see posts from this member.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Block', style: 'destructive', onPress: blockMember },
        ])

        break
    }
  }

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
        <View className="relative flex-1" ref={imageContainerRef}>
          <GradientBlur height={descriptionHeight + DEFAULT_HEIGHT}>
            {item.image_url && (
              <SnapbackZoom>
                <Image
                  source={`${item.image_url}?quality=50`}
                  placeholder={{ blurhash: item.image_blurhash }}
                  contentFit="cover"
                  style={{
                    width: imageDimensions.width || '100%',
                    height: imageDimensions.height || '100%',
                  }}
                />
              </SnapbackZoom>
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
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center gap-2">
                  <Image
                    source={{ uri: `${item.author.avatar_url}?width=32&height=32` }}
                    contentFit="cover"
                    style={{ width: 32, height: 32, borderRadius: 32 }}
                  />
                  <Text type="subhead" style={{ color: 'white' }}>
                    {item.author.username || item.author.name}
                  </Text>
                </View>
                <TouchableOpacity className="p-1 rounded-full">
                  <ContextMenu
                    itemId={item.id}
                    onPress={handleContextMenuPress}
                    shouldOpenOnLongPress={false}
                    actions={[
                      ...(item.author.id === profile?.id
                        ? [
                            {
                              id: `delete-${item.id}`,
                              title: 'Delete',
                              image: Platform.select({
                                ios: 'trash',
                                android: 'ic_menu_delete',
                              }),
                              imageColor: Colors.systemDestructive,
                              attributes: {
                                destructive: true,
                              },
                            },
                          ]
                        : [
                            {
                              id: `report-${item.id}`,
                              title: 'Report',
                              image: Platform.select({
                                ios: 'flag',
                                android: 'ic_menu_report_image',
                              }),
                              imageColor: Colors.systemDestructive,
                              attributes: {
                                destructive: true,
                              },
                            },
                            {
                              id: `block-${item.id}`,
                              title: 'Block member',
                              image: Platform.select({
                                ios: 'person.slash',
                                android: 'ic_menu_block',
                              }),
                              imageColor: Colors.systemDestructive,
                              attributes: {
                                destructive: true,
                              },
                            },
                          ]),
                    ]}>
                    <View className="p-1 rounded-full">
                      <Ionicons name="ellipsis-horizontal" size={24} color="white" />
                    </View>
                  </ContextMenu>
                </TouchableOpacity>
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
