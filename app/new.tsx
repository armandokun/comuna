/* eslint-disable react/no-unstable-nested-components */
import { BlurView } from 'expo-blur'
import {
  Alert,
  Image,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Modal,
  ActivityIndicator,
} from 'react-native'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

import { LinearGradient } from 'expo-linear-gradient'

import { supabase } from '@/libs/supabase'
import TextArea from '@/components/ui/TextArea'
import Spacer from '@/components/ui/Spacer'
import Button from '@/components/ui/Button'
import Text from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { HOME } from '@/constants/routes'
import KeyboardDismissPressable from '@/components/ui/KeyboardDismissPressable'

const NewScreen = () => {
  const [description, setDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const { imageUrl } = useLocalSearchParams()
  const navigation = useNavigation()

  const uploadPost = useCallback(async () => {
    setIsUploading(true)

    const { error } = await supabase.from('posts').insert({
      image_url: imageUrl,
      description,
    })

    if (error) Alert.alert('Error uploading image', error.message)

    setIsUploading(false)

    router.replace(HOME)
  }, [description, imageUrl])

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <Button title="Upload" onPress={uploadPost} />,
      headerLeft: () => <Button title="Cancel" type="flat" onPress={() => navigation.goBack()} />,
      headerBackground: () => (
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.8)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      ),
    })
  }, [navigation, uploadPost])

  return (
    <>
      <Animated.Image
        key={imageUrl.toString()}
        source={{ uri: imageUrl.toString() }}
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        style={StyleSheet.absoluteFill}
      />
      <BlurView
        intensity={80}
        tint="systemChromeMaterialDark"
        style={StyleSheet.absoluteFill}
        className="absolute w-full h-full"
      />
      <KeyboardDismissPressable>
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={160}
          className="flex-1 mx-4 justify-center">
          <Image
            source={{ uri: imageUrl.toString() }}
            resizeMode="cover"
            className="aspect-square rounded-3xl"
          />
          <Spacer />
          <TextArea
            value={description}
            onChangeText={setDescription}
            placeholder="What's on your mind?"
            style={{ fontSize: 22, color: Colors.text }}
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            className="h-[100px]"
          />
        </KeyboardAvoidingView>
      </KeyboardDismissPressable>
      <Modal transparent animationType="fade" visible={isUploading}>
        <BlurView className="absolute top-0 left-0 right-0 bottom-0" intensity={50}>
          <View className="justify-center items-center flex-1">
            <ActivityIndicator size="large" />
            <Text>Uploading...</Text>
          </View>
        </BlurView>
      </Modal>
    </>
  )
}

export default NewScreen
