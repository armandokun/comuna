import { RefObject, useContext } from 'react'
import { Platform, TouchableOpacity, SafeAreaView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { BlurView } from 'expo-blur'

import { ABOUT_COMMUNITY, NEW_COMMUNITY, PROFILE_SETTINGS } from '@/constants/routes'
import { Colors } from '@/constants/colors'
import { SELECTED_COMMUNITY_KEY } from '@/constants/async-storage'
import { SessionContext } from '@/containers/SessionProvider'
import { CommunityContext } from '@/containers/CommunityProvider'
import { PLACEHOLDER_AVATAR_URL } from '@/constants/url'

import GradientBlur from '../GradientBlur'
import ImagePickerButton from '../ImagePickerButton'
import ContextMenu from '../ui/ContextMenu'
import Text from '../ui/Text'

type Props = {
  headerRef: RefObject<View>
  headerHeight: number
}

const Header = ({ headerRef, headerHeight }: Props) => {
  const { profile } = useContext(SessionContext)
  const { comunas, selectedComuna, setSelectedComuna } = useContext(CommunityContext)

  const insets = useSafeAreaInsets()

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
    <GradientBlur position="top" height={insets.top + headerHeight + 25}>
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
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => router.push(ABOUT_COMMUNITY)}>
              <BlurView
                tint="light"
                className="w-10 h-10 rounded-full overflow-hidden items-center justify-center">
                <Ionicons name="people" size={24} color={Colors.text} />
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </GradientBlur>
  )
}

export default Header
