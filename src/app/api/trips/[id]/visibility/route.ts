import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const tripId = params.id
  if (!UUID_PATTERN.test(tripId)) {
    return jsonResponse({ error: 'Invalid trip id' }, 400)
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  const { is_public } = body as { is_public?: unknown }
  if (typeof is_public !== 'boolean') {
    return jsonResponse({ error: 'is_public must be a boolean' }, 400)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  // Ownership check: RLS enforces auth.uid() = user_id, plus explicit eq for defense-in-depth
  const { data: trip } = await supabase
    .from('trips')
    .select('id')
    .eq('id', tripId)
    .eq('user_id', user.id)
    .single()

  if (!trip) {
    return jsonResponse({ error: 'Trip not found' }, 404)
  }

  const { error } = await supabase
    .from('trips')
    .update({ is_public })
    .eq('id', tripId)
    .eq('user_id', user.id)

  if (error) {
    return jsonResponse({ error: 'Could not update visibility' }, 500)
  }

  return jsonResponse({ success: true, is_public }, 200)
}
