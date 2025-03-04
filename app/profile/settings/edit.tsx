import { useContext, useState } from 'react'
import { View, TextInput, TouchableOpacity, Alert, SafeAreaView } from 'react-native'
import { Image } from 'expo-image'
import { BlurView } from 'expo-blur'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'

import { supabase } from '@/libs/supabase'
import { Colors } from '@/constants/colors'
import Text from '@/components/ui/Text'
import { PROFILE_SETTINGS } from '@/constants/routes'
import { SessionContext } from '@/containers/SessionProvider'
import Button from '@/components/ui/Button'
import Spacer from '@/components/ui/Spacer'

const ProfileEdit = () => {
  const { profile } = useContext(SessionContext)

  const [username, setUsername] = useState(profile?.username || '')
  const [name, setName] = useState(profile?.name || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')

  const [loading, setLoading] = useState(false)

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    })

    if (!result.canceled) {
      setAvatarUrl(result.assets[0].uri)
    }
  }

  const handleSave = async () => {
    if (!profile?.id) return

    setLoading(true)

    try {
      let finalAvatarUrl = avatarUrl

      // Upload new avatar if changed
      if (avatarUrl && !avatarUrl.startsWith('http')) {
        const response = await fetch(avatarUrl)
        const blob = await response.blob()
        const fileExt = avatarUrl.split('.').pop()
        const fileName = `${profile.id}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, blob, { upsert: true })

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(fileName)

        finalAvatarUrl = publicUrl
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          name,
          avatar_url: finalAvatarUrl,
        })
        .eq('id', profile.id)

      if (error) throw error

      router.replace(PROFILE_SETTINGS)
    } catch (error: any) {
      Alert.alert('Error updating profile', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BlurView tint="systemChromeMaterialDark" intensity={80} className="flex-1">
      <SafeAreaView className="flex-1">
        <View className="px-4">
          <View className="items-center mt-8">
            <TouchableOpacity onPress={handlePickImage}>
              <View className="relative">
                <Image
                  source={{ uri: avatarUrl }}
                  contentFit="cover"
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                />
                <View className="absolute bottom-0 right-0 bg-white rounded-full p-1">
                  <Ionicons name="camera" size={20} color={Colors.background} />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View className="mt-8">
            <Text type="subhead" className="mb-2">
              Username
            </Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor={Colors.muted}
              className="bg-white/10 p-4 rounded-xl text-white mb-4 text-body"
            />
            <Spacer />
            <Text type="subhead" className="mb-2">
              Full Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Full Name"
              placeholderTextColor={Colors.muted}
              className="bg-white/10 p-4 rounded-xl text-white mb-8 text-body"
            />

            <Button
              onPress={handleSave}
              disabled={loading}
              size="medium"
              title={loading ? 'Saving...' : 'Save Changes'}
            />
          </View>
        </View>
      </SafeAreaView>
    </BlurView>
  )
}

export default ProfileEdit
