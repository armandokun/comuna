import { View, TouchableOpacity, Alert, Share } from 'react-native'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { useEffect, useState, useContext, useCallback } from 'react'
import Animated, {
  withTiming,
  useSharedValue,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated'

import { supabase } from '@/libs/supabase'
import { generateLinkHash } from '@/libs/crypto'
import { Colors } from '@/constants/colors'
import { COMUNA_APP_URL } from '@/constants/url'
import { CommunityContext } from '@/containers/CommunityProvider'

import Spacer from '../ui/Spacer'
import Text from '../ui/Text'

const InviteLinkSection = () => {
  const [inviteLink, setInviteLink] = useState('')
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [showCopySuccess, setShowCopySuccess] = useState(false)

  const { selectedComuna } = useContext(CommunityContext)
  const refreshIconRotation = useSharedValue(0)

  useEffect(() => {
    if (!isGeneratingLink) {
      if (refreshIconRotation.value !== 0) {
        refreshIconRotation.value = withTiming(0, {
          duration: 250,
          easing: Easing.linear,
        })
      }
      return
    }

    refreshIconRotation.value = withTiming(360, {
      duration: 250,
      easing: Easing.linear,
    })
  }, [isGeneratingLink, refreshIconRotation])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${refreshIconRotation.value}deg` }],
  }))

  const generateInviteLink = useCallback(async () => {
    if (!selectedComuna?.id) return

    setIsGeneratingLink(true)

    const linkHash = generateLinkHash()

    const { data: newLink, error: newLinkError } = await supabase
      .from('community_invite_links')
      .insert({ community_id: selectedComuna?.id, link_hash: linkHash })
      .select('*')
      .single()

    if (newLinkError) Alert.alert('Error generating invite link', newLinkError.message)

    if (newLink) {
      const link = `${COMUNA_APP_URL}/invite/${linkHash}`

      setInviteLink(link)
    }

    setIsGeneratingLink(false)
  }, [selectedComuna?.id])

  useEffect(() => {
    if (!selectedComuna?.id) return

    const fetchInviteLink = async () => {
      const { data, error } = await supabase
        .from('community_invite_links')
        .select('*')
        .eq('community_id', selectedComuna?.id)
        .eq('is_active', true)

      if (error) {
        Alert.alert('Error fetching invite link', error.message)

        return
      }

      if (!data?.length) {
        generateInviteLink()

        return
      }

      const link = `${COMUNA_APP_URL}/invite/${data[0]?.link_hash}`

      setInviteLink(link)
    }

    fetchInviteLink()
  }, [generateInviteLink, selectedComuna?.id])

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(inviteLink)

    setShowCopySuccess(true)

    setTimeout(() => {
      setShowCopySuccess(false)
    }, 2000)
  }

  const handleShareLink = async () => {
    await Share.share({
      url: inviteLink,
    })
  }

  return (
    <>
      <Text
        type="footnote"
        style={{
          textTransform: 'uppercase',
          color: 'rgba(255, 255, 255, 0.7)',
          fontWeight: 400,
          marginLeft: 16,
          marginBottom: 8,
          flex: 1,
        }}>
        Invite others
      </Text>
      <BlurView tint="light" intensity={30} className="rounded-xl w-full p-4 overflow-hidden">
        <BlurView tint="dark" className="flex-row gap-2 p-2 rounded-xl overflow-hidden">
          <Text type="body" truncate style={{ color: Colors.muted }} className="flex-1">
            {inviteLink || 'Generating link...'}
          </Text>
          <TouchableOpacity onPress={() => generateInviteLink()}>
            <Animated.View style={animatedStyle}>
              <Ionicons name="refresh" size={22} color={Colors.text} />
            </Animated.View>
          </TouchableOpacity>
        </BlurView>
        <Spacer size="xsmall" />
        <View className="flex-row w-full gap-4">
          <TouchableOpacity className="flex-1" onPress={handleCopyLink}>
            <BlurView
              tint="dark"
              className="rounded-full py-2 px-4 flex-row items-center justify-center gap-2 overflow-hidden">
              <Ionicons
                name={showCopySuccess ? 'checkmark' : 'link'}
                size={22}
                color={Colors.text}
              />
              <Text type="callout" style={{ fontWeight: '600', color: Colors.text }}>
                Copy link
              </Text>
            </BlurView>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1" onPress={handleShareLink}>
            <BlurView
              tint="dark"
              className="rounded-full py-2 px-4 flex-row items-center justify-center gap-2 overflow-hidden">
              <Ionicons name="share" size={22} color={Colors.text} />
              <Text type="callout" style={{ fontWeight: '600', color: Colors.text }}>
                Share a link
              </Text>
            </BlurView>
          </TouchableOpacity>
        </View>
      </BlurView>
      <Spacer size="xsmall" />
      <View className="pl-4">
        <Text type="footnote" style={{ color: Colors.muted }}>
          By regenerating the invite link, the previous ones will be deactivated.
        </Text>
      </View>
    </>
  )
}

export default InviteLinkSection
