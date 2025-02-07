import { ActivityIndicator, Alert, Modal, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { decode } from 'base64-arraybuffer'
import * as FileSystem from 'expo-file-system'
import { router } from 'expo-router'
import { useState } from 'react'
import { BlurView } from 'expo-blur'

import { supabase } from '@/libs/supabase'
import { NEW } from '@/constants/routes'
import Text from '@/components/ui/Text'

const ImagePickerButton = () => {
  const [isLoading, setIsLoading] = useState(false)

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.5,
      selectionLimit: 1,
    })

    try {
      if (!result.canceled) {
        const file = result.assets[0]
        const fileName = `${Date.now()}-${file.fileName}`

        const base64Data = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        })

        setIsLoading(true)

        const { error: uploadError } = await supabase.storage
          .from('user_content')
          .upload(fileName, decode(base64Data), {
            contentType: file.mimeType,
          })

        if (uploadError) {
          Alert.alert('Error uploading image', uploadError.message)
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('user_content').getPublicUrl(fileName)

        setIsLoading(false)

        if (publicUrl) router.push({ pathname: NEW, params: { imageUrl: publicUrl } })
      }
    } catch (error) {
      Alert.alert('Error picking image', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <TouchableOpacity onPress={pickImage}>
        <Ionicons name="add-circle" size={48} color="white" />
      </TouchableOpacity>
      <Modal transparent animationType="fade" visible={isLoading}>
        <BlurView className="absolute top-0 left-0 right-0 bottom-0" intensity={50}>
          <View className="justify-center items-center flex-1">
            <ActivityIndicator size="large" />
            <Text>Loading...</Text>
          </View>
        </BlurView>
      </Modal>
    </>
  )
}

export default ImagePickerButton
