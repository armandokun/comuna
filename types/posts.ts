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
  community_id: number
  created_at: string
  description: string | null
  image_blurhash: string | null
  image_url: string | null
  video_url: string | null
  video_thumbnail_url: string | null
  video_thumbnail_blurhash: string | null
  author: {
    id: string
    name: string
    avatar_url: string
  }
  comments: Array<Comment> | null
}

export { Comment, Post, CommentWithLikes }
