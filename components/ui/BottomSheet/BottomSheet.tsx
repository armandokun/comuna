import { ReactNode, RefObject, useCallback, useEffect, useRef } from 'react'
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetBackgroundProps,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetProps,
} from '@gorhom/bottom-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, View } from 'react-native'
import { BlurView } from 'expo-blur'

import { Colors } from '@/constants/colors'

type Props = {
  show: boolean
  children: ReactNode
  onBackdropPress?: () => void
  footer?: ReactNode
  scrollViewRef?: RefObject<ScrollView>
} & BottomSheetProps

const BottomSheet = ({
  show,
  children,
  onBackdropPress = undefined,
  footer,
  scrollViewRef,
  ...props
}: Props) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)

  const insets = useSafeAreaInsets()

  const BackDrop = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        onPress={onBackdropPress}
        opacity={0.3}
      />
    ),
    [onBackdropPress],
  )

  const Background = useCallback(
    (backgroundProps: BottomSheetBackgroundProps) => (
      <BlurView
        intensity={80}
        className="rounded-t-3xl overflow-hidden"
        tint="systemChromeMaterialDark"
        style={backgroundProps.style}
        {...backgroundProps}
      />
    ),
    [],
  )

  const Footer = useCallback(
    (footerProps: BottomSheetFooterProps) => (
      <BottomSheetFooter style={{ paddingHorizontal: 16 }} {...footerProps}>
        <BlurView
          intensity={80}
          tint="systemChromeMaterialDark"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        {footer}
        <View style={{ height: insets.bottom }} />
      </BottomSheetFooter>
    ),
    [footer, insets.bottom],
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
      footerComponent={footer ? Footer : undefined}
      snapPoints={['90%']}
      handleIndicatorStyle={{ backgroundColor: Colors.muted }}
      {...props}>
      <BottomSheetScrollView ref={scrollViewRef}>
        <View style={{ paddingBottom: insets.bottom }}>{children}</View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
}

export default BottomSheet
