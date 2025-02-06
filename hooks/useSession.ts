import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

import { supabase } from '@/libs/supabase'

type Session = {
  user: User | undefined
  isLoaded: boolean
}

const useSession = () => {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: sessionData } }) => {
      setSession({ user: sessionData?.user, isLoaded: true })
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sessionData) => {
      setSession({ user: sessionData?.user, isLoaded: true })
    })

    return () => subscription.unsubscribe()
  }, [])

  return session
}

export default useSession
