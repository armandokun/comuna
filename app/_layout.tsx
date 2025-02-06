import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import SessionProvider from '@/container/SessionProvider'

import '../global.css'

SplashScreen.preventAutoHideAsync()

const RootLayout = () => {
  const [loaded] = useFonts({
    Geist: require('../assets/fonts/Geist-Regular.otf'),
    GeistMono: require('../assets/fonts/GeistMono-Regular.otf'),
  })

  if (!loaded) return null

  return (
    <GestureHandlerRootView className="flex-1">
      <BottomSheetModalProvider>
        <SessionProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="home" />
            <Stack.Screen name="index" />
          </Stack>
          <StatusBar style="light" />
        </SessionProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  )
}

export default RootLayout
