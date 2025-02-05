import { View } from 'react-native'
import { Stack } from 'expo-router'
import React from 'react'

import Text from '@/components/ui/Text'

const HomePage = () => (
  <>
    <Stack.Screen options={{ title: 'Home' }} />
    <View className="flex-1 items-center justify-center p-4">
      <Text type="title1">Welcome!</Text>
      <Text className="mt-4 text-center">
        This is a simple React Native home page. Start building your app here.
      </Text>
    </View>
  </>
)

export default HomePage
