import { Alert, AppState, AppStateStatus, Linking, SafeAreaView, Switch } from 'react-native'
import { BlurView } from 'expo-blur'
import { Image } from 'expo-image'
import * as Notifications from 'expo-notifications'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useContext, useEffect, useState } from 'react'
import { nativeBuildVersion, nativeApplicationVersion } from 'expo-application'

import { SessionContext } from '@/containers/SessionProvider'
import { Colors } from '@/constants/colors'
import { AUTH, SETTINGS_FEEDBACK } from '@/constants/routes'
import { PLACEHOLDER_AVATAR_URL } from '@/constants/url'
import Text from '@/components/ui/Text'
import mixpanel from '@/libs/mixpanel'
import { signOut } from '@/libs/auth'
import Spacer from '@/components/ui/Spacer'
import Cell from '@/components/ui/Cell'
import Label from '@/components/ui/Label'
import Divider from '@/components/ui/Divider'
import usePushNotifications from '@/hooks/usePushNotifications'
import { supabase } from '@/libs/supabase'

const Settings = () => {
  const [appState, setAppState] = useState<AppStateStatus | null>(null)
  const [notificationStatus, setNotificationStatus] =
    useState<Notifications.PermissionStatus | null>(null)

  const { profile } = useContext(SessionContext)

  const { checkPermissions, registerForPushNotifications } = usePushNotifications()

  useEffect(() => {
    const getNotificationStatus = async () => {
      const status = await checkPermissions()

      setNotificationStatus(status ?? null)
    }

    getNotificationStatus()

    const handleAppStateChange = (nextAppState: typeof AppState.currentState) => {
      if (appState?.match(/inactive|background/) && nextAppState === 'active') {
        getNotificationStatus()
      }

      setAppState(nextAppState)
    }

    AppState.addEventListener('change', handleAppStateChange)
  }, [appState, checkPermissions])

  const handleSignOut = async () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          mixpanel.track('Sign Out')

          await signOut(() => router.replace(AUTH))
        },
      },
    ])
  }

  const handleDeleteAccount = async () => {
    if (!profile?.id) return

    Alert.alert(
      'Delete account',
      'Are you sure you want to delete your account? This action is irreversible.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete account',
          style: 'destructive',
          onPress: async () => {
            mixpanel.track('Delete Account')

            const { error } = await supabase.from('profiles').delete().eq('id', profile.id)

            if (error) {
              Alert.alert('Error deleting account', error.message)
            } else {
              Alert.alert('Account deleted', 'Your account has been deleted.')

              await signOut(() => router.replace(AUTH))
            }
          },
        },
      ],
    )
  }

  const handleNotificationPress = async () => {
    if (!profile?.id) return

    await registerForPushNotifications(profile.id)

    Linking.openSettings()
  }

  return (
    <BlurView tint="systemChromeMaterialDark" intensity={80} className="px-4 mb-4 flex-1">
      <SafeAreaView className="flex-1">
        <BlurView tint="light" intensity={30} className="mt-10 rounded-xl overflow-hidden">
          <Cell
            size="large"
            prefix={
              <Image
                source={{
                  uri: `${profile?.avatar_url}?width=50&height=50` || PLACEHOLDER_AVATAR_URL,
                }}
                contentFit="cover"
                style={{ width: 50, height: 50, borderRadius: 25 }}
              />
            }
            title={<Text type="title3">{profile?.name || profile?.username}</Text>}
            subtitle={
              profile?.name ? (
                <Text type="body" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  @{profile?.username}
                </Text>
              ) : null
            }
          />
        </BlurView>
        <Spacer size="medium" />
        <Label title="Settings" />
        <BlurView tint="light" intensity={30} className="rounded-xl overflow-hidden">
          <Cell
            size="medium"
            prefix={<Ionicons name="notifications" size={24} color={Colors.text} />}
            title={<Text type="body">Notifications</Text>}
            suffix={
              <Switch
                ios_backgroundColor={Colors.muted}
                value={notificationStatus === 'granted'}
                onValueChange={handleNotificationPress}
              />
            }
          />
        </BlurView>
        <Spacer size="medium" />
        <Label title="Feedback" />
        <BlurView tint="light" intensity={30} className="rounded-xl overflow-hidden">
          <Cell
            size="medium"
            prefix={<Ionicons name="mail" size={24} color={Colors.text} />}
            title={<Text type="body">Send feedback</Text>}
            onPress={() => router.push(SETTINGS_FEEDBACK)}
          />
        </BlurView>
        <Spacer size="medium" />
        <Label title="Danger Zone" />
        <BlurView tint="light" intensity={30} className="rounded-xl overflow-hidden">
          <Cell
            size="medium"
            prefix={<Ionicons name="log-out" size={24} color={Colors.text} />}
            title={<Text type="body">Sign out</Text>}
            onPress={handleSignOut}
          />
          <Divider />
          <Cell
            size="medium"
            prefix={<Ionicons name="trash" size={24} color={Colors.systemDestructive} />}
            title={
              <Text type="body" style={{ color: Colors.systemDestructive }}>
                Delete account
              </Text>
            }
            onPress={handleDeleteAccount}
          />
        </BlurView>
        <Spacer />
        <Text type="body" className="text-center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Comuna v{nativeApplicationVersion} ({nativeBuildVersion})
        </Text>
      </SafeAreaView>
    </BlurView>
  )
}

export default Settings
