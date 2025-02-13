import { createClient } from 'https://esm.sh/@supabase/supabase-js'

type Notification = {
  id: string
  user_id: string
  post_id: number
  title: string
  body: string
}

type WebhookPayload = {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: 'public'
  record: Notification
  old_record: null | Notification
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async (req) => {
  const payload: WebhookPayload = await req.json()
  const { data } = await supabase
    .from('profiles')
    .select('expo_push_token')
    .eq('id', payload.record.user_id)
    .single()

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Deno.env.get('EXPO_ACCESS_TOKEN')}`,
    },
    body: JSON.stringify({
      to: data.expo_push_token,
      sound: 'default',
      data: { post_id: payload.record.post_id },
      title: payload.record.title,
      body: payload.record.body,
    }),
  }).then((res) => res.json())

  return new Response(JSON.stringify(response), { headers: { 'Content-Type': 'application/json' } })
})
