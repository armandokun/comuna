/* eslint-disable react/no-unstable-nested-components */
import { BlurView } from 'expo-blur'
import { Alert, StyleSheet, KeyboardAvoidingView, SafeAreaView } from 'react-native'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Image } from 'expo-image'

import mixpanel from '@/libs/mixpanel'
import { supabase } from '@/libs/supabase'
import { mmkvStorage } from '@/libs/mmkv'
import { Colors } from '@/constants/colors'
import { REFRESH_POSTS_KEY } from '@/constants/async-storage'
import { CommunityContext } from '@/containers/CommunityProvider'

import TextArea from '@/components/ui/TextArea'
import Spacer from '@/components/ui/Spacer'
import Button from '@/components/ui/Button'
import KeyboardDismissPressable from '@/components/ui/KeyboardDismissPressable'
import FullScreenLoader from '@/components/FullScreenLoader'

const NewScreen = () => {
  const [description, setDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const { imageUrl } = useLocalSearchParams()
  const navigation = useNavigation()
  const { selectedComuna } = useContext(CommunityContext)

  const uploadPost = useCallback(async () => {
    setIsUploading(true)

    try {
      const { data, error: blurhashError } = await supabase.functions.invoke<{ blurhash: string }>(
        'generate-blurhash',
        {
          body: { imageUrl },
        },
      )

      if (blurhashError) Alert.alert('Error generating blurhash', blurhashError.message)

      const { data: postData, error } = await supabase
        .from('posts')
        .insert({
          image_url: imageUrl.toString(),
          description,
          image_blurhash: data?.blurhash,
          community_id: selectedComuna?.id,
        })
        .select('id')
        .single()

      if (error) Alert.alert('Error uploading image', error.message)

      setIsUploading(false)

      mixpanel.track('Engage', {
        'Content Type': 'Post',
        'Engagement Type': 'New Post',
        'Post Id': postData?.id,
      })

      mmkvStorage.set(REFRESH_POSTS_KEY, true)

      router.back()
    } catch (error) {
      setIsUploading(false)

      Alert.alert('Error uploading image', (error as Error).message)
    }
  }, [description, imageUrl, selectedComuna?.id])

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <Button title="Post" onPress={uploadPost} />,
      headerLeft: () => <Button title="Cancel" type="flat" onPress={() => navigation.goBack()} />,
    })
  }, [navigation, uploadPost])

  return (
    <>
      <Image
        source={{ uri: `${imageUrl.toString()}?quality=50&width=500&height=500` }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <BlurView intensity={80} tint="systemChromeMaterialDark" style={StyleSheet.absoluteFill} />
      <SafeAreaView style={StyleSheet.absoluteFill}>
        <KeyboardAvoidingView
          behavior="position"
          keyboardVerticalOffset={-50}
          className="flex-1 mx-4">
          <KeyboardDismissPressable>
            <Image
              source={{ uri: imageUrl.toString() }}
              contentFit="cover"
              style={{
                aspectRatio: 9 / 14,
                borderRadius: 32,
                width: '80%',
                margin: 'auto',
              }}
            />
            <Spacer />
            <TextArea
              value={description}
              onChangeText={setDescription}
              placeholder="What's on your mind?"
              style={{ fontSize: 22, color: Colors.text }}
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              className="h-[100px] text-center"
            />
          </KeyboardDismissPressable>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <FullScreenLoader show={isUploading} title="Posting..." />
    </>
  )
}

export default NewScreen
