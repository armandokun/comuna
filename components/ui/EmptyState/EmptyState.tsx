import { View } from 'react-native'

import Button from '../Button'
import Spacer from '../Spacer'
import Text from '../Text'

type Props = {
  title: string
  subtitle?: string
  onPress?: () => void
  actionLabel?: string
}

const EmptyState = ({ title, subtitle, onPress, actionLabel }: Props) => (
  <View className="flex-1 justify-center items-center">
    <Text type="title2">{title}</Text>
    <Spacer size="xsmall" />
    {subtitle && (
      <Text className="text-center" type="body" color="muted">
        {subtitle}
      </Text>
    )}
    <Spacer size="small" />
    {actionLabel && onPress && <Button title={actionLabel} onPress={onPress} />}
  </View>
)

export default EmptyState
