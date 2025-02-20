/* eslint-disable react/no-unstable-nested-components */
import { useEffect, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  SafeAreaView,
  TextInput,
  TextInputChangeEventData,
  View,
} from 'react-native'
import { router, useNavigation } from 'expo-router'
import { BlurView } from 'expo-blur'

import { Ionicons } from '@expo/vector-icons'

import Text from '@/components/ui/Text'
import Button from '@/components/ui/Button'
import Spacer from '@/components/ui/Spacer'
import { Colors } from '@/constants/colors'
import { supabase } from '@/libs/supabase'
import KeyboardDismissPressable from '@/components/ui/KeyboardDismissPressable'
import FullScreenLoader from '@/components/FullScreenLoader'

const NewCommunityScreen = () => {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigation = useNavigation()

  useEffect(() => {
    const handleCreateCommunity = async () => {
      if (!name || name.length < 3) return

      setIsLoading(true)

      const { data, error } = await supabase
        .from('communities')
        .insert({
          name,
        })
        .select()
        .single()

      if (error) Alert.alert('Error', error.message)

      if (data) router.replace(`/home`) // TODO: push to community

      setIsLoading(false)
    }

    navigation.setOptions({
      headerRight: () => <Button title="Create" onPress={handleCreateCommunity} />,
      headerLeft: () => <Button title="Cancel" type="flat" onPress={() => navigation.goBack()} />,
    })
  }, [name, navigation])

  const handleNameChange = (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
    const { text } = e.nativeEvent

    // remove all non-alphanumeric characters and spaces
    const cleanedText = text.replace(/[^a-zA-Z0-9]/g, '')

    setName(cleanedText)
  }

  return (
    <>
      <BlurView intensity={80} tint="systemChromeMaterialDark" className="flex-1">
        <SafeAreaView className="flex-1">
          <KeyboardDismissPressable>
            <KeyboardAvoidingView behavior="padding" className="flex-1">
              <View className="flex-1 items-center justify-center px-4">
                <Ionicons name="people" size={100} color="rgba(255, 255, 255, 0.7)" />
                <Text type="title1">Create a Comuna</Text>
                <Spacer size="xxsmall" />
                <Text
                  type="subhead"
                  className="text-center"
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  A comuna is a group of people who share a common interest.
                </Text>
                <Spacer size="large" />
                <View className="flex-row items-center justify-center px-4">
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
                </View>
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
