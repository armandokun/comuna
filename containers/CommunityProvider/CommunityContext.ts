import { createContext } from 'react'

import { Comuna } from '@/types/comuna'

type Args = {
  comunas: Array<Comuna>
  setComunas: (comunas: Array<Comuna>) => void
  selectedComuna: Comuna | null
  setSelectedComuna: (comuna: Comuna | null) => void
}

export const CommunityContext = createContext<Args>({
  comunas: [],
  setComunas: () => {},
  selectedComuna: null,
  setSelectedComuna: () => {},
})
