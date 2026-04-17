import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getContext, assertContextForStep, updateContext } from '@/lib/state-manager';
import { normalizeAddressInput } from '@/lib/normalization';
import { badRequest, serverError } from '@/lib/http';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const contextId = body?.context_id || req.cookies.get('context_id')?.value;
    const chomeId = normalizeAddressInput(body?.chome_id || '');

    if (!contextId) return badRequest('context_id is required.');
    if (!chomeId) return badRequest('chome_id is required.');

    const context = getContext(contextId);
    const guard = assertContextForStep(context, 'chome');
    if (!guard.ok) return badRequest(guard.error);

    const updated = updateContext(contextId, {
      step: 'chome',
      chome: chomeId,
      banchi: undefined,
      room: undefined
    });

    const banchiRows = await prisma.addressMaster.findMany({
      where: {
        zipcode: updated?.zipcode,
        chome: chomeId
      },
      distinct: ['banchi'],
      select: { banchi: true },
      orderBy: { banchi: 'asc' },
      take: 500
    });

    return NextResponse.json({
      context_id: updated?.contextId,
      chome_id: chomeId,
      banchi_numbers: banchiRows.map((r) => r.banchi)
    });
  } catch {
    return serverError();
  }
}
