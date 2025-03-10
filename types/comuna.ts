type Comuna = {
  id: number
  name: string
  description: string
  requiresMemberApproval: boolean
}

type ComunaMember = {
  id: string
  isManager: boolean
  name: string | null
  username: string | null
  avatarUrl: string | null
  isApproved: boolean
  isBlocked: boolean
  isAlertsEnabled: boolean
}

export type { Comuna, ComunaMember }
