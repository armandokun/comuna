import * as amplitude from '@amplitude/analytics-react-native'

amplitude.init(process.env.EXPO_PUBLIC_AMPLITUDE_TOKEN!, '', {
  serverZone: 'EU',
})

export default amplitude
