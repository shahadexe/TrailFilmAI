import type { ScenePrompt } from '@/lib/gemini/generateVideoPrompts'

export interface GeneratedScene {
  index: number
  photoId: string
  chapterTitle: string
  locationHint: string | null
  videoUrl: string
  cinematicPrompt: string
}

const KLING_BASE = 'https://api.kie.ai'

function getKlingKey(): string {
  const key = process.env.KLING_API_KEY
  if (!key) throw new Error('KLING_API_KEY is required')
  return key
}

async function createKlingJob(photoUrl: string, prompt: string): Promise<string> {
  const res = await fetch(`${KLING_BASE}/api/v1/jobs/createTask`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getKlingKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'kling-2.6/image-to-video',
      input: {
        image_urls: [photoUrl],
        prompt,
        duration: '5',
        sound: false,
      },
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Kling createTask failed (${res.status}): ${body}`)
  }

  const json = await res.json() as { code: number; data?: { taskId?: string } }
  const taskId = json.data?.taskId
  if (!taskId) throw new Error(`Kling returned no taskId: ${JSON.stringify(json)}`)
  return taskId
}

async function pollKlingJob(
  taskId: string,
  maxWaitMs = 300_000,
  intervalMs = 8_000
): Promise<string> {
  const start = Date.now()

  while (Date.now() - start < maxWaitMs) {
    await new Promise((r) => setTimeout(r, intervalMs))

    const res = await fetch(`${KLING_BASE}/api/v1/tasks/${taskId}`, {
      headers: { 'Authorization': `Bearer ${getKlingKey()}` },
    })

    if (!res.ok) continue

    const json = await res.json() as {
      status?: string
      data?: { video_url?: string }
    }

    if (json.status === 'completed') {
      const url = json.data?.video_url
      if (!url) throw new Error(`Kling job completed but no video_url in response`)
      return url
    }

    if (json.status === 'error') {
      throw new Error(`Kling job failed: ${JSON.stringify(json)}`)
    }
  }

  throw new Error(`Kling job timed out after ${maxWaitMs / 1000}s`)
}

export async function generateVeoScene(
  scene: ScenePrompt,
  onProgress?: (msg: string) => void
): Promise<GeneratedScene> {
  onProgress?.(`Generating scene ${scene.index}: "${scene.chapterTitle}"…`)

  const taskId = await createKlingJob(scene.photoUrl, scene.cinematicPrompt)

  onProgress?.(`Waiting for scene ${scene.index} to render…`)

  const videoUrl = await pollKlingJob(taskId)

  onProgress?.(`Scene ${scene.index} ready.`)

  return {
    index: scene.index,
    photoId: scene.photoId,
    chapterTitle: scene.chapterTitle,
    locationHint: scene.locationHint,
    videoUrl,
    cinematicPrompt: scene.cinematicPrompt,
  }
}

export async function generateAllScenes(
  scenes: ScenePrompt[],
  onProgress?: (msg: string, pct: number) => void
): Promise<GeneratedScene[]> {
  const results: GeneratedScene[] = []

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i]
    const pct = Math.round(((i + 1) / scenes.length) * 100)

    const generated = await generateVeoScene(scene, (msg) =>
      onProgress?.(msg, pct)
    )
    results.push(generated)
  }

  return results
}
