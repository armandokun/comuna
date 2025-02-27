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
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { ABOUT_COMMUNITY, AUTH, NEW_COMMUNITY } from '@/constants/routes'
import { Colors } from '@/constants/colors'
import { SELECTED_COMMUNITY_KEY } from '@/constants/async-storage'
import { SessionContext } from '@/containers/SessionProvider'
import { CommunityContext } from '@/containers/CommunityProvider'
import { signOut } from '@/libs/auth'
import mixpanel from '@/libs/mixpanel'
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
  const { comunas, selectedComuna, setSelectedComuna } = useContext(CommunityContext)

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

  const handleProfileContextMenuPress = async (actionId: string) => {
    switch (actionId) {
      case 'sign-out':
        mixpanel.track('Sign Out')

        signOut(() => router.replace(AUTH))

        break
      case 'notifications':
        await registerForPushNotifications(profile?.id!)

        Linking.openSettings()

        break
    }
  }

  const handleCommunityContextMenuPress = async (actionId: string) => {
    if (!comunas.length) return

    switch (actionId) {
      case 'new-community':
        router.push(NEW_COMMUNITY)

        break
      default:
        setSelectedComuna(comunas.find((comuna) => comuna.id === Number(actionId)) || null)

        await AsyncStorage.setItem(SELECTED_COMMUNITY_KEY, actionId)

        break
    }
  }

  return (
    <GradientBlur position="top" height={insets.top + headerHeight + 50}>
      <SafeAreaView style={{ position: 'absolute', width: '100%', zIndex: 10 }}>
        <View ref={headerRef} className="px-4 pb-4 justify-between items-center flex-row">
          <TouchableOpacity>
            <ContextMenu
              itemId={0}
              shouldOpenOnLongPress={false}
              onPress={handleCommunityContextMenuPress}
              actions={[
                ...comunas.map((comuna) => ({
                  id: comuna.id.toString(),
                  title: `#${comuna.name}`,
                  imageColor: Colors.text,
                })),
                {
                  id: 'divider1',
                  title: '',
                  displayInline: true,
                  subactions: [
                    {
                      id: 'new-community',
                      title: 'New Comuna',
                      image: Platform.select({
                        ios: 'plus',
                        android: 'ic_menu_add',
                      }),
                      imageColor: Colors.text,
                    },
                  ],
                },
              ]}>
              <View className="flex-row items-center">
                <Text type="title1" className="max-w-[190px]" numberOfLines={1}>
                  #{selectedComuna?.name}
                </Text>
                <Ionicons name="chevron-down" size={24} color="rgba(255, 255, 255, 0.7)" />
              </View>
            </ContextMenu>
          </TouchableOpacity>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity onPress={() => router.push(ABOUT_COMMUNITY)}>
              <Ionicons name="people-circle-outline" size={40} color={Colors.text} />
            </TouchableOpacity>
            <ImagePickerButton />
            <TouchableOpacity className="pl-1">
              <ContextMenu
                itemId={1}
                shouldOpenOnLongPress={false}
                onPress={handleProfileContextMenuPress}
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
                  style={{ width: 36, height: 36, borderRadius: 36 }}
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
