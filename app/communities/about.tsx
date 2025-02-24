import { useCallback, useContext, useEffect, useState } from 'react'
import { View, SafeAreaView, Alert, ScrollView, TouchableOpacity, Platform } from 'react-native'
import { Image } from 'expo-image'
import { router, useNavigation } from 'expo-router'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { CommunityContext } from '@/containers/CommunityProvider'
import Text from '@/components/ui/Text'
import { supabase } from '@/libs/supabase'
import { ComunaMember } from '@/types/comuna'
import Spacer from '@/components/ui/Spacer'
import { Colors } from '@/constants/colors'
import ContextMenu from '@/components/ui/ContextMenu'
import { SessionContext } from '@/containers/SessionProvider'
import { HOME } from '@/constants/routes'
import { SELECTED_COMMUNITY_KEY } from '@/constants/async-storage'
import InviteLinkSection from '@/components/InviteLinkSection'

const AboutCommunityScreen = () => {
  const [members, setMembers] = useState<Array<ComunaMember>>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [manager, setManager] = useState<ComunaMember | null>(null)

  const { selectedComuna, setComunas, comunas, setSelectedComuna } = useContext(CommunityContext)
  const { profile } = useContext(SessionContext)
  const navigation = useNavigation()

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `#${selectedComuna?.name}`,
    })
  }, [navigation, selectedComuna?.name])

  const fetchMembers = useCallback(async () => {
    if (!selectedComuna?.id) return

    const { data, error } = await supabase
      .from('community_members')
      .select(
        `
        community:communities(
          manager_id
        ),
        member:profiles(
          id,
          name,
          avatar_url
        )
      `,
      )
      .eq('community_id', selectedComuna?.id)
      .order('created_at', { ascending: false })

    if (error) Alert.alert('Error', error.message)

    const formattedMembers = data?.map(({ member, community }) => ({
      id: member?.id!,
      name: member?.name!,
      avatar_url: member?.avatar_url!,
      is_manager: community.manager_id === member?.id,
    }))

    if (formattedMembers) {
      setMembers(formattedMembers)
      setManager(formattedMembers.find((member) => member.is_manager) ?? null)
    }
  }, [selectedComuna?.id])

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

  const isCurrentUserManager =
    members.find((member) => member.id === profile?.id)?.is_manager && manager?.id === profile?.id

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

    const isLastMember = members.length === 1

    if (isLastMember) {
      await AsyncStorage.removeItem(SELECTED_COMMUNITY_KEY)

      setComunas(comunas.filter((comuna) => comuna.id !== selectedComuna?.id))
      setSelectedComuna(comunas[0])
    }

    router.replace(HOME)
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

  const handleMemberMenuPress = (memberId: string, actionId: string) => {
    const member = members.find((person) => person.id === memberId)

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
          `Are you sure you want to give manager role to ${member?.name}? There can be only ONE manager in this community.`,
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
          `Are you sure you want to remove ${member?.name} from #${selectedComuna?.name}?`,
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
    }
  }

  const toggleAccordion = () => setIsExpanded(!isExpanded)

  const displayedMembers = isExpanded ? members : members.slice(0, 3)

  return (
    <BlurView tint="systemChromeMaterialDark" intensity={90} className="flex-1">
      <SafeAreaView className="flex-1">
        <ScrollView className="px-4">
          <Spacer />
          {manager && (
            <>
              <InviteLinkSection />
              <Spacer size="medium" />
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
                Manager
              </Text>
              <BlurView
                key={manager.id}
                tint="light"
                intensity={30}
                className="rounded-xl flex-row items-center justify-between w-full p-4 overflow-hidden">
                <View className="flex-row items-center gap-2">
                  <Image
                    key={manager.id}
                    source={{ uri: manager.avatar_url }}
                    contentFit="cover"
                    style={{ width: 30, height: 30, borderRadius: 30 }}
                  />
                  <Text type="body">{manager.name}</Text>
                </View>
                {isCurrentUserManager && (
                  <TouchableOpacity>
                    <ContextMenu
                      itemId={Number(manager.id)}
                      shouldOpenOnLongPress={false}
                      actions={[
                        {
                          id: `leave-${manager.id}`,
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
                      ]}
                      onPress={(actionId) => handleMemberMenuPress(manager.id, actionId)}>
                      <Ionicons
                        name="ellipsis-horizontal"
                        size={24}
                        color="rgba(255, 255, 255, 0.5)"
                      />
                    </ContextMenu>
                  </TouchableOpacity>
                )}
              </BlurView>
            </>
          )}
          <Spacer size="medium" />
          <View className="flex-row items-center justify-between">
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
              Members ({members.length})
            </Text>
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
          <View>
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
                      source={{ uri: member.avatar_url }}
                      contentFit="cover"
                      style={{ width: 30, height: 30, borderRadius: 30 }}
                    />
                    <View>
                      <Text type="body">{member.name}</Text>
                      {member.is_manager && (
                        <Text type="subhead" style={{ color: Colors.muted }}>
                          Manager
                        </Text>
                      )}
                    </View>
                  </View>
                  {isCurrentUserManager && (
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
                          ...(isCurrentUserManager && !member.is_manager
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
          </View>
          <Spacer />
        </ScrollView>
      </SafeAreaView>
    </BlurView>
  )
}

export default AboutCommunityScreen
