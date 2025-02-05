import React, { RefObject } from 'react'
import { TextInput, TextInputProps } from 'react-native'

import { Colors } from '@/constants/colors'

type Props = TextInputProps & {
  placeholder?: string
  value?: string
  onChangeText?: (text: string) => void
  forwardRef?: RefObject<TextInput>
}

const TextArea = ({ placeholder, value, onChangeText, forwardRef, ...props }: Props) => (
  <TextInput
    ref={forwardRef}
    className="h-40 p-2 rounded-lg bg-zinc-800"
    placeholder={placeholder}
    value={value}
    textAlignVertical="top"
    placeholderTextColor={Colors.muted}
    onChangeText={onChangeText}
    multiline
    numberOfLines={4}
    style={{ color: Colors.text, fontSize: 16 }}
    autoCorrect={false}
    {...props}
  />
)

export default TextArea
