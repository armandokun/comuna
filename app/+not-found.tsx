import { Link, Stack } from 'expo-router'
import React from 'react'
import { View } from 'react-native'

import Text from '@/components/ui/Text'

const NotFoundScreen = () => (
  <>
    <Stack.Screen options={{ title: 'Oops!' }} />
    <View className="flex-1 items-center justify-center p-4">
      <Text type="title1">This screen doesn&apos;t exist.</Text>
      <Link href="/" className="mt-4">
        <Text type="link">Go to home screen!</Text>
      </Link>
    </View>
  </>
)

export default NotFoundScreen
