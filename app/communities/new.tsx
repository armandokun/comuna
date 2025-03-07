/* eslint-disable react/no-unstable-nested-components */
import { useContext, useEffect, useState, useRef } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Platform,
} from 'react-native'
import { router, useNavigation } from 'expo-router'
import { BlurView } from 'expo-blur'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { supabase } from '@/libs/supabase'
import { Colors } from '@/constants/colors'
import { SELECTED_COMMUNITY_KEY } from '@/constants/async-storage'
import { CommunityContext } from '@/containers/CommunityProvider'

import Text from '@/components/ui/Text'
import Button from '@/components/ui/Button'
import Spacer from '@/components/ui/Spacer'
import KeyboardDismissPressable from '@/components/ui/KeyboardDismissPressable'
import FullScreenLoader from '@/components/FullScreenLoader'
import AnimatedMemberCircle from '@/components/AnimatedMemberCircle'

const NewCommunityScreen = () => {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [memberAvatarUrls, setMemberAvatarUrls] = useState<Array<string>>([])

  const scrollViewRef = useRef<ScrollView>(null)
  const { setSelectedComuna, setComunas, comunas } = useContext(CommunityContext)
  const navigation = useNavigation()

  useEffect(() => {
    const fetchMemberAvatarUrls = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .not('avatar_url', 'is', null)
        .limit(25)
        .order('created_at', { ascending: false })

      if (error) Alert.alert('Error fetching member avatar urls', error.message)

      if (data) setMemberAvatarUrls(data.map((member) => member.avatar_url || ''))
    }

    fetchMemberAvatarUrls()
  }, [])

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

  const handleNameChange = (text: string) => {
    // remove all non-alphanumeric characters and spaces
    const cleanedText = text.replace(/[^a-zA-Z0-9]/g, '')

    setName(cleanedText)
  }

  const handleInputFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 50)
  }

  return (
    <>
      <BlurView intensity={80} tint="systemChromeMaterialDark" style={StyleSheet.absoluteFill} />
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
          keyboardVerticalOffset={100}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled">
            <KeyboardDismissPressable>
              <View className="items-center mt-10 px-4">
                <AnimatedMemberCircle memberAvatarUrls={memberAvatarUrls} />
                <Spacer size="medium" />
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
                    onChangeText={handleNameChange}
                    maxLength={20}
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect={false}
                    className="text-text text-center h-20"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    style={{ fontSize: 36, color: Colors.text }}
                    onFocus={handleInputFocus}
                  />
                </BlurView>
              </View>
            </KeyboardDismissPressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <FullScreenLoader show={isLoading} title="Creating Comuna..." />
    </>
  )
}

export default NewCommunityScreen
