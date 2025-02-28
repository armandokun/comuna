import { Alert } from 'react-native'
import React, { useState, useEffect, ReactNode, useMemo, useContext, useCallback } from 'react'

import AsyncStorage from '@react-native-async-storage/async-storage'

import { supabase } from '@/libs/supabase'
import { Comuna } from '@/types/comuna'
import { SELECTED_COMMUNITY_KEY } from '@/constants/async-storage'

import { CommunityContext } from './CommunityContext'
import { SessionContext } from '../SessionProvider'

type Props = {
  children: ReactNode
}

const CommunityProvider = ({ children }: Props) => {
  const [comunas, setComunas] = useState<Array<Comuna>>([])
  const [selectedComuna, setSelectedComuna] = useState<Comuna | null>(null)

  const { profile } = useContext(SessionContext)

  useEffect(() => {
    const fetchSelectedComuna = async () => {
      if (!comunas.length) return

      const savedId = await AsyncStorage.getItem(SELECTED_COMMUNITY_KEY)

      if (savedId) {
        const comuna = comunas.find((community) => community.id === Number(savedId))

        if (comuna) {
          setSelectedComuna(comuna)
        } else {
          setSelectedComuna(comunas[0])
        }

        return
      }

      if (!selectedComuna) setSelectedComuna(comunas[0])
    }

    fetchSelectedComuna()
  }, [comunas, selectedComuna])

  const fetchComunas = useCallback(async () => {
    if (!profile?.id) return

    const { data, error } = await supabase
      .from('community_members')
      .select(
        `
        is_approved,
        community: communities(*)
      `,
      )
      .eq('user_id', profile.id)

    if (error) {
      Alert.alert('Error fetching comunas', error.message)

      return
    }

    const communities = data.filter((item) => item.is_approved).map((item) => item.community)
    setComunas(communities)
  }, [profile?.id])

  useEffect(() => {
    if (!profile?.id) return

    fetchComunas()
  }, [fetchComunas, profile?.id])

  useEffect(() => {
    if (!profile?.id) return

    const subscription = supabase
      .channel('community_members')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_members',
          filter: `user_id=eq.${profile?.id}`,
        },
        () => fetchComunas(),
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchComunas, profile?.id])

  const values = useMemo(
    () => ({
      comunas,
      setComunas,
      selectedComuna,
      setSelectedComuna,
    }),
    [comunas, selectedComuna],
  )

  return <CommunityContext.Provider value={values}>{children}</CommunityContext.Provider>
}

export default CommunityProvider
