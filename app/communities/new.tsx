/* eslint-disable react/no-unstable-nested-components */
import { useContext, useEffect, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TextInputChangeEventData,
  View,
} from 'react-native'
import { router, useNavigation } from 'expo-router'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Image } from 'expo-image'

import { supabase } from '@/libs/supabase'
import { SELECTED_COMMUNITY_KEY } from '@/constants/async-storage'
import { CommunityContext } from '@/containers/CommunityProvider'

import Text from '@/components/ui/Text'
import Button from '@/components/ui/Button'
import Spacer from '@/components/ui/Spacer'
import { Colors } from '@/constants/colors'
import KeyboardDismissPressable from '@/components/ui/KeyboardDismissPressable'
import FullScreenLoader from '@/components/FullScreenLoader'

const NewCommunityScreen = () => {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { setSelectedComuna, setComunas, comunas } = useContext(CommunityContext)

  const navigation = useNavigation()

  useEffect(() => {
    const handleCreateCommunity = async () => {
      if (!name || name.length < 3) return

      setIsLoading(true)

      const communityName = name.trim().toLowerCase()

      const { data, error } = await supabase
        .from('communities')
        .insert({
          name: communityName,
        })
        .select()
        .single()

      if (error) Alert.alert('Error', error.message)

      if (data) {
        await AsyncStorage.setItem(SELECTED_COMMUNITY_KEY, data.id.toString())

        setSelectedComuna(data)
        setComunas([...comunas, data])

        setIsLoading(false)

        router.back()

        return
      }

      setIsLoading(false)
    }

    navigation.setOptions({
      headerRight: () => <Button title="Create" onPress={handleCreateCommunity} />,
      headerLeft: () => <Button title="Cancel" type="flat" onPress={() => navigation.goBack()} />,
    })
  }, [comunas, name, navigation, setComunas, setSelectedComuna])

  const handleNameChange = (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
    const { text } = e.nativeEvent

    // remove all non-alphanumeric characters and spaces
    const cleanedText = text.replace(/[^a-zA-Z0-9]/g, '')

    setName(cleanedText)
  }

  return (
    <>
      <Image
        source={require('@/assets/images/onboarding-background.png')}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />
      <BlurView
        intensity={80}
        tint="systemChromeMaterialDark"
        className="flex-1"
        style={StyleSheet.absoluteFillObject}>
        <SafeAreaView className="flex-1">
          <KeyboardDismissPressable>
            <KeyboardAvoidingView
              behavior="padding"
              className="flex-1"
              keyboardVerticalOffset={100}>
              <View className="flex-1 items-center justify-center px-4">
                <Ionicons name="people-circle-outline" size={100} color="white" />
                <Text type="title1">Create a Comuna</Text>
                <Spacer size="xxsmall" />
                <Text
                  type="subhead"
                  className="text-center"
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  A comuna is a group of people who share a common interest.
                </Text>
                <Spacer size="large" />
                <BlurView
                  tint="systemChromeMaterialDark"
                  intensity={60}
                  className="flex-row items-center justify-center px-4 rounded-3xl w-full overflow-hidden">
                  <TextInput
                    className="text-center h-20"
                    style={{ fontSize: 36, color: 'rgba(255, 255, 255, 0.7)' }}
                    placeholder="#"
                    editable={false}
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  />
                  <TextInput
                    placeholder="comuna"
                    value={name}
                    onChange={handleNameChange}
                    maxLength={20}
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect={false}
                    className="text-text text-center h-20"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    style={{ fontSize: 36, color: Colors.text }}
                  />
                </BlurView>
              </View>
            </KeyboardAvoidingView>
          </KeyboardDismissPressable>
        </SafeAreaView>
      </BlurView>
      <FullScreenLoader show={isLoading} title="Creating Comuna..." />
    </>
  )
}

export default NewCommunityScreen
