import { Platform, TouchableOpacity, View } from 'react-native'
import { router, SplashScreen } from 'expo-router'
import React, { ComponentProps, useContext, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'

import { mockSignIn } from '@/libs/auth'
import { signInWithApple } from '@/libs/apple'
import { HOME } from '@/constants/routes'
import Text from '@/components/ui/Text'
import { SessionContext } from '@/container/SessionProvider'

type Provider = {
  name: string
  iconName: ComponentProps<typeof Ionicons>['name']
  iconColor: string
  buttonColor: string
  onPress: () => void
  show: boolean
}

const LoginScreen = () => {
  const { session, isSessionFetched } = useContext(SessionContext)

  useEffect(() => {
    SplashScreen.preventAutoHideAsync()
  }, [])

  useEffect(() => {
    if (!isSessionFetched) return

    const closeSplashScreen = async () => {
      await SplashScreen.hideAsync()
    }

    if (!session) {
      closeSplashScreen()

      return
    }

    router.replace(HOME)
  }, [isSessionFetched, session])

  const PROVIDERS: Array<Provider> = [
    {
      show: Platform.OS === 'ios',
      name: 'Apple',
      iconName: 'logo-apple',
      iconColor: 'white',
      buttonColor: 'black',
      onPress: signInWithApple,
    },
    {
      show: process.env.NODE_ENV === 'development',
      name: 'Dev',
      iconName: 'cog',
      iconColor: 'white',
      buttonColor: 'blue',
      onPress: mockSignIn,
    },
  ]

  return (
    <View className="flex-1 justify-center items-center">
      <View className="gap-4">
        {PROVIDERS.filter((provider) => provider.show).map((provider) => (
          <TouchableOpacity
            key={provider.name}
            className="rounded-full p-4 flex-row items-center gap-2"
            onPress={provider.onPress}
            style={{ backgroundColor: provider.buttonColor }}>
            <Ionicons name={provider.iconName} size={24} color={provider.iconColor} />
            <Text type="button">Sign in with {provider.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

export default LoginScreen
