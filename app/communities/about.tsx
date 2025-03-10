import { useCallback, useContext, useEffect, useState } from 'react'
import {
  View,
  Alert,
  ScrollView,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  Switch,
} from 'react-native'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { CommunityContext } from '@/containers/CommunityProvider'
import Text from '@/components/ui/Text'
import { supabase } from '@/libs/supabase'
import { ComunaMember } from '@/types/comuna'
import Spacer from '@/components/ui/Spacer'
import { Colors } from '@/constants/colors'
import { PLACEHOLDER_AVATAR_URL } from '@/constants/url'
import ContextMenu from '@/components/ui/ContextMenu'
import { SessionContext } from '@/containers/SessionProvider'
import { HOME } from '@/constants/routes'
import { SELECTED_COMMUNITY_KEY } from '@/constants/async-storage'
import InviteLinkSection from '@/components/InviteLinkSection'
import Label from '@/components/ui/Label'
import Cell from '@/components/ui/Cell'

const AboutCommunityScreen = () => {
  const [members, setMembers] = useState<Array<ComunaMember>>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [manager, setManager] = useState<ComunaMember | null>(null)
  const [currentMember, setCurrentMember] = useState<ComunaMember | null>(null)
  const [pendingRequests, setPendingRequests] = useState<Array<ComunaMember>>([])

  const { selectedComuna, setComunas, comunas, setSelectedComuna } = useContext(CommunityContext)
  const { profile } = useContext(SessionContext)

  const fetchBlockedMembers = useCallback(async () => {
    if (!profile?.id || !selectedComuna?.id) return

    const { data, error } = await supabase
      .from('member_blocks')
      .select('*')
      .eq('community_id', selectedComuna.id)
      .eq('user_id', profile.id)

    if (error) Alert.alert('Error fetching blocked members', error.message)

    setMembers((prevMembers) =>
      prevMembers.map((member) => ({
        ...member,
        is_blocked: data?.some((block) => block.blocked_user_id === member.id) ?? false,
      })),
    )
  }, [profile?.id, selectedComuna?.id])

  const fetchMembers = useCallback(async () => {
    if (!selectedComuna?.id) return

    const { data, error } = await supabase
      .from('community_members')
      .select(
        `
        is_approved,
        push_notifications_enabled,
        community:communities(
          manager_id,
          name,
          description
        ),
        member:profiles(
          id,
          name,
          username,
          avatar_url
        )
      `,
      )
      .eq('community_id', selectedComuna?.id)
      .order('created_at', { ascending: false })

    if (error) Alert.alert('Error', error.message)

    const formattedMembers = data?.map(
      ({
        is_approved: isApproved,
        member,
        community,
        push_notifications_enabled: isAlertsEnabled,
      }) => ({
        id: member?.id!,
        name: member?.name || null,
        username: member?.username || null,
        avatarUrl: member?.avatar_url || PLACEHOLDER_AVATAR_URL,
        isManager: community.manager_id === member?.id,
        isApproved,
        isAlertsEnabled,
        isBlocked: false,
      }),
    )

    if (formattedMembers) {
      setMembers(
        formattedMembers.filter((member) => {
          if (!member.username && !member.name) return false

          if (member.isApproved) return true

          return false
        }),
      )
      setManager(formattedMembers.find((member) => member.isManager) ?? null)
      setPendingRequests(formattedMembers.filter((member) => !member.isApproved))
      setCurrentMember(formattedMembers.find((member) => member.id === profile?.id) ?? null)

      fetchBlockedMembers()
    }
  }, [fetchBlockedMembers, profile?.id, selectedComuna?.id])

  useEffect(() => {
    if (members.length) return

    fetchMembers()
  }, [fetchMembers, members.length])

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedComuna?.id) return

    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', selectedComuna?.id)
      .eq('user_id', memberId)

    if (error) {
      Alert.alert('Error removing member', error.message)

      return
    }

    fetchMembers()
  }

  const isCurrentUserManager = currentMember?.isManager && manager?.id === profile?.id

  const handleLeaveCommunity = async () => {
    if (!selectedComuna?.id || !profile?.id) return

    const isLastCommunity = comunas.length === 1

    if (isLastCommunity) {
      Alert.alert(
        'Error leaving community',
        'You cannot leave the last community. Create another one to continue.',
        [
          {
            text: 'Ok',
          },
        ],
      )

      return
    }

    if (isCurrentUserManager && members.length >= 2) {
      Alert.alert(
        'Error leaving community',
        'You cannot leave the community as it is managed by you. Promote another member to manager first.',
      )

      return
    }

    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', selectedComuna?.id)
      .eq('user_id', profile?.id)

    if (error) {
      Alert.alert('Error leaving community', error.message)

      return
    }

    const otherComunas = comunas.filter((comuna) => comuna.id !== selectedComuna?.id)

    setComunas(otherComunas)

    await AsyncStorage.setItem(SELECTED_COMMUNITY_KEY, otherComunas[0].id.toString())

    setSelectedComuna(otherComunas[0])

    router.replace(HOME)
  }

  const handleLeavePress = () => {
    Alert.alert(`Leave #${selectedComuna?.name}?`, 'Are you sure you want to leave this comuna?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: handleLeaveCommunity,
      },
    ])
  }

  const handlePromoteToManager = async (memberId: string) => {
    if (!selectedComuna?.id) return

    const { error } = await supabase
      .from('communities')
      .update({ manager_id: memberId })
      .eq('id', selectedComuna?.id)

    if (error) {
      Alert.alert('Error promoting to manager', error.message)

      return
    }

    const member = members.find((person) => person.id === memberId)

    if (!member) {
      Alert.alert('Error promoting to manager', 'Member is not found')

      return
    }

    fetchMembers()
  }

  const handleApproveMember = async (memberId: string) => {
    if (!selectedComuna?.id) return

    const { error } = await supabase
      .from('community_members')
      .update({ is_approved: true })
      .eq('community_id', selectedComuna?.id)
      .eq('user_id', memberId)

    if (error) {
      Alert.alert('Error approving member', error.message)

      return
    }

    fetchMembers()
  }

  const handleApprovePress = (memberId: string) => {
    const allMembers = [...members, ...pendingRequests]
    const member = allMembers.find((person) => person.id === memberId)

    Alert.alert(
      'Approve member',
      `Are you sure you want to approve ${member?.username || member?.name} to #${selectedComuna?.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Approve',
          style: 'default',
          onPress: () => handleApproveMember(memberId),
        },
      ],
    )
  }

  const handleDeclinePress = (memberId: string) => {
    const allMembers = [...members, ...pendingRequests]
    const member = allMembers.find((person) => person.id === memberId)

    Alert.alert(
      'Decline member',
      `Are you sure you want to decline ${member?.username || member?.name} invitation to #${selectedComuna?.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => handleRemoveMember(memberId),
        },
      ],
    )
  }

  const handleUnblockMember = async (memberId: string) => {
    if (!selectedComuna?.id || !profile?.id) return

    const { error } = await supabase
      .from('member_blocks')
      .delete()
      .eq('community_id', selectedComuna?.id)
      .eq('user_id', profile?.id)
      .eq('blocked_user_id', memberId)

    if (error) {
      Alert.alert('Error unblocking member', error.message)
    }

    fetchMembers()
  }

  const handleMemberMenuPress = (memberId: string, actionId: string) => {
    const allMembers = [...members, ...pendingRequests]
    const member = allMembers.find((person) => person.id === memberId)

    switch (actionId) {
      case `leave-${memberId}`:
        Alert.alert(
          'Leave community?',
          `Are you sure you want to leave #${selectedComuna?.name}? This action is irreversible.`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Leave',
              style: 'destructive',
              onPress: handleLeaveCommunity,
            },
          ],
        )
        break
      case `manager-${memberId}`:
        Alert.alert(
          'Promote to manager',
          `Are you sure you want to give manager role to ${member?.username || member?.name}? There can be only ONE manager in this community.`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Promote',
              style: 'destructive',
              onPress: () => handlePromoteToManager(memberId),
            },
          ],
        )
        break
      case `remove-${memberId}`:
        Alert.alert(
          'Remove member',
          `Are you sure you want to remove ${member?.username || member?.name} from #${selectedComuna?.name}?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Remove',
              style: 'destructive',
              onPress: () => handleRemoveMember(memberId),
            },
          ],
        )
        break
      case `unblock-${memberId}`:
        Alert.alert(
          'Unblock member',
          `Are you sure you want to unblock ${member?.username || member?.name} from #${selectedComuna?.name}?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Unblock',
              style: 'destructive',
              onPress: () => handleUnblockMember(memberId),
            },
          ],
        )
        break
    }
  }

  const handlePushNotificationsToggle = async () => {
    if (!currentMember || !selectedComuna?.id) return

    const pushNotificationsEnabled = currentMember.isAlertsEnabled

    setCurrentMember((prevMember) => {
      if (!prevMember) return null

      return {
        ...prevMember,
        isAlertsEnabled: !pushNotificationsEnabled,
      }
    })

    const { error } = await supabase
      .from('community_members')
      .update({ push_notifications_enabled: !pushNotificationsEnabled })
      .eq('community_id', selectedComuna.id)
      .eq('user_id', currentMember.id)

    if (error) {
      Alert.alert('Error updating push notifications', error.message)

      setCurrentMember((prevMember) => {
        if (!prevMember) return null

        return {
          ...prevMember,
          isAlertsEnabled: !pushNotificationsEnabled,
        }
      })
    }
  }

  const toggleAccordion = () => setIsExpanded(!isExpanded)

  const displayedMembers = isExpanded ? members : members.slice(0, 3)

  return (
    <BlurView tint="systemChromeMaterialDark" intensity={90} className="flex-1">
      <SafeAreaView className="flex-1">
        <ScrollView className="px-4" contentContainerClassName="pb-32">
          <View className="px-4 items-center justify-center">
            <Spacer size="medium" />
            <Text type="title1">#{selectedComuna?.name}</Text>
            <Spacer size="medium" />
            <Text type="subhead" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Managed by
            </Text>
            <Spacer size="xxsmall" />
            <View className="flex-row items-center gap-2">
              <Image
                source={{ uri: manager?.avatarUrl || PLACEHOLDER_AVATAR_URL }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                }}
              />
              <Text type="body" className="text-muted">
                {manager?.username || manager?.name}
              </Text>
            </View>
          </View>
          <Spacer size="medium" />
          {isCurrentUserManager && (
            <>
              <InviteLinkSection />
              <Spacer size="medium" />
              {pendingRequests.length ? (
                <>
                  <Label title={`Pending approval (${pendingRequests.length})`} />
                  {pendingRequests.map((member) => (
                    <BlurView
                      key={member.id}
                      tint="light"
                      intensity={30}
                      className="rounded-xl flex-row items-center justify-between w-full p-4 overflow-hidden">
                      <View className="flex-row items-center gap-2">
                        <Image
                          key={member.id}
                          source={{ uri: member.avatarUrl || PLACEHOLDER_AVATAR_URL }}
                          contentFit="cover"
                          style={{ width: 30, height: 30, borderRadius: 30 }}
                        />
                        <Text type="body">{member.username || member.name}</Text>
                      </View>
                      <View className="flex-row gap-3">
                        <TouchableOpacity onPress={() => handleApprovePress(member.id)}>
                          <Ionicons
                            name="checkmark-circle"
                            size={32}
                            color={Colors.systemSuccess}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeclinePress(member.id)}>
                          <Ionicons
                            name="close-circle"
                            size={32}
                            color={Colors.systemDestructive}
                          />
                        </TouchableOpacity>
                      </View>
                    </BlurView>
                  ))}
                </>
              ) : null}
            </>
          )}
          <Spacer size="small" />
          <View className="flex-row items-center justify-between">
            <Label title={`Members (${members.length})`} />
            {members.length > 3 && (
              <TouchableOpacity onPress={toggleAccordion} className="flex-row items-center">
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={Colors.text}
                  style={{ marginRight: 16, marginBottom: 8 }}
                />
              </TouchableOpacity>
            )}
          </View>
          <View className="flex-row flex-wrap gap-2">
            {displayedMembers.map((member) => (
              <BlurView
                key={member.id}
                tint="light"
                intensity={30}
                className="rounded-xl flex-row items-center justify-between w-full p-4 overflow-hidden">
                <View className="flex-row items-center gap-2">
                  <Image
                    key={member.id}
                    source={{ uri: member.avatarUrl || PLACEHOLDER_AVATAR_URL }}
                    contentFit="cover"
                    style={{ width: 30, height: 30, borderRadius: 30 }}
                  />
                  <View>
                    <Text type="body">
                      {member.username || member.name} {member.isBlocked && '(blocked)'}
                    </Text>
                    {member.isManager && (
                      <Text type="subhead" style={{ color: Colors.muted }}>
                        Manager
                      </Text>
                    )}
                  </View>
                </View>
                {(isCurrentUserManager || member.id === profile?.id || member.isBlocked) && (
                  <TouchableOpacity>
                    <ContextMenu
                      itemId={Number(member.id)}
                      shouldOpenOnLongPress={false}
                      actions={[
                        ...(member.id === profile?.id
                          ? [
                              {
                                id: `leave-${member.id}`,
                                title: 'Leave',
                                image: Platform.select({
                                  ios: 'rectangle.portrait.and.arrow.right',
                                  android: 'ic_menu_close_clear_cancel',
                                }),
                                imageColor: Colors.systemDestructive,
                                attributes: {
                                  destructive: true,
                                },
                              },
                            ]
                          : []),
                        ...(member.isBlocked
                          ? [
                              {
                                id: `unblock-${member.id}`,
                                title: 'Unblock',
                                image: Platform.select({
                                  ios: 'person.slash',
                                  android: 'ic_menu_block',
                                }),
                                imageColor: Colors.text,
                              },
                            ]
                          : []),
                        ...(isCurrentUserManager && !member.isManager
                          ? [
                              {
                                id: `manager-${member.id}`,
                                title: 'Promote to manager',
                                image: Platform.select({
                                  ios: 'star',
                                  android: 'ic_menu_star',
                                }),
                                imageColor: Colors.text,
                              },
                              {
                                id: `remove-${member.id}`,
                                title: 'Remove',
                                image: Platform.select({
                                  ios: 'trash',
                                  android: 'ic_menu_delete',
                                }),
                                imageColor: Colors.systemDestructive,
                                attributes: {
                                  destructive: true,
                                },
                              },
                            ]
                          : []),
                      ]}
                      onPress={(actionId) => handleMemberMenuPress(member.id, actionId)}>
                      <Ionicons
                        name="ellipsis-horizontal"
                        size={24}
                        color="rgba(255, 255, 255, 0.5)"
                      />
                    </ContextMenu>
                  </TouchableOpacity>
                )}
              </BlurView>
            ))}
          </View>
          <Spacer size="medium" />
          <BlurView tint="light" intensity={30} className="rounded-xl overflow-hidden">
            <Cell
              title={<Text type="body">Push Notifications</Text>}
              suffix={
                <Switch
                  ios_backgroundColor={Colors.muted}
                  value={currentMember?.isAlertsEnabled}
                  onValueChange={handlePushNotificationsToggle}
                />
              }
            />
          </BlurView>
          <Spacer size="xxsmall" />
          <Text type="footnote" style={{ color: Colors.muted }} className="px-4">
            This only affects notifications for this community.
          </Text>
          <Spacer size="medium" />
          <Label title="Danger" />
          <BlurView tint="light" intensity={30} className="rounded-xl overflow-hidden">
            <TouchableOpacity onPress={handleLeavePress} className="p-2">
              <View className="flex-row items-center justify-center gap-2">
                <Ionicons name="log-out-outline" size={24} color={Colors.systemDestructive} />
                <Text type="button" style={{ color: Colors.systemDestructive }}>
                  Leave
                </Text>
              </View>
            </TouchableOpacity>
          </BlurView>
        </ScrollView>
      </SafeAreaView>
    </BlurView>
  )
}

export default AboutCommunityScreen
