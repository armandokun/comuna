import React, { useState, ReactNode, useMemo } from 'react'

import { BackgroundContext } from './BackgroundContext'

type Props = {
  children: ReactNode
}

const BackgroundProvider = ({ children }: Props) => {
  const [backgroundBlurhash, setBackgroundBlurhash] = useState<string | null>(null)

  const value = useMemo(() => ({ backgroundBlurhash, setBackgroundBlurhash }), [backgroundBlurhash])

  return <BackgroundContext.Provider value={value}>{children}</BackgroundContext.Provider>
}

export default BackgroundProvider
