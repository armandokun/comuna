import { RefObject, useContext, useEffect, useState } from 'react'
import {
  Platform,
  TouchableOpacity,
  SafeAreaView,
  View,
  Linking,
  AppState,
  AppStateStatus,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import * as Notifications from 'expo-notifications'
import { router } from 'expo-router'

import { AUTH } from '@/constants/routes'
import { Colors } from '@/constants/colors'
import { SessionContext } from '@/container/SessionProvider'
import { signOut } from '@/libs/auth'
import usePushNotifications from '@/hooks/usePushNotifications'

import GradientBlur from '../GradientBlur'
import ImagePickerButton from '../ImagePickerButton'
import ContextMenu from '../ui/ContextMenu'
import Text from '../ui/Text'

type Props = {
  headerRef: RefObject<View>
  headerHeight: number
}

const Header = ({ headerRef, headerHeight }: Props) => {
  const [notificationStatus, setNotificationStatus] =
    useState<Notifications.PermissionStatus | null>(null)
  const [appState, setAppState] = useState<AppStateStatus | null>(null)

  const { profile } = useContext(SessionContext)

  const insets = useSafeAreaInsets()
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

  const handleContextMenuPress = async (actionId: string) => {
    switch (actionId) {
      case 'sign-out':
        signOut(() => router.replace(AUTH))

        break
      case 'notifications':
        await registerForPushNotifications(profile?.id!)

        Linking.openSettings()

        break
    }
  }

  return (
    <GradientBlur position="top" height={insets.top + headerHeight + 50}>
      <SafeAreaView style={{ position: 'absolute', width: '100%', zIndex: 10 }}>
        <View ref={headerRef} className="px-4 pb-4 justify-between items-center flex-row">
          <Text type="heading">Comuna</Text>
          <View className="flex-row items-center gap-2">
            <ImagePickerButton />
            <TouchableOpacity>
              <ContextMenu
                itemId={0}
                shouldOpenOnLongPress={false}
                onPress={handleContextMenuPress}
                actions={[
                  {
                    id: 'notifications',
                    title: 'Notifications',
                    image: Platform.select({
                      ios: 'bell',
                      android: 'ic_menu_manage_all',
                    }),
                    state: notificationStatus === 'granted' ? 'on' : 'off',
                    imageColor: Colors.text,
                  },
                  {
                    id: 'sign-out',
                    title: 'Sign out',
                    image: Platform.select({
                      ios: 'rectangle.portrait.and.arrow.right',
                      android: 'ic_menu_logout',
                    }),
                    imageColor: Colors.systemDestructive,
                    attributes: {
                      destructive: true,
                    },
                  },
                ]}>
                <Image
                  source={{ uri: `${profile?.avatar_url}?width=50&height=50` }}
                  contentFit="cover"
                  style={{ width: 42, height: 42, borderRadius: 42 }}
                />
              </ContextMenu>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </GradientBlur>
  )
}

export default Header
