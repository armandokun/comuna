import { Mixpanel } from 'mixpanel-react-native'

const trackAutomaticEvents = false
const mixpanel = new Mixpanel(process.env.EXPO_PUBLIC_MIXPANEL_TOKEN!, trackAutomaticEvents)

const optOutTrackingByDefault = process.env.NODE_ENV === 'development'

mixpanel.init(optOutTrackingByDefault, {
  autocapture: true,
})

export default mixpanel
