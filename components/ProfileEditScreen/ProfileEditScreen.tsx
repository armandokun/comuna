import { useContext, useState } from 'react'
import { View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView } from 'react-native'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { decode } from 'base64-arraybuffer'

import { supabase } from '@/libs/supabase'
import { Colors } from '@/constants/colors'
import { SessionContext } from '@/containers/SessionProvider'
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from '@/constants/profile'

import Button from '@/components/ui/Button'
import Spacer from '@/components/ui/Spacer'

import Label from '../ui/Label'
import KeyboardDismissPressable from '../ui/KeyboardDismissPressable'

const ProfileEditScreen = () => {
  const [loading, setLoading] = useState(false)

  const { profile } = useContext(SessionContext)

  const [username, setUsername] = useState(profile?.username || '')
  const [name, setName] = useState<string | null>(profile?.name || null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null)
  const [newAvatarAsset, setNewAvatarAsset] = useState<ImagePicker.ImagePickerAsset | null>(null)

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    })

    if (result.canceled) return

    setNewAvatarAsset(result.assets[0])
  }

  const uploadAvatar = async () => {
    if (!newAvatarAsset) return

    const fileName = `${Date.now()}-${newAvatarAsset.uri.split('/').pop()}`
    const base64Data = newAvatarAsset.base64

    if (!base64Data) {
      Alert.alert('Error uploading image', 'No base64 data found')

      return
    }

    const { error: storageError } = await supabase.storage
      .from('avatars')
      .upload(fileName, decode(base64Data), {
        contentType: newAvatarAsset.mimeType,
        cacheControl: '3600', // 1 hour
        upsert: true,
      })

    if (storageError) {
      Alert.alert('Error uploading image', storageError.message)

      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(fileName)

    return publicUrl
  }

  const isUsernameChanged = profile?.username !== username
  const isNameChanged = profile?.name !== name
  const isAvatarChanged = profile?.avatar_url !== avatarUrl || newAvatarAsset
  const isAnyFieldChanged = isUsernameChanged || isNameChanged || isAvatarChanged

  const handleSave = async () => {
    if (!profile?.id) return
    if (!isAnyFieldChanged) return

    setLoading(true)

    if (isUsernameChanged) {
      if (username.length < USERNAME_MIN_LENGTH) {
        Alert.alert('Username must be at least 4 characters long')

        setLoading(false)

        return
      }

      const { data: existingUser, error: existingUserError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)

      if (existingUserError) {
        Alert.alert('Error checking username', existingUserError.message)

        setLoading(false)

        return
      }

      if (existingUser?.length > 0) {
        Alert.alert('Username already taken', 'Please choose another username')

        setLoading(false)

        return
      }
    }

    if (isNameChanged) {
      if (name && name.length < NAME_MIN_LENGTH) {
        Alert.alert('Name must be at least 3 characters long')

        setLoading(false)

        return
      }
    }

    try {
      const newAvatarPublicUrl = await uploadAvatar()

      const { error } = await supabase
        .from('profiles')
        .update({ username, name, avatar_url: newAvatarPublicUrl })
        .eq('id', profile?.id)

      if (error) Alert.alert('Error updating profile', error.message)

      setLoading(false)
      setUsername(username)
      setName(name)
      setAvatarUrl(newAvatarPublicUrl || '')
      setNewAvatarAsset(null)

      Alert.alert('Profile updated', 'Your profile has been updated successfully')
    } catch (error) {
      Alert.alert('Error updating profile', (error as Error).message)

      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1">
      <KeyboardDismissPressable>
        <View className="px-4 mt-8">
          <View className="items-center">
            <TouchableOpacity onPress={handlePickImage}>
              <Image
                source={{ uri: newAvatarAsset?.uri || avatarUrl }}
                contentFit="cover"
                style={{ width: 100, height: 100, borderRadius: 50 }}
              />
              <View className="absolute bottom-0 right-0 bg-white rounded-full p-1">
                <Ionicons name="camera" size={20} color={Colors.background} />
              </View>
            </TouchableOpacity>
          </View>
          <View className="mt-8">
            <Label title="Username" />
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              value={username}
              maxLength={USERNAME_MAX_LENGTH}
              onChangeText={setUsername}
              placeholder="username"
              placeholderTextColor={Colors.muted}
              className="bg-white/10 p-4 rounded-xl text-white mb-4 text-body"
            />
            <Spacer />
            <Label title="Full Name" />
            <TextInput
              autoCorrect={false}
              autoCapitalize="words"
              value={name || ''}
              onChangeText={setName}
              placeholder="Full Name"
              maxLength={NAME_MAX_LENGTH}
              placeholderTextColor={Colors.muted}
              className="bg-white/10 p-4 rounded-xl text-white mb-8 text-body"
            />
            <Button
              onPress={handleSave}
              disabled={loading || !isAnyFieldChanged}
              size="medium"
              title={loading ? 'Saving...' : 'Save Changes'}
            />
          </View>
        </View>
      </KeyboardDismissPressable>
    </KeyboardAvoidingView>
  )
}

export default ProfileEditScreen
