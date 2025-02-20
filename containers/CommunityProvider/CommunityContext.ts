import { createContext } from 'react'

import { Comuna } from '@/types/comuna'

type Args = {
  comunas: Array<Comuna>
  selectedComuna: Comuna | null
  setSelectedComuna: (comuna: Comuna | null) => void
}

export const CommunityContext = createContext<Args>({
  comunas: [],
  selectedComuna: null,
  setSelectedComuna: () => {},
})
