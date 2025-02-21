type Comuna = {
  id: number
  name: string
}

type ComunaMember = {
  id: string
  is_manager: boolean
  name: string | null
  avatar_url: string | null
}

export type { Comuna, ComunaMember }
