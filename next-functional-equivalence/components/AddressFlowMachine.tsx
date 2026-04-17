'use client';

import { useReducer, useState } from 'react';

type Option = { value: string; label: string };

type Plan = { code: string; name: string; speedMbps: number };

type State = {
  contextId: string;
  zipcode: string;
  chomeId: string;
  banchiNumber: string;
  roomId: string;
  chomeOptions: Option[];
  banchiOptions: Option[];
  roomOptions: Option[];
  plans: Plan[];
};

type Action =
  | { type: 'SET_CONTEXT'; contextId: string }
  | { type: 'SET_ZIPCODE'; zipcode: string }
  | { type: 'SET_CHOME_OPTIONS'; options: Option[] }
  | { type: 'SET_CHOME'; chomeId: string }
  | { type: 'SET_BANCHI_OPTIONS'; options: Option[] }
  | { type: 'SET_BANCHI'; banchiNumber: string }
  | { type: 'SET_ROOM_OPTIONS'; options: Option[] }
  | { type: 'SET_ROOM'; roomId: string }
  | { type: 'SET_PLANS'; plans: Plan[] };

const initialState: State = {
  contextId: '',
  zipcode: '',
  chomeId: '',
  banchiNumber: '',
  roomId: '',
  chomeOptions: [],
  banchiOptions: [],
  roomOptions: [],
  plans: []
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_CONTEXT':
      return { ...state, contextId: action.contextId };
    case 'SET_ZIPCODE':
      return {
        ...state,
        zipcode: action.zipcode,
        chomeId: '',
        banchiNumber: '',
        roomId: '',
        chomeOptions: [],
        banchiOptions: [],
        roomOptions: [],
        plans: []
      };
    case 'SET_CHOME_OPTIONS':
      return { ...state, chomeOptions: action.options };
    case 'SET_CHOME':
      return {
        ...state,
        chomeId: action.chomeId,
        banchiNumber: '',
        roomId: '',
        banchiOptions: [],
        roomOptions: [],
        plans: []
      };
    case 'SET_BANCHI_OPTIONS':
      return { ...state, banchiOptions: action.options };
    case 'SET_BANCHI':
      return {
        ...state,
        banchiNumber: action.banchiNumber,
        roomId: '',
        roomOptions: [],
        plans: []
      };
    case 'SET_ROOM_OPTIONS':
      return { ...state, roomOptions: action.options };
    case 'SET_ROOM':
      return { ...state, roomId: action.roomId, plans: [] };
    case 'SET_PLANS':
      return { ...state, plans: action.plans };
    default:
      return state;
  }
}

export function AddressFlowMachine() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submitZipcode() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/address/zipcode', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ zipcode: state.zipcode, context_id: state.contextId || undefined })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'zipcode step failed');

      dispatch({ type: 'SET_CONTEXT', contextId: json.context_id });
      dispatch({
        type: 'SET_CHOME_OPTIONS',
        options: (json.chomes || []).map((x: { chome_id: string; label: string }) => ({
          value: x.chome_id,
          label: x.label
        }))
      });
    } catch (e) {
      setError(String((e as Error).message));
    } finally {
      setBusy(false);
    }
  }

  async function submitChome() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/address/chome', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ context_id: state.contextId, chome_id: state.chomeId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'chome step failed');

      dispatch({ type: 'SET_BANCHI_OPTIONS', options: (json.banchi_numbers || []).map((x: string) => ({ value: x, label: x })) });
    } catch (e) {
      setError(String((e as Error).message));
    } finally {
      setBusy(false);
    }
  }

  async function submitBanchi() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/address/banchi', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ context_id: state.contextId, banchi_number: state.banchiNumber })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'banchi step failed');

      dispatch({
        type: 'SET_ROOM_OPTIONS',
        options: (json.rooms || []).map((x: { room_id: string; room: string }) => ({ value: x.room_id, label: x.room }))
      });
    } catch (e) {
      setError(String((e as Error).message));
    } finally {
      setBusy(false);
    }
  }

  async function submitRoom() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/address/room', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ context_id: state.contextId, room_id: state.roomId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'room step failed');

      dispatch({ type: 'SET_PLANS', plans: json.eligible_plans || [] });
    } catch (e) {
      setError(String((e as Error).message));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section style={{ display: 'grid', gap: 16 }}>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
        <strong>Step 1 - Zipcode</strong>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            value={state.zipcode}
            onChange={(e) => dispatch({ type: 'SET_ZIPCODE', zipcode: e.target.value })}
            placeholder="3320034"
          />
          <button disabled={busy} onClick={submitZipcode}>Search</button>
        </div>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
        <strong>Step 2 - Chome</strong>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <select value={state.chomeId} onChange={(e) => dispatch({ type: 'SET_CHOME', chomeId: e.target.value })}>
            <option value="">Choose chome</option>
            {state.chomeOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button disabled={busy || !state.chomeId} onClick={submitChome}>Next</button>
        </div>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
        <strong>Step 3 - Banchi</strong>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <select value={state.banchiNumber} onChange={(e) => dispatch({ type: 'SET_BANCHI', banchiNumber: e.target.value })}>
            <option value="">Choose banchi</option>
            {state.banchiOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button disabled={busy || !state.banchiNumber} onClick={submitBanchi}>Next</button>
        </div>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
        <strong>Step 4 - Room</strong>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <select value={state.roomId} onChange={(e) => dispatch({ type: 'SET_ROOM', roomId: e.target.value })}>
            <option value="">Choose room</option>
            {state.roomOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button disabled={busy || !state.roomId} onClick={submitRoom}>Check</button>
        </div>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
        <strong>Eligible Plans</strong>
        {state.plans.length === 0 ? <p style={{ marginBottom: 0 }}>No plans yet.</p> : (
          <ul>
            {state.plans.map((p) => (
              <li key={p.code}>{p.name} ({p.speedMbps} Mbps)</li>
            ))}
          </ul>
        )}
      </div>

      {error ? <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p> : null}
    </section>
  );
}
