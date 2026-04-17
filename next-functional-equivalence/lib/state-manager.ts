import { randomUUID } from 'node:crypto';

export type AddressStep = 'zipcode' | 'chome' | 'banchi' | 'room';

type ContextState = {
  contextId: string;
  step: AddressStep;
  zipcode?: string;
  chome?: string;
  banchi?: string;
  room?: string;
  expiresAt: number;
};

const store = new Map<string, ContextState>();
const TTL_MS = 30 * 60 * 1000;

function now() {
  return Date.now();
}

function withTtl(state: Omit<ContextState, 'expiresAt'>): ContextState {
  return { ...state, expiresAt: now() + TTL_MS };
}

export function createContext(seed?: Partial<ContextState>) {
  const contextId = randomUUID();
  const state = withTtl({
    contextId,
    step: 'zipcode',
    ...seed
  });
  store.set(contextId, state);
  return state;
}

export function getContext(contextId?: string | null) {
  if (!contextId) return null;
  const state = store.get(contextId);
  if (!state) return null;
  if (state.expiresAt < now()) {
    store.delete(contextId);
    return null;
  }
  return state;
}

export function updateContext(contextId: string, patch: Partial<ContextState>) {
  const current = getContext(contextId);
  if (!current) return null;
  const next = withTtl({ ...current, ...patch, contextId });
  store.set(contextId, next);
  return next;
}

export function assertContextForStep(
  context: ContextState | null,
  required: AddressStep
): { ok: true } | { ok: false; error: string } {
  if (!context) return { ok: false, error: 'Invalid or expired context_id.' };
  if (required === 'chome' && !context.zipcode) {
    return { ok: false, error: 'Missing zipcode in context.' };
  }
  if (required === 'banchi' && (!context.zipcode || !context.chome)) {
    return { ok: false, error: 'Missing zipcode/chome in context.' };
  }
  if (required === 'room' && (!context.zipcode || !context.chome || !context.banchi)) {
    return { ok: false, error: 'Missing zipcode/chome/banchi in context.' };
  }
  return { ok: true };
}
