import { StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

const HeaderBackground = () => (
  <LinearGradient colors={['rgba(0, 0, 0, 0.8)', 'transparent']} style={StyleSheet.absoluteFill} />
)

export default HeaderBackground
