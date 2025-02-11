import { useContext } from 'react'
import { Platform, TouchableOpacity, SafeAreaView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { router } from 'expo-router'

import { AUTH } from '@/constants/routes'
import { Colors } from '@/constants/colors'
import { SessionContext } from '@/container/SessionProvider'
import { signOut } from '@/libs/auth'

import GradientBlur from '../GradientBlur'
import ImagePickerButton from '../ImagePickerButton'
import ContextMenu from '../ui/ContextMenu'
import Text from '../ui/Text'

type Props = {
  headerRef: React.RefObject<View>
  headerHeight: number
}

const Header = ({ headerRef, headerHeight }: Props) => {
  const { profile } = useContext(SessionContext)

  const insets = useSafeAreaInsets()

  const handleContextMenuPress = async (actionId: string) => {
    switch (actionId) {
      case 'sign-out':
        signOut(() => {
          router.replace(AUTH)
        })
        break
    }
  }

  return (
    <GradientBlur position="top" height={insets.top + headerHeight + 50}>
      <SafeAreaView style={{ position: 'absolute', width: '100%', zIndex: 10 }}>
        <View ref={headerRef} className="px-4 py-4 justify-between items-center flex-row">
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
                  style={{ width: 44, height: 44, borderRadius: 44 }}
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
