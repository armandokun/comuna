import { ReactNode } from 'react'
import { TouchableOpacity, View } from 'react-native'

import Spacer from './Spacer'

type Props = {
  title: ReactNode
  subtitle?: ReactNode
  suffix?: ReactNode
  prefix?: ReactNode
  size?: 'small' | 'medium' | 'large' | 'tiny'
  onPress?: () => void
}

const Content = ({ size, onPress, prefix, title, subtitle, suffix }: Props) => {
  const getSize = () => {
    switch (size) {
      case 'medium':
        return 12
      case 'large':
      case 'small':
        return 4
      case 'tiny':
        return 2
      default:
        return 8
    }
  }

  return (
    <View className="flex-row items-center justify-between" style={{ paddingVertical: getSize() }}>
      <View pointerEvents={onPress ? 'none' : 'auto'}>{prefix}</View>
      <Spacer orientation="horizontal" size="xsmall" />
      <Spacer orientation="horizontal" size="xxsmall" />
      <View className="flex-1">
        {title}
        {subtitle}
      </View>
      <View pointerEvents={onPress ? 'none' : 'auto'}>{suffix}</View>
    </View>
  )
}

const Cell = ({ onPress, ...props }: Props) => {
  if (!onPress) return <Content {...props} />

  return (
    <TouchableOpacity onPress={onPress}>
      <Content {...props} />
    </TouchableOpacity>
  )
}

export default Cell
