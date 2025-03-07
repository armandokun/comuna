import {
  Modal,
  View,
  Dimensions,
  TextInput,
  Alert,
  Image,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native'
import React, { useContext, useRef, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { ImagePickerAsset } from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { decode } from 'base64-arraybuffer'
import * as ImageManipulator from 'expo-image-manipulator'
import { BlurView } from 'expo-blur'

import Carousel from '@/components/ui/Carousel'
import Text from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { SessionContext } from '@/containers/SessionProvider'
import { supabase } from '@/libs/supabase'
import usePushNotifications from '@/hooks/usePushNotifications'
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from '@/constants/profile'

import { PLACEHOLDER_AVATAR_URL } from '@/constants/url'

import ContextMenu from '../ui/ContextMenu'

type Props = {
  isVisible: boolean
  onDismiss: () => void
}

const Onboarding = ({ isVisible, onDismiss }: Props) => {
  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState<ImagePickerAsset | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  const { profile } = useContext(SessionContext)
  const usernameInput = useRef<TextInput>(null)

  const { registerForPushNotifications, checkPermissions } = usePushNotifications()

  const handleUsernameChange = (text: string) => {
    const prefix = text.startsWith('@') ? text.substring(1) : text

    const cleanText = prefix.replace(/[^a-z0-9]/g, '')

    const formattedUsername = `@${cleanText}`

    setUsername(formattedUsername)
  }

  const submitUsername = async (onPress: () => void) => {
    if (!username.trim() || !profile?.id) return

    const usernameWithoutPrefix = username.startsWith('@') ? username.substring(1) : username

    setIsLoading(true)

    if (username.length < USERNAME_MIN_LENGTH) {
      Alert.alert('Username must be at least 5 characters long.')

      setIsLoading(false)

      return
    }

    const { data, error: existingUsernameError } = await supabase
      .from('profiles')
      .select('username, id')
      .eq('username', usernameWithoutPrefix)

    if (data?.length) {
      if (data[0].id === profile.id) {
        onPress()

        setIsLoading(false)

        return
      }

      Alert.alert('Username already taken', 'Please choose another username.')

      setIsLoading(false)

      return
    }

    if (existingUsernameError) {
      Alert.alert('Error checking username', existingUsernameError.message)

      setIsLoading(false)

      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({ username: usernameWithoutPrefix })
      .eq('id', profile.id)

    if (error) Alert.alert('Error updating profile details', error.message)

    onPress()

    setIsLoading(false)
  }

  const submitProfileAvatar = async (onPress: () => void) => {
    if (!profile?.id) return

    if (profile.avatar_url && !avatar) onPress()

    if (!avatar) return

    setIsLoading(true)

    const fileName = `${Date.now()}-${avatar.uri.split('/').pop()}`

    const manipulatedImage = await ImageManipulator.manipulateAsync(
      avatar.uri,
      [{ resize: { width: 100 } }],
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    )

    const base64Data = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
      encoding: FileSystem.EncodingType.Base64,
    })

    const { error: storageError } = await supabase.storage
      .from('avatars')
      .upload(fileName, decode(base64Data), {
        contentType: avatar.mimeType,
        cacheControl: '3600', // 1 hour
        upsert: true,
      })

    if (storageError) Alert.alert('Error uploading image', storageError.message)

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(fileName)

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', profile.id)

    if (error) Alert.alert('Error updating profile picture', error.message)

    onPress()

    setIsLoading(false)
  }

  const handleContextMenuPress = async (actionId: string) => {
    let result: ImagePicker.ImagePickerResult

    const { status } = await ImagePicker.requestCameraPermissionsAsync()

    switch (actionId) {
      case 'camera':
        if (status !== ImagePicker.PermissionStatus.GRANTED) {
          Alert.alert('Permission not granted', 'Please grant permission to access the camera')

          return
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.4,
          selectionLimit: 1,
          allowsEditing: true,
          aspect: [1, 1],
        })

        if (result.canceled) return

        setAvatar(result.assets[0])

        break
      case 'gallery':
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.4,
          selectionLimit: 1,
          allowsEditing: true,
          aspect: [1, 1],
        })

        if (result.canceled) return

        setAvatar(result.assets[0])

        break
    }
  }

  const handleRequestPermissions = async () => {
    setNotificationsEnabled(true)

    await registerForPushNotifications(profile?.id!)

    const status = await checkPermissions()

    if (status === 'granted') {
      setNotificationsEnabled(true)

      return
    }

    setNotificationsEnabled(false)
  }

  const isDismissReady = username.trim() && (avatar?.uri || profile?.avatar_url)
  const profileAvatarUrl =
    profile?.avatar_url === PLACEHOLDER_AVATAR_URL ? null : profile?.avatar_url

  return (
    <Modal visible={isVisible} onDismiss={onDismiss} animationType="fade">
      <View className="flex-1 bg-background">
        <Carousel
          slides={[
            {
              id: 'username',
              title: 'Enter your username.',
              subtitle: 'This will be used to identify you in the app.',
              mediaPosition: 'bottom',
              backgroundImage: require('@/assets/images/onboarding-background-1.png'),
              actionDisabled: !username.trim(),
              onActionPress: async (onPress: () => void) => {
                await submitUsername(onPress)
              },
              media: (
                <BlurView
                  tint="systemChromeMaterialDark"
                  intensity={60}
                  className="flex-row items-center justify-center px-4 rounded-3xl overflow-hidden"
                  style={{ width: Dimensions.get('window').width * 0.9 }}>
                  <TextInput
                    ref={usernameInput}
                    placeholder="@username"
                    value={username}
                    onChangeText={handleUsernameChange}
                    maxLength={USERNAME_MAX_LENGTH}
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect={false}
                    className="text-text text-center h-20 w-full"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    style={{
                      fontSize: 28,
                      color: Colors.text,
                    }}
                  />
                </BlurView>
              ),
            },
            {
              id: 'avatar',
              title: 'Add a profile picture.',
              subtitle: 'Let your people know how do you look like.',
              actionLabel: isLoading ? 'Preparing...' : 'Continue',
              onActionPress: async (onPress: () => void) => {
                await submitProfileAvatar(onPress)
              },
              backgroundImage: require('@/assets/images/onboarding-background-3.png'),
              mediaPosition: 'bottom',
              actionDisabled: isLoading || (!avatar?.uri && !profileAvatarUrl),
              media: (
                <TouchableOpacity>
                  <ContextMenu
                    itemId={1}
                    shouldOpenOnLongPress={false}
                    actions={[
                      {
                        id: 'camera',
                        title: 'Take a photo',
                        image: Platform.select({
                          ios: 'camera',
                          android: 'ic_menu_camera',
                        }),
                        imageColor: Colors.text,
                      },
                      {
                        id: 'gallery',
                        title: 'Choose from gallery',
                        image: Platform.select({
                          ios: 'photo',
                          android: 'ic_menu_gallery',
                        }),
                        imageColor: Colors.text,
                      },
                    ]}
                    onPress={handleContextMenuPress}>
                    <View className="size-32 items-center justify-center rounded-full border border-dashed border-white">
                      {avatar?.uri || profileAvatarUrl ? (
                        <Image
                          source={{ uri: avatar?.uri || profileAvatarUrl! }}
                          className="size-32 rounded-full border-2 border-white"
                        />
                      ) : (
                        <Ionicons name="camera" size={36} color={Colors.text} />
                      )}
                    </View>
                  </ContextMenu>
                </TouchableOpacity>
              ),
            },
            {
              id: 'notifications',
              title: 'Enable notifications.',
              subtitle: 'Know when your friends post something new.',
              actionLabel: notificationsEnabled ? 'Start Exploring' : 'Not now',
              onActionPress: onDismiss,
              actionDisabled: !isDismissReady,
              mediaPosition: 'bottom',
              backgroundImage: require('@/assets/images/onboarding-background-4.png'),
              media: (
                <BlurView
                  intensity={80}
                  tint="systemChromeMaterialDark"
                  className="p-4 rounded-3xl overflow-hidden"
                  style={{ width: Dimensions.get('window').width * 0.8 }}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="notifications" size={24} color={Colors.text} />
                      <Text>Notifications</Text>
                    </View>
                    <Switch
                      ios_backgroundColor={Colors.muted}
                      value={notificationsEnabled}
                      onValueChange={handleRequestPermissions}
                    />
                  </View>
                </BlurView>
              ),
            },
          ]}
        />
      </View>
    </Modal>
  )
}

export default Onboarding
