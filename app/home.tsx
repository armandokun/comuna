import { Alert, StyleSheet, View } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SplashScreen } from 'expo-router'
import { Image } from 'expo-image'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

import { supabase } from '@/libs/supabase'
import mockData, { Post } from '@/constants/mockData'
import { SessionContext } from '@/container/SessionProvider'

import MediaList from '@/components/PostList'
import Onboarding from '@/components/Onboarding'
import Header from '@/components/Header'

const HomeScreen = () => {
  const [backgroundBlurhash, setBackgroundBlurhash] = useState(mockData[0]?.image_blurhash)
  const [posts, setPosts] = useState<Array<Post>>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(0)

  const insets = useSafeAreaInsets()
  const { profile, isProfileFetched } = useContext(SessionContext)
  const headerRef = useRef<View>(null)

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

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(
        `
      *,
      author: profiles (
        id,
        name,
        avatar_url
      )
    `,
      )
      .order('created_at', { ascending: false })

    if (error) {
      Alert.alert('Error fetching posts', error.message)

      return
    }

    setPosts(data)

    if (data.length > 0) {
      setBackgroundBlurhash(data[0].image_blurhash)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)

    await fetchPosts()

    setIsRefreshing(false)
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
          source={
            backgroundBlurhash ? { blurhash: backgroundBlurhash } : { uri: mockData[0]?.image_url }
          }
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
        <MediaList
          data={posts}
          onVisibleItemChange={setBackgroundBlurhash}
          headerHeight={insets.top + headerHeight}
          isRefreshing={isRefreshing}
          handleRefresh={handleRefresh}
        />
      </View>
      <Header headerRef={headerRef} headerHeight={headerHeight} />
      <Onboarding isVisible={showOnboarding} onDismiss={() => setShowOnboarding(false)} />
    </>
  )
}
export default HomeScreen
