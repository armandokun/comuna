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
import { SessionContext } from '@/container/SessionProvider'
import { supabase } from '@/libs/supabase'
import usePushNotifications from '@/hooks/usePushNotifications'

import Spacer from '../ui/Spacer'
import ContextMenu from '../ui/ContextMenu'

type Props = {
  isVisible: boolean
  onDismiss: () => void
}

const Onboarding = ({ isVisible, onDismiss }: Props) => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [avatar, setAvatar] = useState<ImagePickerAsset | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  const { profile } = useContext(SessionContext)
  const lastNameInput = useRef<TextInput>(null)

  const { registerForPushNotifications, checkPermissions } = usePushNotifications()

  const submitProfileDetails = async () => {
    const name = `${firstName.trim()} ${lastName.trim()}`

    if (!name.trim().includes(' ') || !avatar?.uri || !profile?.id) return

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
      .update({ name, avatar_url: publicUrl })
      .eq('id', profile.id)

    if (error) Alert.alert('Error updating profile details', error.message)

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

  const isDismissReady = firstName.trim() && lastName.trim() && avatar?.uri

  return (
    <Modal visible={isVisible} onDismiss={onDismiss} animationType="fade">
      <View className="flex-1 bg-background">
        <Carousel
          slides={[
            {
              title: 'Welcome to Comuna!',
              subtitle: 'Your shitwall is waiting for you.\nPress "Get Started" to begin.',
              actionLabel: 'Get Started',
            },
            {
              title: 'Enter your full name.',
              subtitle: 'This will be used to identify you in the app.',
              mediaPosition: 'bottom',
              actionDisabled: !firstName.trim() || !lastName.trim(),
              media: (
                <>
                  <TextInput
                    autoCorrect={false}
                    returnKeyType="next"
                    className="text-center"
                    onSubmitEditing={() => lastNameInput.current?.focus()}
                    placeholder="First Name"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={firstName}
                    onChangeText={setFirstName}
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: Colors.text,
                      width: Dimensions.get('window').width * 0.8,
                    }}
                  />
                  <Spacer />
                  <TextInput
                    ref={lastNameInput}
                    autoCorrect={false}
                    returnKeyType="done"
                    className="text-center"
                    placeholder="Last Name"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={lastName}
                    onChangeText={setLastName}
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: Colors.text,
                      width: Dimensions.get('window').width * 0.8,
                    }}
                  />
                </>
              ),
            },
            {
              title: 'Add a profile picture.',
              subtitle: 'Let your people know how do you look like.',
              actionLabel: isLoading ? 'Preparing...' : 'Continue',
              onActionPress: async () => {
                await submitProfileDetails()
              },
              mediaPosition: 'bottom',
              actionDisabled: isLoading || !avatar?.uri,
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
                      {avatar ? (
                        <Image
                          source={{ uri: avatar.uri }}
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
              title: 'Enable notifications.',
              subtitle: 'Know when your friends post something new.',
              actionLabel: notificationsEnabled ? 'Start Exploring' : 'Not now',
              onActionPress: onDismiss,
              actionDisabled: !isDismissReady,
              mediaPosition: 'bottom',
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
