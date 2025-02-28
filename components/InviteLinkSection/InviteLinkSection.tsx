import { View, TouchableOpacity, Alert, Share, Switch } from 'react-native'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { useEffect, useState, useContext, useCallback } from 'react'

import { supabase } from '@/libs/supabase'
import { generateLinkHash } from '@/libs/crypto'
import { Colors } from '@/constants/colors'
import { COMUNA_APP_URL } from '@/constants/url'
import { CommunityContext } from '@/containers/CommunityProvider'

import Spacer from '../ui/Spacer'
import Text from '../ui/Text'
import Divider from '../ui/Divider'
import Cell from '../ui/Cell'
import Label from '../ui/Label'

const InviteLinkSection = () => {
  const [inviteLink, setInviteLink] = useState('')
  const [showCopySuccess, setShowCopySuccess] = useState(false)
  const [requiresMemberApproval, setRequiresMemberApproval] = useState<boolean | null>(null)

  const { selectedComuna } = useContext(CommunityContext)

  const generateInviteLink = useCallback(async () => {
    if (!selectedComuna?.id) return

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

  useEffect(() => {
    if (!selectedComuna?.id) return

    const getIsRequiresMemberApproval = async () => {
      const { data, error } = await supabase
        .from('communities')
        .select('requires_member_approval')
        .eq('id', selectedComuna?.id)
        .single()

      if (error) {
        Alert.alert('Error fetching community settings', error.message)

        return
      }

      setRequiresMemberApproval(data?.requires_member_approval)
    }

    getIsRequiresMemberApproval()
  }, [selectedComuna?.id])

  const updateIsRequiresMemberApproval = async ({
    isRequiresMemberApproval,
  }: {
    isRequiresMemberApproval: boolean
  }) => {
    if (!selectedComuna?.id) return

    const { error } = await supabase
      .from('communities')
      .update({ requires_member_approval: isRequiresMemberApproval })
      .eq('id', selectedComuna?.id)

    if (error) Alert.alert('Error updating community settings', error.message)
  }

  const handleToggleRequiresMemberApproval = () => {
    if (requiresMemberApproval === null) return

    const isRequiresMemberApproval = !requiresMemberApproval

    setRequiresMemberApproval(isRequiresMemberApproval)

    updateIsRequiresMemberApproval({ isRequiresMemberApproval })
  }

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
      <Label title="Invite others" />
      <BlurView tint="light" intensity={30} className="rounded-xl w-full p-4 pb-2 overflow-hidden">
        <BlurView tint="dark" className="p-2 rounded-xl overflow-hidden">
          <Text type="body" truncate style={{ color: Colors.muted }} className="flex-1">
            {inviteLink || 'Generating link...'}
          </Text>
        </BlurView>
        <Spacer size="xsmall" />
        <View className="flex-row w-full gap-4">
          <TouchableOpacity className="flex-1" onPress={handleCopyLink}>
            <BlurView
              tint="light"
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
              tint="light"
              className="rounded-full py-2 px-4 flex-row items-center justify-center gap-2 overflow-hidden">
              <Ionicons name="share" size={22} color={Colors.text} />
              <Text type="callout" style={{ fontWeight: '600', color: Colors.text }}>
                Share a link
              </Text>
            </BlurView>
          </TouchableOpacity>
        </View>
        <Spacer size="small" />
        <Divider />
        <Cell
          title={<Text type="body">Approve Members</Text>}
          prefix={<Ionicons name="lock-closed" size={22} color="rgba(255, 255, 255, 0.6)" />}
          suffix={
            <Switch
              disabled={requiresMemberApproval === null}
              value={requiresMemberApproval ?? false}
              onValueChange={handleToggleRequiresMemberApproval}
            />
          }
        />
      </BlurView>
      <Spacer size="xsmall" />
      <View className="pl-4">
        <Text type="footnote" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          By enabling this option, you will need to approve new members before they can join the
          community.
        </Text>
      </View>
    </>
  )
}

export default InviteLinkSection
