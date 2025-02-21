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

import amplitude from '@/libs/amplitude'
import { HOME } from '@/constants/routes'
import { Colors } from '@/constants/colors'
import SessionProvider from '@/containers/SessionProvider'
import CommunityProvider from '@/containers/CommunityProvider'
import HeaderBackground from '@/components/HeaderBackground'

import '../global.css'

SplashScreen.preventAutoHideAsync()

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

    amplitude.track('Page Viewed', {
      'Page Name': currentRoute,
    })
  }, [navigation])

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const postId = response.notification.request.content.data.post_id

      if (!postId) return

      setTimeout(() => {
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
    <GestureHandlerRootView className="flex-1">
      <BottomSheetModalProvider>
        <SessionProvider>
          <CommunityProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                headerTransparent: true,
                headerTintColor: Colors.text,
                headerBackground: HeaderBackground,
              }}>
              <Stack.Screen name="+not-found" />
              <Stack.Screen name="home" />
              <Stack.Screen
                name="posts/new"
                options={{ presentation: 'modal', headerTitle: 'New Post', headerShown: true }}
              />
              <Stack.Screen name="index" />
              <Stack.Screen
                name="posts/[id]"
                options={{
                  presentation: 'modal',
                  headerTitle: '',
                  headerShown: true,
                  headerRight: () => (
                    <TouchableOpacity onPress={handleGoBack}>
                      <Ionicons name="close-circle" size={36} color={Colors.text} />
                    </TouchableOpacity>
                  ),
                }}
              />
              <Stack.Screen
                name="comments/[id]/likes"
                options={{
                  presentation: 'transparentModal',
                  headerTitle: 'Likes',
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
                }}
              />
            </Stack>
            <StatusBar style="light" />
          </CommunityProvider>
        </SessionProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  )
}

export default RootLayout
