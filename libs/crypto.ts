import { getRandomBytes } from 'expo-crypto'
import { Buffer } from 'buffer'

const generateLinkHash = (): string => {
  const buffer = getRandomBytes(10)

  return Buffer.from(buffer)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 10)
    .toLowerCase()
}

export { generateLinkHash }
