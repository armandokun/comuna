export type Comment = {
  id: string
  content: string
  created_at: string
  author: {
    id: string
    name: string
    avatar_url: string
  }
}
