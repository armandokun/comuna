import { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import * as Linking from 'expo-linking'
import { router } from 'expo-router'

import { supabase } from '@/libs/supabase'

export const useInviteLink = () => {
  const [isInviteSheetOpen, setIsInviteSheetOpen] = useState(false)
  const [communityId, setCommunityId] = useState<number | null>(null)

  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const { url } = event
      const { path, scheme } = Linking.parse(url)

      // Handle both comuna:// scheme and https links
      if (!path?.includes('invite') && !(scheme === 'comuna' && url.includes('invite'))) {
        return
      }

      // Prevent default navigation by replacing the current route
      if (router.canGoBack()) {
        router.back()
      } else {
        router.replace('/')
      }

      const linkHash = path?.split('/').pop()

      if (!linkHash) {
        Alert.alert('Invalid invite link')
        return
      }

      const { data: inviteData, error } = await supabase
        .from('community_invite_links')
        .select('community_id, is_active')
        .eq('link_hash', linkHash)
        .single()

      if (error || !inviteData) {
        Alert.alert('Invalid or expired invite link')
        return
      }

      if (!inviteData.is_active) {
        Alert.alert('This invite link has expired')
        return
      }

      setIsInviteSheetOpen(true)
      setCommunityId(inviteData.community_id)
    }

    Linking.getInitialURL().then((url) => {
      if (!url) return
      handleDeepLink({ url })
    })

    const subscription = Linking.addEventListener('url', handleDeepLink)

    return () => {
      subscription.remove()
    }
  }, [])

  const closeInviteSheet = () => {
    setIsInviteSheetOpen(false)
  }

  return { isInviteSheetOpen, closeInviteSheet, communityId }
}
