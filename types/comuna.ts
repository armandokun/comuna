type Comuna = {
  id: number
  name: string
  description: string
  requires_member_approval: boolean
}

type ComunaMember = {
  id: string
  is_manager: boolean
  name: string | null
  username: string | null
  avatar_url: string | null
  is_approved: boolean
}

export type { Comuna, ComunaMember }
