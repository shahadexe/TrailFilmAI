import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: documentary } = await supabase
    .from('documentaries')
    .select('id, status, video_urls, scene_titles, scene_count, error_message')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!documentary) {
    return NextResponse.json({ error: 'Documentary not found' }, { status: 404 })
  }

  return NextResponse.json({
    status: documentary.status,
    videoUrls: documentary.video_urls ?? [],
    sceneTitles: documentary.scene_titles ?? [],
    sceneCount: documentary.scene_count ?? 0,
    errorMessage: documentary.error_message,
  })
}
