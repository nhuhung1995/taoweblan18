import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { filterAvailability } from '@/lib/availability';
import { getContext, assertContextForStep, updateContext } from '@/lib/state-manager';
import { normalizeAddressInput } from '@/lib/normalization';
import { badRequest, serverError } from '@/lib/http';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const contextId = body?.context_id || req.cookies.get('context_id')?.value;
    const roomId = typeof body?.room_id === 'string' ? body.room_id : '';
    const roomText = normalizeAddressInput(body?.room || '');

    if (!contextId) return badRequest('context_id is required.');

    const context = getContext(contextId);
    const guard = assertContextForStep(context, 'room');
    if (!guard.ok) return badRequest(guard.error);

    let finalAddress = null;

    if (roomId) {
      finalAddress = await prisma.addressMaster.findUnique({
        where: { id: roomId }
      });
    } else if (roomText) {
      finalAddress = await prisma.addressMaster.findFirst({
        where: {
          zipcode: context?.zipcode,
          chome: context?.chome,
          banchi: context?.banchi,
          room: roomText
        }
      });
    } else {
      return badRequest('room_id or room is required.');
    }

    if (!finalAddress) {
      return badRequest('Final address not found.');
    }

    const plans = await filterAvailability(finalAddress.id);
    const updated = updateContext(contextId, {
      step: 'room',
      room: finalAddress.room
    });

    return NextResponse.json({
      context_id: updated?.contextId,
      final_address_id: finalAddress.id,
      final_address: {
        zipcode: finalAddress.zipcode,
        chome: finalAddress.chome,
        banchi: finalAddress.banchi,
        room: finalAddress.room
      },
      eligible_plans: plans
    });
  } catch {
    return serverError();
  }
}
