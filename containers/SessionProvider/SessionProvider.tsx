import { Alert } from 'react-native'
import { Session } from '@supabase/supabase-js'
import React, { useState, useEffect, ReactNode, useCallback, useMemo } from 'react'

import mixpanel from '@/libs/mixpanel'
import { supabase } from '@/libs/supabase'
import { Profile } from '@/types/profile'

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

    mixpanel.identify(session?.user.id)

    setProfile(data)
    setIsProfileFetched(true)
  }, [session?.user])

  useEffect(() => {
    if (!session?.user) return

    fetchProfile()
  }, [fetchProfile, session?.user])

  useEffect(() => {
    if (!session?.user?.id) return

    const subscription = supabase.channel('profiles').on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${session.user.id}`,
      },
      () => {
        fetchProfile()
      },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchProfile, session?.user?.id])

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
