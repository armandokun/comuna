import { View, Alert, Keyboard, ScrollView } from 'react-native'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Image } from 'expo-image'
import { BottomSheetTextInput } from '@gorhom/bottom-sheet'

import { supabase } from '@/libs/supabase'
import mixpanel from '@/libs/mixpanel'
import Text from '@/components/ui/Text'
import BottomSheet from '@/components/ui/BottomSheet'
import { CommentWithLikes } from '@/types/posts'
import { SessionContext } from '@/containers/SessionProvider'
import { Colors } from '@/constants/colors'

import Comment from './Comment'
import Spacer from '../ui/Spacer'

type Props = {
  show: boolean
  postId: number | null
  communityId: number | null
  onClose: () => void
}

const CommentsBottomSheet = ({ show, postId, communityId, onClose }: Props) => {
  const [comments, setComments] = useState<Array<CommentWithLikes>>([])
  const [shouldShow, setShouldShow] = useState(false)

  const { profile } = useContext(SessionContext)
  const bottomSheetScrollViewRef = useRef<ScrollView>(null)

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      bottomSheetScrollViewRef.current?.scrollToEnd({ animated: true })
    })

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      bottomSheetScrollViewRef.current?.scrollToEnd({ animated: true })
    })

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

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
          username,
          avatar_url
        ),
        likes:comments_likes(
          id,
          liker_id
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
          username: comment.author.username ?? '',
          avatarUrl: comment.author.avatar_url ?? '',
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

  const handleSubmitComment = async (content: string) => {
    if (!postId) return
    if (!content.trim()) return

    mixpanel.track('Engage', {
      'Content Type': 'Comment',
      'Engagement Type': 'Add Comment',
      'Post Id': postId.toString(),
    })

    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      content,
      community_id: communityId,
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
      snapPoints={['50%', '90%']}
      enableDynamicSizing={false}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      scrollViewRef={bottomSheetScrollViewRef}
      footer={
        <View className="flex-row items-center gap-2 mt-4 justify-between">
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
              onEndEditing={(event) => handleSubmitComment(event.nativeEvent.text)}
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
              <Comment
                key={comment.id}
                id={comment.id}
                content={comment.content}
                createdAt={comment.created_at}
                currentUserId={profile?.id}
                author={comment.author}
                likes={comment.likes}
              />
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
