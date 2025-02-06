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
      0: { color: position === 'bottom' ? 'transparent' : 'rgba(0,0,0,0.99)' },
      0.5: { color: 'rgba(0,0,0,0.9)' },
      1: { color: position === 'bottom' ? 'rgba(0,0,0,0.99)' : 'transparent' },
    },
  })

  return (
    <>
      {children}
      <View
        className={`absolute ${position === 'top' ? 'top-0' : 'bottom-0'} w-full`}
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
            intensity={100}
            tint="systemChromeMaterialDark"
            style={[StyleSheet.absoluteFill]}
          />
        </MaskedView>
      </View>
    </>
  )
}

export default GradientBlur
