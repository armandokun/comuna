import { View, Alert } from 'react-native'
import { useCallback, useContext, useEffect, useState } from 'react'
import { Image } from 'expo-image'
import { BottomSheetTextInput } from '@gorhom/bottom-sheet'

import { supabase } from '@/libs/supabase'
import { getRelativeTimeFromNow } from '@/libs/date'
import Text from '@/components/ui/Text'
import BottomSheet from '@/components/ui/BottomSheet'
import { Comment } from '@/types/posts'
import { SessionContext } from '@/container/SessionProvider'
import { Colors } from '@/constants/colors'

import Spacer from '../ui/Spacer'

type Props = {
  show: boolean
  postId: number | null
  onClose: () => void
}

const CommentsBottomSheet = ({ show, postId, onClose }: Props) => {
  const [comments, setComments] = useState<Array<Comment>>([])
  const [shouldShow, setShouldShow] = useState(false)

  const { profile } = useContext(SessionContext)

  const fetchComments = useCallback(async () => {
    if (!postId) return

    const { data, error } = await supabase
      .from('comments')
      .select(
        `
        *,
        author:profiles(
          id,
          name,
          avatar_url
        )
      `,
      )
      .eq('post_id', postId)

    if (error) Alert.alert('Error fetching comments', error.message)

    if (data) {
      const formattedComments = data.map((comment) => ({
        ...comment,
        author: {
          ...comment.author,
          name: comment.author.name ?? '',
          avatar_url: comment.author.avatar_url ?? '',
        },
      }))

      setComments(formattedComments)
    }

    setShouldShow(true)
  }, [postId])

  useEffect(() => {
    if (show) {
      fetchComments()
    } else {
      setShouldShow(false)
    }
  }, [fetchComments, show])

  useEffect(() => {
    if (!postId) return

    const subscription = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        () => fetchComments(),
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchComments, postId])

  const handleSubmitComment = async (content: string) => {
    if (!postId) return
    if (!content.trim()) return

    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      content,
    })

    if (error) {
      Alert.alert('Error uploading comment', error.message)

      return
    }

    fetchComments()
  }

  if (!shouldShow) return null

  return (
    <BottomSheet
      show={shouldShow}
      onBackdropPress={onClose}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      footer={
        <View className="flex-row items-center gap-2 justify-between mt-4">
          <Image
            source={profile?.avatar_url}
            style={{ width: 44, height: 44, borderRadius: 36 }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          <View className="flex-1">
            <BottomSheetTextInput
              className="rounded-3xl border border-white/20 p-4 text-text"
              placeholder="Write a comment..."
              placeholderTextColor={Colors.muted}
              keyboardAppearance="dark"
              returnKeyType="send"
              onSubmitEditing={(event) => handleSubmitComment(event.nativeEvent.text)}
            />
          </View>
        </View>
      }>
      <View className="flex-1 px-4 items-center justify-center">
        <Text type="title3" className="text-white mb-4">
          Comments
        </Text>
        <Spacer />
        {comments.length ? (
          <View className="gap-4 w-full pb-20">
            {comments.map((comment) => (
              <View key={comment.id} className="flex-row items-center gap-2">
                <Image
                  source={{ uri: comment.author.avatar_url }}
                  style={{ width: 32, height: 32, borderRadius: 36 }}
                  contentFit="cover"
                />
                <View className="flex-1 gap-1">
                  <View className="flex-row items-center gap-2">
                    <Text type="subhead">{comment.author.name}</Text>
                    <Text type="subhead" style={{ color: Colors.muted }}>
                      {getRelativeTimeFromNow(comment.created_at)}
                    </Text>
                  </View>
                  <Text type="body">{comment.content}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="items-center justify-center h-48">
            <Text type="title2">No comments yet</Text>
            <Spacer />
            <Text type="subhead" style={{ color: Colors.muted }}>
              Start the conversation.
            </Text>
          </View>
        )}
      </View>
    </BottomSheet>
  )
}

export default CommentsBottomSheet
