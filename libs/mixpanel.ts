import { Mixpanel } from 'mixpanel-react-native'

const trackAutomaticEvents = false
const mixpanel = new Mixpanel(process.env.EXPO_PUBLIC_MIXPANEL_TOKEN!, trackAutomaticEvents)

mixpanel.init(false, {
  autocapture: true,
})

export default mixpanel
