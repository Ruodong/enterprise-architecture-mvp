import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as { id?: string; x?: number; y?: number }
    if (!body?.id || typeof body.x !== 'number' || typeof body.y !== 'number') {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 })
    }

    await prisma.businessCapability.update({
      where: { id: body.id },
      data: { diagramX: body.x, diagramY: body.y }
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to save position' }, { status: 500 })
  }
}
