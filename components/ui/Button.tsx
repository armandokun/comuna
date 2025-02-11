import { Ionicons } from '@expo/vector-icons'
import { ComponentProps } from 'react'
import { TouchableOpacity } from 'react-native'

import { Colors } from '@/constants/colors'

import Text from './Text'

type ButtonType = 'filled' | 'outlined' | 'flat'
type ButtonSize = 'small' | 'medium' | 'large'
type ButtonIconPosition = 'left' | 'right'

type Props = {
  onPress: () => void
  title?: string
  type?: ButtonType
  size?: ButtonSize
  iconName?: ComponentProps<typeof Ionicons>['name']
  iconPosition?: ButtonIconPosition
  disabled?: boolean
}

const Button = ({
  title,
  onPress,
  iconName,
  type = 'filled',
  size = 'small',
  iconPosition = 'left',
  disabled = false,
}: Props) => {
  const backgroundStyles = {
    filled: 'bg-text',
    outlined: 'border border-text/40',
    flat: '',
  }

  const sizeStyles: Record<ButtonSize, string> = {
    small: 'px-3',
    medium: 'px-3 py-2',
    large: 'px-4 py-3',
  }

  const iconSizes: Record<ButtonSize, number> = {
    small: 16,
    medium: 22,
    large: 28,
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${backgroundStyles[type]} ${type === 'flat' ? '' : sizeStyles[size]} rounded-full flex-row items-center justify-center ${disabled ? 'opacity-50' : ''}`}>
      {iconName && iconPosition === 'left' && (
        <Ionicons
          name={iconName}
          size={type === 'flat' ? iconSizes[size] + 12 : iconSizes[size]}
          color={type === 'filled' ? Colors.background : Colors.primary}
          style={{ marginRight: title ? 8 : 0 }}
        />
      )}
      {title && (
        <Text
          type="button"
          style={{
            color: type === 'flat' || type === 'outlined' ? Colors.text : Colors.background,
          }}>
          {title}
        </Text>
      )}
      {iconName && iconPosition === 'right' && (
        <Ionicons
          name={iconName}
          size={type === 'flat' ? iconSizes[size] + 4 : iconSizes[size]}
          color={type === 'filled' ? Colors.background : Colors.primary}
        />
      )}
    </TouchableOpacity>
  )
}

export default Button
