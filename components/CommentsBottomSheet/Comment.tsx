import { Ionicons } from '@expo/vector-icons'
import { Alert, TouchableOpacity, View } from 'react-native'
import { Image } from 'expo-image'
import { useState } from 'react'
import { router } from 'expo-router'

import { Colors } from '@/constants/colors'
import { getRelativeTimeFromNow } from '@/libs/date'
import Text from '@/components/ui/Text'
import { supabase } from '@/libs/supabase'
import amplitude from '@/libs/amplitude'

type Props = {
  id: number
  currentUserId: string | undefined
  content: string
  createdAt: string
  author: {
    id: string
    name: string
    username: string
    avatarUrl: string
  }
  likes: Array<{
    id: number
    liker_id: string
  }>
}

const Comment = ({ id, currentUserId, content, createdAt, author, likes }: Props) => {
  const [isLiked, setIsLiked] = useState(likes.some((like) => like.liker_id === currentUserId))
  const [likesCount, setLikesCount] = useState(likes.length)

  const incrementLikesCount = () => setLikesCount((prev) => prev + 1)
  const decrementLikesCount = () => setLikesCount((prev) => prev - 1)

  const handleHeartToggle = async () => {
    setIsLiked((prev) => !prev)

    if (isLiked) {
      decrementLikesCount()

      amplitude.track('Engage', {
        'Engagement Type': 'Unlike',
        'Content Type': 'Comment',
      })

      const { error } = await supabase.rpc('unlike_comment', {
        arg_comment_id: id,
      })

      if (error) {
        Alert.alert('Error unliking comment', error.message)

        incrementLikesCount()
      }

      return
    }

    incrementLikesCount()

    amplitude.track('Engage', {
      'Engagement Type': 'Like',
      'Content Type': 'Comment',
    })

    const { error } = await supabase.rpc('like_comment', {
      arg_comment_id: id,
    })

    if (error) {
      Alert.alert('Error liking comment', error.message)

      decrementLikesCount()
    }
  }

  const handleLongPress = () => {
    if (likesCount === 0) return

    router.push(`/comments/${id}/likes`)
  }

  return (
    <View key={id} className="flex-row items-start gap-2">
      <Image
        source={{ uri: author.avatarUrl }}
        style={{ width: 36, height: 36, borderRadius: 36, marginTop: 6 }}
        contentFit="cover"
      />
      <View className="flex-1 gap-1">
        <View className="flex-row items-center flex-wrap gap-1">
          <Text type="subhead">{author.name ?? author.username}</Text>
          <Text type="subhead" style={{ color: Colors.muted }}>
            {getRelativeTimeFromNow(createdAt)}
          </Text>
        </View>
        <Text type="body">{content}</Text>
      </View>
      <TouchableOpacity
        className="flex-col items-center gap-1"
        onPress={handleHeartToggle}
        onLongPress={handleLongPress}>
        <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={20} color={Colors.text} />
        {likesCount > 0 && (
          <Text type="footnote" style={{ color: Colors.muted }}>
            {likesCount}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

export default Comment
