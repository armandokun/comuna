export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Array<Json>

export type Database = {
  public: {
    Tables: {
      comments: {
        Row: {
          content: string
          created_at: string
          id: number
          post_id: number
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: never
          post_id: number
          user_id?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: never
          post_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_user_id_fkey1'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      comments_likes: {
        Row: {
          comment_id: number
          created_at: string
          id: number
          liker_id: string
        }
        Insert: {
          comment_id: number
          created_at?: string
          id?: number
          liker_id?: string
        }
        Update: {
          comment_id?: number
          created_at?: string
          id?: number
          liker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'comments_likes_comment_id_fkey'
            columns: ['comment_id']
            isOneToOne: false
            referencedRelation: 'comments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_likes_liker_id_fkey'
            columns: ['liker_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      communities: {
        Row: {
          created_at: string
          description: string
          id: number
          manager_id: string
          name: string
          requires_member_approval: boolean
        }
        Insert: {
          created_at?: string
          description?: string
          id?: number
          manager_id?: string
          name: string
          requires_member_approval?: boolean
        }
        Update: {
          created_at?: string
          description?: string
          id?: number
          manager_id?: string
          name?: string
          requires_member_approval?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'communities_manager_id_fkey'
            columns: ['manager_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      community_invite_links: {
        Row: {
          community_id: number
          created_at: string
          creator_id: string
          expires_at: string
          id: number
          is_active: boolean
          link_hash: string
        }
        Insert: {
          community_id: number
          created_at?: string
          creator_id?: string
          expires_at?: string
          id?: number
          is_active?: boolean
          link_hash: string
        }
        Update: {
          community_id?: number
          created_at?: string
          creator_id?: string
          expires_at?: string
          id?: number
          is_active?: boolean
          link_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: 'community_invite_links_community_id_fkey'
            columns: ['community_id']
            isOneToOne: false
            referencedRelation: 'communities'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'community_invite_links_creator_id_fkey'
            columns: ['creator_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      community_members: {
        Row: {
          community_id: number
          created_at: string
          id: number
          is_approved: boolean
          user_id: string | null
        }
        Insert: {
          community_id: number
          created_at?: string
          id?: number
          is_approved?: boolean
          user_id?: string | null
        }
        Update: {
          community_id?: number
          created_at?: string
          id?: number
          is_approved?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'community_members_community_id_fkey'
            columns: ['community_id']
            isOneToOne: false
            referencedRelation: 'communities'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'community_members_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: number
          post_id: number | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: number
          post_id?: number | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: number
          post_id?: number | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          community_id: number
          created_at: string
          description: string | null
          id: number
          image_blurhash: string | null
          image_url: string
          video_thumbnail_blurhash: string | null
          video_thumbnail_url: string | null
          video_url: string | null
        }
        Insert: {
          author_id?: string | null
          community_id?: number
          created_at?: string
          description?: string | null
          id?: number
          image_blurhash?: string | null
          image_url?: string
          video_thumbnail_blurhash?: string | null
          video_thumbnail_url?: string | null
          video_url?: string | null
        }
        Update: {
          author_id?: string | null
          community_id?: number
          created_at?: string
          description?: string | null
          id?: number
          image_blurhash?: string | null
          image_url?: string
          video_thumbnail_blurhash?: string | null
          video_thumbnail_url?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'fk_author'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'posts_community_id_fkey'
            columns: ['community_id']
            isOneToOne: false
            referencedRelation: 'communities'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          expo_push_token: string | null
          id: string
          last_login_at: string | null
          name: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          expo_push_token?: string | null
          id?: string
          last_login_at?: string | null
          name?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          expo_push_token?: string | null
          id?: string
          last_login_at?: string | null
          name?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clear_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      like_comment: {
        Args: {
          arg_comment_id: number
        }
        Returns: undefined
      }
      unlike_comment: {
        Args: {
          arg_comment_id: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never
