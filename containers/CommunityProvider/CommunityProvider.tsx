import { Alert } from 'react-native'
import React, { useState, useEffect, ReactNode, useMemo, useContext } from 'react'

import AsyncStorage from '@react-native-async-storage/async-storage'

import { supabase } from '@/libs/supabase'
import { Comuna } from '@/types/comuna'

import { CommunityContext } from './CommunityContext'
import { SessionContext } from '../SessionProvider'

type Props = {
  children: ReactNode
}

export const SELECTED_COMMUNITY_KEY = '@selected_community_id'

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

  useEffect(() => {
    if (!profile?.id) return

    const fetchComunas = async () => {
      const { data, error } = await supabase
        .from('community_members')
        .select(
          `
          community:communities (
            id,
            name
          )
        `,
        )
        .eq('user_id', profile.id)

      if (error) {
        Alert.alert('Error fetching comunas', error.message)

        return
      }

      const communities = data.map((item) => item.community)
      setComunas(communities)
    }

    fetchComunas()
  }, [profile?.id])

  const values = useMemo(
    () => ({
      comunas,
      selectedComuna,
      setSelectedComuna,
    }),
    [comunas, selectedComuna],
  )

  return <CommunityContext.Provider value={values}>{children}</CommunityContext.Provider>
}

export default CommunityProvider
