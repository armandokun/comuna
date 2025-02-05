import { ReactNode, useCallback, useEffect, useRef } from 'react'
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetBackgroundProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { View } from 'react-native'

import { Colors } from '@/constants/colors'

type Props = {
  show: boolean
  children: ReactNode
  onBackdropPress?: () => void
}

const BottomSheet = ({ show, children, onBackdropPress = undefined }: Props) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)

  const insets = useSafeAreaInsets()

  const BackDrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        onPress={onBackdropPress}
        opacity={0.3}
      />
    ),
    [onBackdropPress],
  )

  const Background = useCallback(
    (props: BottomSheetBackgroundProps) => (
      <View
        {...props}
        style={[props.style, { borderRadius: 30, backgroundColor: Colors.background }]}
      />
    ),
    [],
  )

  useEffect(() => {
    if (!show) return bottomSheetModalRef.current?.dismiss()

    bottomSheetModalRef.current?.present()
  }, [show])

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      enableDynamicSizing
      onDismiss={onBackdropPress}
      backdropComponent={BackDrop}
      backgroundComponent={Background}
      handleIndicatorStyle={{ backgroundColor: Colors.disabled }}>
      <BottomSheetScrollView>
        <View style={{ paddingBottom: insets.bottom }}>{children}</View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
}

export default BottomSheet
