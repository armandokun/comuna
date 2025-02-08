import { Modal, View, Dimensions, TextInput, Alert, Image, TouchableOpacity } from 'react-native'
import { useContext, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { ImagePickerAsset } from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { decode } from 'base64-arraybuffer'

import Carousel from '@/components/ui/Carousel'

import { Colors } from '@/constants/colors'
import { SessionContext } from '@/container/SessionProvider'
import { supabase } from '@/libs/supabase'

type Props = {
  isVisible: boolean
  onDismiss: () => void
}

const Onboarding = ({ isVisible, onDismiss }: Props) => {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<ImagePickerAsset | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { profile } = useContext(SessionContext)

  const submitProfileDetails = async () => {
    if (!name.trim().includes(' ') || !avatar?.uri) return

    setIsLoading(true)

    const fileName = `${Date.now()}-${avatar.fileName}`

    const base64Data = await FileSystem.readAsStringAsync(avatar.uri, {
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
      .eq('id', profile?.id)

    if (error) Alert.alert('Error updating profile details', error.message)

    setIsLoading(false)

    onDismiss()
  }

  const selectAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.4,
      selectionLimit: 1,
      allowsEditing: true,
      aspect: [1, 1],
    })

    if (result.canceled) return

    setAvatar(result.assets[0])
  }

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
              actionDisabled: !name.trim().includes(' '),
              media: (
                <TextInput
                  onChangeText={setName}
                  value={name}
                  multiline
                  numberOfLines={2}
                  className="text-center"
                  placeholder="Elizabeth Sobeck"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  style={{
                    fontSize: 36,
                    fontWeight: 'bold',
                    color: Colors.text,
                    width: Dimensions.get('window').width * 0.8,
                  }}
                />
              ),
            },
            {
              title: 'Add a profile picture.',
              subtitle: 'Let your people know how do you look like.',
              actionLabel: isLoading ? 'Preparing...' : 'Start Exploring',
              onActionPress: submitProfileDetails,
              mediaPosition: 'bottom',
              actionDisabled: isLoading || !avatar?.uri,
              media: (
                <TouchableOpacity
                  className="size-32 items-center justify-center rounded-full border border-dashed border-white"
                  onPress={selectAvatar}>
                  {avatar ? (
                    <Image
                      source={{ uri: avatar.uri }}
                      className="size-32 rounded-full border-2 border-white"
                    />
                  ) : (
                    <Ionicons name="camera" size={36} color={Colors.text} />
                  )}
                </TouchableOpacity>
              ),
            },
          ]}
        />
      </View>
    </Modal>
  )
}

export default Onboarding
