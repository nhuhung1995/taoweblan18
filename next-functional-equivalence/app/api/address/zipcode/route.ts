import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeZipcode } from '@/lib/normalization';
import { createContext, getContext, updateContext } from '@/lib/state-manager';
import { badRequest, serverError } from '@/lib/http';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const zipcode = normalizeZipcode(body?.zipcode || '');

    if (zipcode.length !== 7) {
      return badRequest('zipcode must be 7 digits.');
    }

    const cookieContextId = req.cookies.get('context_id')?.value;
    const inputContextId = typeof body?.context_id === 'string' ? body.context_id : null;
    const contextId = inputContextId || cookieContextId;

    let context = getContext(contextId);
    if (!context) {
      context = createContext();
    }

    const next = updateContext(context.contextId, {
      step: 'zipcode',
      zipcode,
      chome: undefined,
      banchi: undefined,
      room: undefined
    });

    const chomeRows = await prisma.addressMaster.findMany({
      where: { zipcode },
      distinct: ['chome'],
      select: { chome: true },
      orderBy: { chome: 'asc' },
      take: 200
    });

    const res = NextResponse.json({
      context_id: next?.contextId,
      zipcode,
      chomes: chomeRows.map((r) => ({ chome_id: r.chome, label: r.chome }))
    });

    if (next?.contextId) {
      res.cookies.set('context_id', next.contextId, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/'
      });
    }

    return res;
  } catch {
    return serverError();
  }
}
