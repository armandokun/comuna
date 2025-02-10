import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { encode } from 'https://esm.sh/blurhash'
import { decode } from 'https://deno.land/x/imagescript@1.2.15/mod.ts'

serve(async (req) => {
  try {
    const { imageUrl } = await req.json()

    if (!imageUrl) throw new Error('imageUrl is required')

    const response = await fetch(imageUrl)
    const imageBuffer = await response.arrayBuffer()
    const image = await decode(imageBuffer)

    image.resize(32, 32)

    const pixels = new Uint8ClampedArray(32 * 32 * 4)
    for (let i = 0; i < 32 * 32; i++) {
      const [r, g, b, a] = image.getRGBAAt((i % 32) + 1, Math.floor(i / 32) + 1)
      pixels[i * 4] = r
      pixels[i * 4 + 1] = g
      pixels[i * 4 + 2] = b
      pixels[i * 4 + 3] = a
    }

    const BLURHASH_COMPONENT_X = 4
    const BLURHASH_COMPONENT_Y = 4

    const blurhash = encode(pixels, 32, 32, BLURHASH_COMPONENT_X, BLURHASH_COMPONENT_Y)

    return new Response(JSON.stringify({ blurhash }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate-blurhash' \
    --header 'Content-Type: application/json' \
    --data '{"imageUrl":"https://gypcmmyhkdobmzqlisto.supabase.co/storage/v1/object/public/user_content/1739183033647-null"}'

*/
