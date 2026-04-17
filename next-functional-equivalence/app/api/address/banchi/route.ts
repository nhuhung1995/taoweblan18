import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getContext, assertContextForStep, updateContext } from '@/lib/state-manager';
import { normalizeAddressInput } from '@/lib/normalization';
import { badRequest, serverError } from '@/lib/http';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const contextId = body?.context_id || req.cookies.get('context_id')?.value;
    const banchi = normalizeAddressInput(body?.banchi_number || '');

    if (!contextId) return badRequest('context_id is required.');
    if (!banchi) return badRequest('banchi_number is required.');

    const context = getContext(contextId);
    const guard = assertContextForStep(context, 'banchi');
    if (!guard.ok) return badRequest(guard.error);

    const updated = updateContext(contextId, {
      step: 'banchi',
      banchi,
      room: undefined
    });

    const roomRows = await prisma.addressMaster.findMany({
      where: {
        zipcode: updated?.zipcode,
        chome: updated?.chome,
        banchi
      },
      select: { id: true, room: true },
      orderBy: { room: 'asc' },
      take: 500
    });

    return NextResponse.json({
      context_id: updated?.contextId,
      banchi_number: banchi,
      rooms: roomRows.map((r) => ({ room_id: r.id, room: r.room }))
    });
  } catch {
    return serverError();
  }
}
