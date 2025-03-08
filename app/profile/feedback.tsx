import React, { useRef, useState } from 'react'
import { Alert, SafeAreaView, TextInput, View } from 'react-native'
import { BlurView } from 'expo-blur'
import { nativeApplicationVersion, nativeBuildVersion } from 'expo-application'

import { supabase } from '@/libs/supabase'
import { Colors } from '@/constants/colors'

import Spacer from '@/components/ui/Spacer'
import Tabs from '@/components/ui/Tabs'
import TextArea from '@/components/ui/TextArea'
import Button from '@/components/ui/Button'
import KeyboardDismissPressable from '@/components/ui/KeyboardDismissPressable'
import FullScreenLoader from '@/components/FullScreenLoader'

const FeedbackScreen = () => {
  const [feedbackInput, setFeedbackInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  const textAreaRef = useRef<TextInput>(null)

  const TABS = [
    {
      type: 'bug',
      title: 'Bug Report',
      content: (
        <TextArea
          forwardRef={textAreaRef}
          placeholder="Tell us what happened - the more detail the better!"
          value={feedbackInput}
          style={{
            color: Colors.text,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            maxHeight: 200,
            minHeight: 100,
            borderRadius: 16,
            padding: 16,
          }}
          onChangeText={setFeedbackInput}
        />
      ),
    },
    {
      type: 'feature',
      title: 'Feature Request',
      content: (
        <TextArea
          forwardRef={textAreaRef}
          placeholder="How we can make the Sobeck app even better for you?"
          value={feedbackInput}
          style={{
            color: Colors.text,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            maxHeight: 200,
            minHeight: 100,
            borderRadius: 16,
            padding: 16,
          }}
          onChangeText={setFeedbackInput}
        />
      ),
    },
  ]

  const handleSubmit = async () => {
    if (!textAreaRef.current) return

    if (!feedbackInput) return Alert.alert('Feedback is empty', 'Some context would be nice!')

    if (feedbackInput.length < 10) {
      Alert.alert('Feedback too short', 'Make it as detailed as possible. It helps us a lot!')

      return
    }

    setIsLoading(true)

    const { error } = await supabase.from('feedback').insert({
      type: TABS[activeTabIndex].type,
      feedback: feedbackInput,
      version: nativeApplicationVersion,
      build: nativeBuildVersion,
    })

    if (error) {
      setIsLoading(false)

      Alert.alert('Failed to submit', error.message)

      return
    }

    setIsLoading(false)
    setFeedbackInput('')

    setTimeout(() => Alert.alert('Feedback submitted ✅', 'Thank you for your feedback!'), 500)
  }

  return (
    <BlurView tint="systemChromeMaterialDark" intensity={80} className="px-4 mb-4 flex-1">
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-4">
          <KeyboardDismissPressable>
            <Spacer size="medium" />
            <Tabs
              activeIndex={activeTabIndex}
              onTabChange={(index) => setActiveTabIndex(index)}
              tabs={TABS}
            />
            <Spacer />
            <View className="flex-row justify-end">
              <Button title="Submit" onPress={handleSubmit} />
            </View>
          </KeyboardDismissPressable>
        </View>
        <FullScreenLoader show={isLoading} title="Submitting..." />
      </SafeAreaView>
    </BlurView>
  )
}

export default FeedbackScreen
