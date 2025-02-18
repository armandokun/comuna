import { Alert, StyleSheet, View, AppState } from 'react-native'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SplashScreen } from 'expo-router'
import { Image } from 'expo-image'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

import amplitude from '@/libs/amplitude'
import { supabase } from '@/libs/supabase'
import { SessionContext } from '@/containers/SessionProvider'
import { Post } from '@/types/posts'

import PostList from '@/components/PostList'
import Onboarding from '@/components/Onboarding'
import Header from '@/components/Header'

const POSTS_PER_BATCH = 5
const POSTS_PER_BATCH_INDEX = POSTS_PER_BATCH - 1

const HomeScreen = () => {
  const [backgroundBlurhash, setBackgroundBlurhash] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(0)

  const [posts, setPosts] = useState<Array<Post>>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const insets = useSafeAreaInsets()
  const { profile, isProfileFetched } = useContext(SessionContext)
  const headerRef = useRef<View>(null)
  const appState = useRef(AppState.currentState)

  useEffect(() => {
    if (!isProfileFetched) return

    if (!profile?.name) setShowOnboarding(true)
  }, [profile?.name, isProfileFetched])

  useEffect(() => {
    if (headerRef.current) {
      headerRef.current.measure((x, y, width, height, pageX, pageY) => {
        setHeaderHeight(height)
      })
    }
  }, [headerRef])

  const fetchPosts = useCallback(
    async ({ refresh = false }: { refresh?: boolean } = {}) => {
      const startIndex = refresh ? 0 : posts.length
      const endIndex = refresh ? POSTS_PER_BATCH_INDEX : posts.length + POSTS_PER_BATCH_INDEX

      const { data, error } = await supabase
        .from('posts')
        .select(
          `
          *,
          author: profiles (
            id,
            name,
            avatar_url
          ),
          comments: comments (
            *,
            author: profiles (
              id,
              name,
              avatar_url
            )
          )
        `,
        )
        .order('created_at', { ascending: false })
        .range(startIndex, endIndex)

      if (error) {
        Alert.alert('Error fetching posts', error.message)

        return
      }

      if (data.length === 0) {
        setHasMore(false)

        return
      }

      if (startIndex === 0) {
        setBackgroundBlurhash(data[0].image_blurhash)

        amplitude.track('Post Viewed', {
          'Post ID': data[0].id,
        })
      }

      const formattedPosts = data.map((post) => ({
        ...post,
        author: {
          id: post.author?.id ?? '',
          name: post.author?.name ?? '',
          avatar_url: post.author?.avatar_url ?? '',
        },
        comments: post.comments.map((comment) => ({
          ...comment,
          author: {
            id: comment.author?.id ?? '',
            name: comment.author?.name ?? '',
            avatar_url: comment.author?.avatar_url ?? '',
          },
        })),
      }))

      setPosts(refresh ? formattedPosts : [...posts, ...formattedPosts])
    },
    [posts],
  )

  useEffect(() => {
    if (posts.length) return

    fetchPosts()
  }, [fetchPosts, posts.length])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    setHasMore(true)

    await fetchPosts({ refresh: true })

    setIsRefreshing(false)
  }, [fetchPosts])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        handleRefresh()
      }

      appState.current = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [handleRefresh])

  const handleLoadMore = async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)

    await fetchPosts()

    setIsLoading(false)
  }

  const closeSplashScreen = async () => {
    await SplashScreen.hideAsync()
  }

  return (
    <>
      <Animated.View
        key={backgroundBlurhash}
        entering={FadeIn.duration(400)}
        exiting={FadeOut.duration(250).delay(200)}
        style={StyleSheet.absoluteFill}>
        <Image
          source={{ blurhash: backgroundBlurhash }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={250}
          onLoadEnd={closeSplashScreen}
        />
      </Animated.View>
      <BlurView
        intensity={80}
        tint="systemChromeMaterialDark"
        style={StyleSheet.absoluteFill}
        className="absolute w-full h-full"
      />
      <View className="flex-1 justify-center">
        <PostList
          posts={posts}
          onVisibleItemChange={setBackgroundBlurhash}
          headerHeight={insets.top + headerHeight}
          isRefreshing={isRefreshing}
          handleRefresh={handleRefresh}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.7}
        />
      </View>
      <Header headerRef={headerRef} headerHeight={headerHeight} />
      <Onboarding isVisible={showOnboarding} onDismiss={() => setShowOnboarding(false)} />
    </>
  )
}
export default HomeScreen
