type Post = {
  id: number
  created_at: string
  description: string | null
  image_blurhash: string
  image_url: string
  author: {
    id: string
    name: string
    avatar_url: string
  }
  comments_count: number
}

export default Post
