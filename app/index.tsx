import { Dimensions, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import { router, SplashScreen } from 'expo-router'
import React, { ComponentProps, useContext, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Marquee } from '@animatereactnative/marquee'
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  FadeOut,
  useSharedValue,
} from 'react-native-reanimated'
import { Stagger } from '@animatereactnative/stagger'
import { BlurView } from 'expo-blur'
import { Image } from 'expo-image'

import mixpanel from '@/libs/mixpanel'
import { mockSignIn } from '@/libs/auth'
import { signInWithApple } from '@/libs/apple'
import { HOME } from '@/constants/routes'
import Text from '@/components/ui/Text'
import { SessionContext } from '@/containers/SessionProvider'
import MarqueeItem from '@/components/Onboarding/MarqueeItem'
import Spacer from '@/components/ui/Spacer'

type Provider = {
  name: string
  iconName: ComponentProps<typeof Ionicons>['name']
  iconColor: string
  buttonColor: string
  onPress: () => void
  show: boolean
}

const IMAGES = [
  require('@/assets/images/intro-marquee/item-1.png'),
  require('@/assets/images/intro-marquee/item-2.png'),
  require('@/assets/images/intro-marquee/item-3.png'),
  require('@/assets/images/intro-marquee/item-4.png'),
]

const LoginScreen = () => {
  const { session, isSessionFetched } = useContext(SessionContext)
  const offset = useSharedValue(0)

  const { width } = Dimensions.get('window')
  const itemWidth = width * 0.62
  const itemHeight = itemWidth * 1.67

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

  const handleSignIn = (providerName: string, onPress: () => void) => {
    mixpanel.track('Sign In', { Provider: providerName })

    onPress()
  }

  return (
    <View className="flex-1 justify-center items-center">
      <Animated.View
        entering={FadeIn.duration(400)}
        exiting={FadeOut.duration(250).delay(200)}
        style={StyleSheet.absoluteFill}>
        <Image
          source={require('@/assets/images/onboarding-background-1.png')}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={250}
        />
      </Animated.View>
      <BlurView intensity={80} tint="systemMaterialDark" style={StyleSheet.absoluteFill} />
      <View className="flex-1 justify-center">
        <Marquee
          direction="horizontal"
          spacing={16}
          position={offset}
          speed={1}
          style={{ justifyContent: 'center' }}>
          <Animated.View
            style={{ flexDirection: 'row', gap: 4 * 4 }}
            entering={FadeInUp.duration(1500)
              .delay(500)
              .easing(Easing.elastic(0.9))
              .withInitialValues({
                transform: [{ translateY: -itemHeight / 2 }],
                opacity: 0,
              })}>
            {IMAGES.map((image, index) => (
              <MarqueeItem
                key={image}
                offset={offset}
                index={index}
                image={image}
                totalImageCount={IMAGES.length}
              />
            ))}
          </Animated.View>
        </Marquee>
        <Spacer size="xlarge" />
        <Stagger
          duration={500}
          stagger={100}
          initialEnteringDelay={1000}
          style={{
            flex: 0.5,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={{ color: 'white', opacity: 0.8, fontWeight: '500' }}>Welcome to</Text>
          <Text type="heading" style={{ color: 'white' }}>
            Comuna
          </Text>
          <Spacer />
          <Text type="body" className="text-center px-4">
            A place to share your authentic experiences with people you know.
          </Text>
          <Spacer size="large" />
          <View className="gap-4 items-center">
            {PROVIDERS.filter((provider) => provider.show).map((provider) => (
              <TouchableOpacity
                key={provider.name}
                className="rounded-full p-4 flex-row items-center gap-2"
                onPress={() => handleSignIn(provider.name, provider.onPress)}
                style={{ backgroundColor: provider.buttonColor }}>
                <Ionicons name={provider.iconName} size={24} color={provider.iconColor} />
                <Text type="button">Sign in with {provider.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Stagger>
      </View>
    </View>
  )
}

export default LoginScreen
