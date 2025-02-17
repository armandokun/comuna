export const getRelativeTimeFromNow = (timestampDate: string) => {
  const now: Date = new Date()
  const then: Date = new Date(timestampDate)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (years > 1) return `${years}y`
  if (years === 1) return '1y'
  if (months > 1) return `${months}m`
  if (months === 1) return '1m'
  if (weeks > 1) return `${weeks} w`
  if (weeks === 1) return '1w'
  if (days > 1) return `${days}d`
  if (days === 1) return '1d'
  if (hours > 1) return `${hours}h`
  if (hours === 1) return '1h'
  if (minutes > 1) return `${minutes}m`

  return 'just now'
}
