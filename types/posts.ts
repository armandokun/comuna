type Comment = {
  id: number
  content: string
  created_at: string
  author: {
    id: string
    name: string
    avatar_url: string
  }
}

type CommentWithLikes = Comment & {
  likes: Array<{
    id: number
    liker_id: string
  }>
}

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
  comments: Array<Comment> | null
}

export { Comment, Post, CommentWithLikes }
