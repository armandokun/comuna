import { createContext } from 'react'
import { Session } from '@supabase/supabase-js'

import { Profile } from '@/types/profile'

type Args = {
  session: Session | null
  profile: Profile | null
  isSessionFetched: boolean
  isProfileFetched: boolean
  setProfileUsername: (username: string) => void
  setProfileAvatar: (avatar: string) => void
}

export const SessionContext = createContext<Args>({
  session: null,
  profile: null,
  isSessionFetched: false,
  isProfileFetched: false,
  setProfileUsername: () => {},
  setProfileAvatar: () => {},
})
