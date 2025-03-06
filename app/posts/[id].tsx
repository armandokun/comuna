/* eslint-disable react/no-unstable-nested-components */
import {
  Alert,
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Dimensions,
  Keyboard,
  Animated,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native'
import { Link, router, SplashScreen, useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Image } from 'expo-image'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

import { supabase } from '@/libs/supabase'
import { Post, CommentWithLikes } from '@/types/posts'
import Text from '@/components/ui/Text'
import GradientBlur from '@/components/GradientBlur'
import { Colors } from '@/constants/colors'
import { PLACEHOLDER_AVATAR_URL } from '@/constants/url'
import Spacer from '@/components/ui/Spacer'
import { SessionContext } from '@/containers/SessionProvider'
import Comment from '@/components/CommentsBottomSheet/Comment'
import Button from '@/components/ui/Button'

type PostWithoutComments = Omit<Post, 'comments'>

const MIN_DESCRIPTION_HEIGHT = 50

const PostScreen = () => {
  const [post, setPost] = useState<PostWithoutComments | null>(null)
  const [comments, setComments] = useState<Array<CommentWithLikes>>([])
  const [descriptionHeight, setDescriptionHeight] = useState(0)

  const { id } = useLocalSearchParams<{ id: string }>()

  const descriptionRef = useRef<View>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const commentInputRef = useRef<TextInput>(null)

  const { profile } = useContext(SessionContext)
  const navigation = useNavigation()

  useEffect(() => {
    navigation.setOptions({
      headerBackTitle: 'Back',
      headerRight: () =>
        navigation.canGoBack() ? null : (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close-circle" size={36} color={Colors.text} />
          </TouchableOpacity>
        ),
    })
  }, [navigation])

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    })

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    })

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  useLayoutEffect(() => {
    if (!post?.description) return
    if (!descriptionRef.current) return

    descriptionRef.current.measure((x, y, width, height, pageX, pageY) => {
      setDescriptionHeight(height + MIN_DESCRIPTION_HEIGHT)
    })
  }, [post?.description])

  const closeSplashScreen = async () => {
    await SplashScreen.hideAsync()
  }

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(
          `
            *,
            author: profiles (
              id,
              name,
              username,
              avatar_url
            )
          `,
        )
        .eq('id', Number(id))
        .single()

      if (error) {
        Alert.alert('Error fetching post', error.message)

        return
      }

      if (!data) {
        Alert.alert('Post not found')

        if (navigation.canGoBack()) {
          navigation.goBack()
        } else {
          router.replace('/')
        }

        return
      }

      setPost({
        ...data,
        author: {
          id: data.author?.id ?? '',
          name: data.author?.name ?? '',
          username: data.author?.username ?? '',
          avatar_url: data.author?.avatar_url ?? PLACEHOLDER_AVATAR_URL,
        },
      })

      closeSplashScreen()
    }

    fetchPost()
  }, [id, navigation])

  const fetchComments = useCallback(async () => {
    if (!post?.id) return

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
      .eq('post_id', Number(post.id))
      .order('created_at', { ascending: true })

    if (error) Alert.alert('Error fetching comments', error.message)

    if (data) {
      const formattedComments = data.map((comment) => ({
        ...comment,
        author: {
          ...comment.author,
          name: comment.author.name ?? '',
          username: comment.author.username ?? '',
          avatarUrl: comment.author.avatar_url ?? PLACEHOLDER_AVATAR_URL,
        },
      }))

      setComments(formattedComments)
    }
  }, [post?.id])

  useEffect(() => {
    if (!id) return

    fetchComments()
  }, [fetchComments, id])

  const handleSubmitComment = async (content: string) => {
    if (!id || !post?.community_id) return
    if (!content.trim()) return

    commentInputRef.current?.clear()

    const { error } = await supabase.from('comments').insert({
      post_id: Number(id),
      content,
      community_id: post.community_id,
    })

    if (error) {
      Alert.alert('Error uploading comment', error.message)

      return
    }

    fetchComments()
  }

  if (!post) {
    return (
      <>
        <Image
          source={require('@/assets/images/onboarding-background-2.png')}
          contentFit="cover"
          style={StyleSheet.absoluteFill}
        />
        <BlurView intensity={80} tint="systemChromeMaterialDark" style={StyleSheet.absoluteFill} />
        <View className="flex-1 justify-center items-center px-4">
          <Text type="heading">Post Not Found</Text>
          <Spacer size="small" />
          <Text className="text-center text-gray-500">
            The post you&apos;re looking for doesn&apos;t exist or has been removed.
          </Text>
          <Spacer size="large" />
          <Link href="/" className="text-blue-500">
            <Button title="Return Home" size="medium" onPress={() => router.replace('/home')} />
          </Link>
        </View>
      </>
    )
  }

  return (
    <>
      <Image
        source={{ blurhash: post.image_blurhash }}
        placeholder={{ blurhash: post.image_blurhash }}
        contentFit="cover"
        style={StyleSheet.absoluteFill}
      />
      <BlurView intensity={80} tint="systemChromeMaterialDark" style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <SafeAreaView className="flex-1">
          <Animated.ScrollView
            ref={scrollViewRef}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="px-4">
            <View className="relative rounded-3xl overflow-hidden">
              <GradientBlur height={descriptionHeight}>
                <Image
                  source={post.image_url}
                  placeholder={{ blurhash: post.image_blurhash }}
                  contentFit="cover"
                  style={{ width: '100%', height: Dimensions.get('window').height * 0.6 }}
                />
              </GradientBlur>
              <View className="absolute w-full gap-4">
                <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent']} locations={[0, 1]}>
                  <View className="flex-row items-center gap-2 p-4">
                    <Image
                      source={{
                        uri:
                          `${post.author.avatar_url}?width=32&height=32` || PLACEHOLDER_AVATAR_URL,
                      }}
                      contentFit="cover"
                      style={{ width: 32, height: 32, borderRadius: 32 }}
                    />
                    <Text type="subhead">{post.author.username || post.author.name}</Text>
                  </View>
                </LinearGradient>
              </View>
              <View
                className="absolute bottom-4 w-full px-4 flex-row items-center justify-between"
                ref={descriptionRef}>
                <View className="flex-1">
                  <Text type="footnote">{post.description}</Text>
                </View>
              </View>
            </View>
            {comments.length ? (
              <View className="gap-4 w-full my-4">
                {comments.map((comment) => (
                  <Comment
                    key={comment.id}
                    id={comment.id}
                    content={comment.content}
                    createdAt={comment.created_at}
                    author={comment.author}
                    likes={comment.likes}
                    currentUserId={profile?.id}
                  />
                ))}
              </View>
            ) : (
              <View className="items-center justify-center my-16">
                <Text type="title2">No comments yet</Text>
                <Spacer />
                <Text type="subhead" style={{ color: Colors.muted }}>
                  Start the conversation.
                </Text>
              </View>
            )}
          </Animated.ScrollView>
          <View className="flex-row items-center gap-2 justify-between py-4 px-4">
            <Image
              source={profile?.avatar_url || PLACEHOLDER_AVATAR_URL}
              style={{ width: 44, height: 44, borderRadius: 36 }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <View className="flex-1">
              <TextInput
                ref={commentInputRef}
                className="rounded-3xl border border-white/20 p-4 text-text"
                placeholder="Write a comment..."
                placeholderTextColor={Colors.muted}
                keyboardAppearance="dark"
                returnKeyType="send"
                onSubmitEditing={(event) => handleSubmitComment(event.nativeEvent.text)}
              />
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  )
}

export default PostScreen
