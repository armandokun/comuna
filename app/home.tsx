import { Alert, Platform, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, SplashScreen } from 'expo-router'
import { Image } from 'expo-image'

import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

import { signOut } from '@/libs/auth'
import { supabase } from '@/libs/supabase'

import { AUTH } from '@/constants/routes'
import mockData, { Post } from '@/constants/mockData'

import { SessionContext } from '@/container/SessionProvider'

import Text from '@/components/ui/Text'
import MediaList from '@/components/PostList'
import GradientBlur from '@/components/GradientBlur'
import ImagePickerButton from '@/components/ImagePickerButton'
import Onboarding from '@/components/Onboarding'
import ContextMenu from '@/components/ui/ContextMenu'
import { Colors } from '@/constants/colors'

const HomeScreen = () => {
  const [backgroundBlurhash, setBackgroundBlurhash] = useState(mockData[0]?.image_blurhash)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [posts, setPosts] = useState<Array<Post>>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const insets = useSafeAreaInsets()
  const headerRef = useRef<View>(null)
  const { profile, isProfileFetched } = useContext(SessionContext)

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

  const handleContextMenuPress = (actionId: string) => {
    if (actionId === 'sign-out') {
      signOut(() => {
        router.replace(AUTH)
      })
    }
  }

  const closeSplashScreen = async () => {
    await SplashScreen.hideAsync()
  }

  return (
    <>
      <Animated.View
        key={backgroundBlurhash}
        entering={FadeIn.duration(250)}
        exiting={FadeOut.duration(250)}
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
      <GradientBlur position="top" height={insets.top + headerHeight + 50}>
        <SafeAreaView style={{ position: 'absolute', width: '100%', zIndex: 10 }}>
          <View ref={headerRef} className="px-4 py-4 justify-between items-center flex-row">
            <Text type="heading">Comuna</Text>
            <View className="flex-row items-center gap-2">
              <ImagePickerButton />
              <TouchableOpacity>
                <ContextMenu
                  itemId={0}
                  shouldOpenOnLongPress={false}
                  onPress={handleContextMenuPress}
                  actions={[
                    {
                      id: 'sign-out',
                      title: 'Sign out',
                      image: Platform.select({
                        ios: 'rectangle.portrait.and.arrow.right',
                        android: 'ic_menu_logout',
                      }),
                      imageColor: Colors.systemDestructive,
                      attributes: {
                        destructive: true,
                      },
                    },
                  ]}>
                  <Image
                    source={{ uri: `${profile?.avatar_url}?width=50&height=50` }}
                    contentFit="cover"
                    style={{ width: 44, height: 44, borderRadius: 44 }}
                  />
                </ContextMenu>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </GradientBlur>
      <Onboarding isVisible={showOnboarding} onDismiss={() => setShowOnboarding(false)} />
    </>
  )
}
export default HomeScreen
