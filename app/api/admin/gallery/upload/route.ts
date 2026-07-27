import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  const authError = await requireAdminAuth(req)
  if (authError) return authError

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ ok: false, error: 'Файл не передан' }, { status: 400 })
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ ok: false, error: 'Разрешены только изображения' }, { status: 400 })
    }

    // Max 15 MB
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ ok: false, error: 'Максимальный размер — 15 МБ' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() ?? 'jpg'
    const filename = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const blob = await put(filename, file, { access: 'public' })

    return NextResponse.json({ ok: true, url: blob.url })
  } catch (err) {
    console.error('[upload] error:', err)
    return NextResponse.json({ ok: false, error: 'Ошибка загрузки' }, { status: 500 })
  }
}
