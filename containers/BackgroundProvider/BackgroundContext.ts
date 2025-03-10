import { createContext } from 'react'

type Args = {
  backgroundBlurhash: string | null
  setBackgroundBlurhash: (blurhash: string | null) => void
}

export const BackgroundContext = createContext<Args>({
  backgroundBlurhash: null,
  setBackgroundBlurhash: () => {},
})
