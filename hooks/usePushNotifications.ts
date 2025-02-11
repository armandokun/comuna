import { useState, useEffect, useRef, useContext } from 'react'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'

import { supabase } from '@/libs/supabase'
import { SessionContext } from '@/container/SessionProvider'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

const usePushNotifications = () => {
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined,
  )

  const notificationListener = useRef<Notifications.Subscription>()
  const responseListener = useRef<Notifications.Subscription>()

  const { profile } = useContext(SessionContext)

  const checkPermissions = async () => {
    if (!Device.isDevice) return

    const { status } = await Notifications.getPermissionsAsync()

    return status
  }

  const requestPermissions = async () => {
    if (!Device.isDevice) return

    const existingStatus = await checkPermissions()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()

      finalStatus = status
    }

    return finalStatus
  }

  const registerForPushNotifications = async (profileId: string) => {
    const finalStatus = await requestPermissions()

    if (finalStatus !== 'granted') return

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId
      if (!projectId) throw new Error('Project ID not found')

      const { data, error } = await supabase
        .from('profiles')
        .select('expo_push_token')
        .eq('id', profileId)
        .single()

      if (error) throw new Error(`Failed to fetch profile data: ${error.message}`)

      if (data?.expo_push_token) return

      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data

      const { error: upsertError } = await supabase
        .from('profiles')
        .update({ expo_push_token: token })
        .eq('id', profileId)

      if (upsertError) throw new Error(`Failed to upsert profile data: ${upsertError.message}`)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener((alert) => {
      setNotification(alert)
    })

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response)
    })

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current)
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current)
    }
  }, [profile?.id])

  return {
    notification,
    checkPermissions,
    requestPermissions,
    registerForPushNotifications,
  }
}

export default usePushNotifications
