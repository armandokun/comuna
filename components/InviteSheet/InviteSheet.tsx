import { Alert, TouchableOpacity, View } from 'react-native'
import { useContext, useEffect, useState } from 'react'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'

import { Colors } from '@/constants/colors'
import { supabase } from '@/libs/supabase'
import { Comuna } from '@/types/comuna'
import BottomSheet from '@/components/ui/BottomSheet'

import { SessionContext } from '@/containers/SessionProvider'

import Spacer from '../ui/Spacer'
import Text from '../ui/Text'
import FullScreenLoader from '../FullScreenLoader'

type Props = {
  show: boolean
  onClose: () => void
  communityId: number | null
}

type CommunityMember = {
  user_id: string
  is_approved: boolean
  member_details: {
    name: string | null
    username: string | null
    avatar_url: string | null
  }
}

type Community = Comuna & {
  creator: {
    name: string | null
    username: string | null
    avatar_url: string | null
  }
  community_members: Array<CommunityMember> | null
}

const InviteSheet = ({ show, onClose, communityId }: Props) => {
  const [community, setCommunity] = useState<Community | null>(null)
  const [isRequesting, setIsRequesting] = useState(false)
  const [hasRequested, setHasRequested] = useState(false)

  const { profile } = useContext(SessionContext)

  useEffect(() => {
    if (!show || !communityId) return

    const fetchCommunity = async () => {
      const { data, error } = await supabase
        .from('communities')
        .select(
          `
          *,
          creator: profiles(name, username, avatar_url),
          community_members(
            user_id,
            is_approved,
            member_details: profiles(
              name,
              username,
              avatar_url
            )
          )
        `,
        )
        .eq('id', communityId)
        .single()

      if (error) Alert.alert('Error fetching community', error.message)

      if (data) setCommunity(data as Community)
    }

    fetchCommunity()
  }, [communityId, show])

  const handleRequestToJoin = async () => {
    if (!communityId || !profile?.id) return

    setIsRequesting(true)

    const { error } = await supabase
      .from('community_members')
      .insert({ community_id: communityId, user_id: profile?.id, is_approved: false })

    if (error) Alert.alert('Error requesting to join community', error.message)

    setIsRequesting(false)
    setHasRequested(true)
  }

  const getActionButton = () => {
    const isMemberAlready = community?.community_members?.some(
      (member) => member.user_id === profile?.id,
    )
    const isRequestedToJoin = community?.community_members?.some(
      (member) => member.user_id === profile?.id && !member.is_approved,
    )

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

    if (isMemberAlready) {
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
            className="flex-row items-center gap-2 bg-text p-2 px-4 rounded-full">
            <Ionicons name="enter-outline" size={26} color={Colors.background} />
            <Text type="button" style={{ color: Colors.background }}>
              Request to Join
            </Text>
          </TouchableOpacity>
        </View>
        <Text type="footnote" style={{ color: 'rgba(255, 255, 255, 0.7)' }} className="text-center">
          Once you request to join, the community manager will review your request.
        </Text>
      </>
    )
  }

  if (!communityId) return null

  return (
    <>
      <BottomSheet show={show} onBackdropPress={onClose}>
        <View className="flex-1 px-4 items-center justify-center">
          <Spacer size="medium" />
          <Text type="title1" className="text-white">
            #{community?.name}
          </Text>
          <Spacer size="xsmall" />
          <Text type="body" className="text-center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {community?.description || 'No description'}
          </Text>
          <Spacer size="medium" />
          <Text type="subhead" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Created by
          </Text>
          <Spacer size="xxsmall" />
          <View className="flex-row items-center gap-2">
            <Image
              source={{ uri: community?.creator?.avatar_url }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
              }}
            />
            <Text type="body" className="text-muted">
              {community?.creator?.username || community?.creator?.name}
            </Text>
          </View>
          <Spacer size="medium" />
          {getActionButton()}
        </View>
      </BottomSheet>
      <FullScreenLoader title="Requesting to join community..." show={isRequesting} />
    </>
  )
}

export default InviteSheet
