import React, { ReactNode } from 'react'
import { View } from 'react-native'

import Text from '../Text'
import Spacer from '../Spacer'

type Props = {
  title?: string
  subtitle?: string
  media?: ReactNode
  mediaPosition?: 'top' | 'bottom'
}

const Slide = ({ title, subtitle, mediaPosition, media }: Props) => (
  <View className="justify-center items-center flex-1 p-6">
    {mediaPosition === 'top' && media}
    {title && (
      <Text className="items-center text-center" type="heading">
        {title}
      </Text>
    )}
    {subtitle && (
      <>
        <Spacer size="small" />
        <Text type="body" className="text-center">
          {subtitle}
        </Text>
      </>
    )}
    {mediaPosition === 'bottom' && <View className="p-20">{media}</View>}
  </View>
)

export default Slide
