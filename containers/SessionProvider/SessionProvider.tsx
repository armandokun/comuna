import { Alert } from 'react-native'
import { Session } from '@supabase/supabase-js'
import React, { useState, useEffect, ReactNode, useCallback, useMemo } from 'react'

import mixpanel from '@/libs/mixpanel'
import { supabase } from '@/libs/supabase'
import { Profile } from '@/types/profile'
import { PLACEHOLDER_AVATAR_URL } from '@/constants/url'

import { SessionContext } from './SessionContext'

type Props = {
  children: ReactNode
}

const SessionProvider = ({ children }: Props) => {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isSessionFetched, setIsSessionFetched] = useState(false)
  const [isProfileFetched, setIsProfileFetched] = useState(false)

  useEffect(() => {
    if (!session?.user.id) return

    mixpanel.identify(session.user.id)
  }, [session?.user.id])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: sessionData } }) => {
      setSession(sessionData)

      setIsSessionFetched(true)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = useCallback(async () => {
    if (!session?.user) return

    const { data, error } = await supabase
      .from('profiles')
      .select()
      .eq('id', session?.user.id)
      .single()

    if (error) Alert.alert(error.message)

    setProfile(
      data
        ? {
            ...data,
            avatar_url: data.avatar_url || PLACEHOLDER_AVATAR_URL,
          }
        : null,
    )
    setIsProfileFetched(true)
  }, [session?.user])

  useEffect(() => {
    if (!session?.user) return

    fetchProfile()
  }, [fetchProfile, session?.user])

  useEffect(() => {
    if (!profile?.id) return

    const subscription = supabase
      .channel('profiles')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profile?.id}`,
        },
        () => fetchProfile(),
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchProfile, profile?.id])

  const values = useMemo(
    () => ({
      session,
      isSessionFetched,
      profile,
      isProfileFetched,
    }),
    [session, isSessionFetched, profile, isProfileFetched],
  )

  return <SessionContext.Provider value={values}>{children}</SessionContext.Provider>
}

export default SessionProvider
