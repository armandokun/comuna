import React, { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import { easeGradient } from 'react-native-easing-gradient'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import MaskedView from '@react-native-masked-view/masked-view'

type Props = {
  children: ReactNode
  height?: number
  position?: 'top' | 'bottom'
}

const GradientBlur = ({ children, height = 100, position = 'bottom' }: Props) => {
  const { colors, locations } = easeGradient({
    colorStops: {
      0: { color: position === 'bottom' ? 'transparent' : 'rgb(0, 0, 0)' },
      0.5: { color: 'rgba(0, 0, 0, 0.9)' },
      1: { color: position === 'bottom' ? 'rgb(0, 0, 0)' : 'transparent' },
    },
  })

  return (
    <>
      {children}
      <View
        className={`absolute w-full ${position === 'top' ? 'top-0' : '-bottom-1'}`} // -bottom-1 iPhone 13 mini fix that caused 1px gap
        style={{ height }}>
        <MaskedView
          maskElement={
            <LinearGradient
              locations={locations as [number, number, ...Array<number>]}
              colors={colors as [string, string, ...Array<string>]}
              style={StyleSheet.absoluteFill}
            />
          }
          style={[StyleSheet.absoluteFill]}>
          <BlurView
            intensity={80}
            tint="systemChromeMaterialDark"
            style={[StyleSheet.absoluteFill]}
          />
        </MaskedView>
      </View>
    </>
  )
}

export default GradientBlur
