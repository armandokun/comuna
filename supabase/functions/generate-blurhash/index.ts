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

    const IMAGE_SIZE = 32
    image.resize(IMAGE_SIZE, IMAGE_SIZE)

    const pixels = new Uint8ClampedArray(IMAGE_SIZE * IMAGE_SIZE * 4)
    for (let i = 0; i < IMAGE_SIZE * IMAGE_SIZE; i++) {
      const [r, g, b, a] = image.getRGBAAt((i % IMAGE_SIZE) + 1, Math.floor(i / IMAGE_SIZE) + 1)
      pixels[i * 4] = r
      pixels[i * 4 + 1] = g
      pixels[i * 4 + 2] = b
      pixels[i * 4 + 3] = a
    }

    const BLURHASH_COMPONENT_X = 5
    const BLURHASH_COMPONENT_Y = 5

    const blurhash = encode(
      pixels,
      IMAGE_SIZE,
      IMAGE_SIZE,
      BLURHASH_COMPONENT_X,
      BLURHASH_COMPONENT_Y,
    )

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
    --data '{"imageUrl":"https://gypcmmyhkdobmzqlisto.supabase.co/storage/v1/object/public/user_content/1739800311237-IMG_2371-FF23C254-527F-4B67-B6A9-BFE9B0B65576.jpg"}'

*/
