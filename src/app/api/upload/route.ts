import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif'
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Expected multipart/form-data with a "file" field' }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size === 0) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 413 })
    }

    const mimeType = (file.type || '').toLowerCase()
    const extension = MIME_EXTENSIONS[mimeType]

    if (!extension) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a JPG, PNG, WEBP, GIF or AVIF image.' },
        { status: 415 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Basic signature check — prevents uploading non-image content with a spoofed MIME type.
    if (!looksLikeImage(buffer, extension)) {
      return NextResponse.json({ error: 'The uploaded file is not a valid image.' }, { status: 415 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const filename = `${Date.now()}-${randomUUID()}.${extension}`
    await writeFile(path.join(uploadDir, filename), buffer)

    return NextResponse.json({ url: `/uploads/${filename}`, size: file.size, type: mimeType }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/upload]', err)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}

function looksLikeImage(buffer: Buffer, extension: string): boolean {
  if (buffer.length < 12) return false

  switch (extension) {
    case 'jpg':
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
    case 'png':
      return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    case 'gif':
      return buffer.subarray(0, 3).toString('ascii') === 'GIF'
    case 'webp':
      return buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    case 'avif':
      return buffer.subarray(4, 8).toString('ascii') === 'ftyp'
    default:
      return false
  }
}
