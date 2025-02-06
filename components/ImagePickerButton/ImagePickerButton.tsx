import { Alert, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { faker } from '@faker-js/faker'
import { decode } from 'base64-arraybuffer'
import * as FileSystem from 'expo-file-system'

import { supabase } from '@/libs/supabase'

const ImagePickerButton = () => {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
    })

    if (!result.canceled) {
      const file = result.assets[0]
      const fileName = `${Date.now()}-${file.fileName}`

      const base64Data = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      })

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

      const { data, error } = await supabase.from('posts').insert({
        image_url: publicUrl,
        description: faker.lorem.sentences({ min: 1, max: 3 }),
      })

      if (error) {
        Alert.alert('Error uploading image', error.message)
      }

      if (data) {
        Alert.alert('Image uploaded successfully')
      }
    }
  }

  return (
    <TouchableOpacity onPress={pickImage}>
      <Ionicons name="add-circle" size={48} color="white" />
    </TouchableOpacity>
  )
}

export default ImagePickerButton
