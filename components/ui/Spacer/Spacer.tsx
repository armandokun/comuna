import { ReactNode } from 'react'
import { View } from 'react-native'

type Size = 'xxsmall' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'

const sizeValues: Record<Size, number> = {
  xxsmall: 2,
  xsmall: 4,
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
}

type Orientation = 'vertical' | 'horizontal'

type Props = {
  size?: Size
  orientation?: Orientation
  children?: ReactNode
}

const Spacer = ({ size = 'small', orientation = 'vertical', children }: Props) => {
  const marginSize = sizeValues[size]
  const marginStyle =
    orientation === 'vertical' ? { marginVertical: marginSize } : { marginHorizontal: marginSize }

  if (!children) return <View style={marginStyle} />

  return (
    <View className="w-full" style={marginStyle}>
      {children}
    </View>
  )
}

export default Spacer
