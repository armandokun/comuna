import React from 'react'
import { View } from 'react-native'

const Divider = () => (
  <View className="flex-row items-center justify-center">
    <View className="flex-1 h-[1px]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
  </View>
)

export default Divider
