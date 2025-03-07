import { Alert, TouchableOpacity, View, StyleSheet } from 'react-native'
import { useContext, useEffect, useState } from 'react'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import { BlurView } from 'expo-blur'

import { Colors } from '@/constants/colors'
import { supabase } from '@/libs/supabase'
import { SessionContext } from '@/containers/SessionProvider'
import { PLACEHOLDER_AVATAR_URL } from '@/constants/url'

import Spacer from '@/components/ui/Spacer'
import Text from '@/components/ui/Text'
import FullScreenLoader from '@/components/FullScreenLoader'
import AnimatedMemberCircle from '@/components/AnimatedMemberCircle'

type Community = {
  id: number
  name: string
  requiresMemberApproval: boolean
  description: string | null
  manager: {
    id: string
    name: string | null
    username: string | null
    avatarUrl: string | null
  }
}

type CommunityMember = {
  userId: string
  isApproved: boolean
  memberDetails: {
    name: string | null
    username: string | null
    avatarUrl: string | null
  }
}

const ComunaInviteScreen = () => {
  const [community, setCommunity] = useState<Community | null>(null)
  const [communityMembers, setCommunityMembers] = useState<Array<CommunityMember>>([])
  const [isRequesting, setIsRequesting] = useState(false)
  const [hasRequested, setHasRequested] = useState(false)

  const { profile } = useContext(SessionContext)
  const { hash } = useLocalSearchParams()

  useEffect(() => {
    if (!hash) return

    const fetchCommunity = async () => {
      const { data, error } = await supabase
        .from('community_invite_links')
        .select(
          `
          community: communities(id, name, requires_member_approval, description),
          creator: profiles(id, name, username, avatar_url)
        `,
        )
        .eq('link_hash', hash.toString())
        .single()

      if (error) Alert.alert('Error fetching community', error.message)

      if (data) {
        setCommunity({
          id: data.community.id,
          name: data.community.name,
          description: data.community.description,
          requiresMemberApproval: data.community.requires_member_approval,
          manager: {
            id: data.creator.id,
            name: data.creator.name,
            username: data.creator.username,
            avatarUrl: data.creator.avatar_url,
          },
        })
      }
    }

    fetchCommunity()
  }, [hash])

  useEffect(() => {
    if (!community?.id || !profile?.id) return

    const fetchCommunityMembers = async () => {
      const { data, error } = await supabase
        .from('community_members')
        .select('*, profile: profiles(id, name, username, avatar_url)')
        .eq('community_id', community.id)
        .eq('is_approved', true)

      if (error) Alert.alert('Error fetching community members', error.message)

      if (data) {
        const members = data.map((member) => ({
          userId: member.user_id || '',
          isApproved: member.is_approved,
          memberDetails: {
            name: member.profile?.name || '',
            username: member.profile?.username || '',
            avatarUrl: member.profile?.avatar_url || '',
          },
        }))

        setCommunityMembers(members)
      }
    }

    fetchCommunityMembers()
  }, [community?.id, profile?.id])

  const handleRequestToJoin = async () => {
    if (!community?.id || !profile?.id) return

    setIsRequesting(true)

    const { error } = await supabase.from('community_members').insert({
      community_id: community?.id,
      user_id: profile?.id,
      is_approved: !community?.requiresMemberApproval,
    })

    if (error) Alert.alert('Error requesting to join community', error.message)

    setIsRequesting(false)
    setHasRequested(true)
  }

  const getActionButton = () => {
    const isAlreadyMember = communityMembers?.some((member) => member.userId === profile?.id)
    const isRequestedToJoin = communityMembers?.some(
      (member) => member.userId === profile?.id && !member.isApproved,
    )

    if (hasRequested && !community?.requiresMemberApproval) {
      return (
        <View className="flex-row items-center gap-2 my-4">
          <Text type="body" style={{ color: 'rgba(255, 255, 255, 0.7)' }} className="text-center">
            Congratulations! 🎉 You are now a member of this community.
          </Text>
        </View>
      )
    }

    if (isRequestedToJoin || hasRequested) {
      return (
        <View className="flex-row items-center gap-2 my-4">
          <Text type="body" style={{ color: 'rgba(255, 255, 255, 0.7)' }} className="text-center">
            {hasRequested
              ? 'Your request is pending review by the community manager.'
              : 'You have already requested to join this community.'}
          </Text>
        </View>
      )
    }

    if (isAlreadyMember) {
      return (
        <View className="flex-row items-center gap-2 my-4">
          <Text type="body" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            You are already a member of this community.
          </Text>
        </View>
      )
    }

    return (
      <>
        <View className="flex-row items-center gap-2 my-4">
          <TouchableOpacity
            onPress={handleRequestToJoin}
            className="flex-row items-center gap-2 bg-text p-2 pl-4 pr-6 rounded-full">
            <Ionicons name="enter-outline" size={26} color={Colors.background} />
            <Text type="button" style={{ color: Colors.background }}>
              {community?.requiresMemberApproval ? 'Request to Join' : 'Join'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text type="footnote" style={{ color: 'rgba(255, 255, 255, 0.7)' }} className="text-center">
          {community?.requiresMemberApproval
            ? 'Once you request to join, the community manager will review your request.'
            : 'Once you join, you will be able to see the community posts and interact with the community members.'}
        </Text>
      </>
    )
  }

  if (!community) return null

  return (
    <>
      <BlurView intensity={80} tint="systemChromeMaterialDark" style={StyleSheet.absoluteFill} />
      <View className="flex-1 px-4 items-center justify-center">
        <AnimatedMemberCircle
          memberAvatarUrls={communityMembers.map((member) => member.memberDetails.avatarUrl)}
        />
        <Spacer size="medium" />
        <Text type="title1" className="text-white">
          #{community?.name}
        </Text>
        <Spacer size="medium" />
        <Text type="subhead" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Created by
        </Text>
        <Spacer size="xxsmall" />
        <View className="flex-row items-center gap-2">
          <Image
            source={{ uri: community?.manager?.avatarUrl || PLACEHOLDER_AVATAR_URL }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
            }}
          />
          <Text type="body" className="text-muted">
            {community?.manager?.username || community?.manager?.name}
          </Text>
        </View>
        <Spacer size="medium" />
        {getActionButton()}
      </View>
      <Spacer />
      <FullScreenLoader
        title={
          community?.requiresMemberApproval
            ? 'Requesting to join community...'
            : 'Joining community...'
        }
        show={isRequesting}
      />
    </>
  )
}

export default ComunaInviteScreen
