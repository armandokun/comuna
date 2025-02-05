import type { PropsWithChildren } from 'react'
import { useRef } from 'react'
import { Keyboard, View } from 'react-native'
import * as TextInputState from 'react-native/Libraries/Components/TextInput/TextInputState'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'

const KeyboardDismissPressable = ({ children }: PropsWithChildren) => {
  const isTargetTextInput = useRef(false)

  const tap = Gesture.Tap()
    .onEnd(() => {
      if (!isTargetTextInput.current) {
        Keyboard.dismiss()
      }
    })
    .runOnJS(true)

  return (
    <GestureDetector gesture={tap}>
      <View
        className="flex-1"
        onStartShouldSetResponderCapture={(e) => {
          // Allow to avoid keyboard flickering when clicking on a TextInput
          isTargetTextInput.current = TextInputState.isTextInput(e.target)

          return false
        }}
        accessible={false}>
        {children}
      </View>
    </GestureDetector>
  )
}

export default KeyboardDismissPressable
