/* eslint-disable react/no-unstable-nested-components */
import { useFonts } from 'expo-font'
import { router, Stack, useNavigation } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import { useEffect } from 'react'
import * as Notifications from 'expo-notifications'

import mixpanel from '@/libs/mixpanel'
import { HOME } from '@/constants/routes'
import { Colors } from '@/constants/colors'
import SessionProvider from '@/containers/SessionProvider'
import CommunityProvider from '@/containers/CommunityProvider'
import BackgroundProvider from '@/containers/BackgroundProvider'

import '../global.css'

SplashScreen.preventAutoHideAsync()
SplashScreen.setOptions({
  fade: true,
})

const RootLayout = () => {
  const navigation = useNavigation()

  const [loaded] = useFonts({
    Geist: require('../assets/fonts/Geist-Regular.otf'),
    GeistMono: require('../assets/fonts/GeistMono-Regular.otf'),
  })

  useEffect(() => {
    if (!navigation) return

    const state = navigation.getState()
    const currentRoute = state?.routes?.[state.routes.length - 1]?.name

    if (!currentRoute) return

    mixpanel.track('Page View', {
      'Page Name': currentRoute,
    })
  }, [navigation])

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const postId = response.notification.request.content.data.post_id

      if (!postId) return

      setTimeout(() => {
        router.dismissAll()
        router.push(`/posts/${postId}`)
      }, 1000)
    })

    return () => subscription.remove()
  }, [])

  if (!loaded) return null

  const handleGoBack = () => {
    const canGoBack = navigation.canGoBack()

    if (!canGoBack) return router.replace(HOME)

    navigation.goBack()
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <BottomSheetModalProvider>
        <SessionProvider>
          <CommunityProvider>
            <BackgroundProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  headerTransparent: true,
                  headerTintColor: Colors.text,
                  contentStyle: {
                    backgroundColor: Colors.muted,
                  },
                }}>
                <Stack.Screen name="index" options={{ gestureEnabled: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
                <Stack.Screen
                  name="posts/new"
                  options={{
                    presentation: 'modal',
                    headerTitle: 'New Post',
                    headerShown: true,
                    gestureEnabled: false,
                  }}
                />
                <Stack.Screen
                  name="posts/[id]"
                  options={{
                    headerTitle: '',
                    headerShown: true,
                  }}
                />
                <Stack.Screen
                  name="comments/[id]/likes"
                  options={{
                    presentation: 'modal',
                    headerTitle: 'Likes',
                    contentStyle: {
                      backgroundColor: 'transparent',
                    },
                    headerShown: true,
                    headerRight: () => (
                      <TouchableOpacity onPress={handleGoBack}>
                        <Ionicons name="close-circle" size={36} color={Colors.text} />
                      </TouchableOpacity>
                    ),
                  }}
                />
                <Stack.Screen
                  name="communities/new"
                  options={{
                    presentation: 'modal',
                    headerTitle: 'New Comuna',
                    headerShown: true,
                    gestureEnabled: false,
                    contentStyle: {
                      backgroundColor: 'transparent',
                    },
                  }}
                />
                <Stack.Screen
                  name="communities/about"
                  options={{
                    presentation: 'modal',
                    headerShown: true,
                    contentStyle: {
                      backgroundColor: 'transparent',
                    },
                    headerTitle: '',
                    headerLeft: () => (
                      <TouchableOpacity onPress={handleGoBack}>
                        <Ionicons name="close-circle" size={36} color={Colors.text} />
                      </TouchableOpacity>
                    ),
                  }}
                />
                <Stack.Screen
                  name="profile/feedback"
                  options={{
                    presentation: 'modal',
                    headerShown: true,
                    headerTitle: 'Feedback',
                    gestureEnabled: false,
                    contentStyle: {
                      backgroundColor: 'transparent',
                    },
                    headerLeft: () => (
                      <TouchableOpacity onPress={handleGoBack}>
                        <Ionicons name="close-circle" size={36} color={Colors.text} />
                      </TouchableOpacity>
                    ),
                  }}
                />
                <Stack.Screen
                  name="invite/[hash]"
                  options={{
                    headerShown: true,
                    presentation: 'modal',
                    contentStyle: {
                      backgroundColor: 'transparent',
                    },
                    headerLeft: () => (
                      <TouchableOpacity onPress={handleGoBack}>
                        <Ionicons name="close-circle" size={36} color={Colors.text} />
                      </TouchableOpacity>
                    ),
                    headerTitle: 'Invitation',
                  }}
                />
              </Stack>
            </BackgroundProvider>
          </CommunityProvider>
        </SessionProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  )
}

export default RootLayout
