export type Comment = {
  id: number
  content: string
  created_at: string
  author: {
    id: string
    name: string
    avatar_url: string
  }
}
