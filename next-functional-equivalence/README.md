# Functional Equivalence Module (Next.js + Prisma)

This folder is an integration-ready module for stateful address flow:

- `POST /api/address/zipcode`
- `POST /api/address/chome`
- `POST /api/address/banchi`
- `POST /api/address/room`

## Core Behaviors

- Every step requires `context_id` (from cookie/session or request body).
- Each step validates previous-step context before returning next-step data.
- If user changes zipcode/chome/banchi on frontend, downstream state is reset via `useReducer`.
- Final step calls `filterAvailability(finalAddressId)` and maps:
  - `VDSL` -> `VDSL 100Mbps`
  - `FIBER` -> `Fiber 1G` + `Fiber 10G`

## Setup

```bash
cd next-functional-equivalence
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run dev
```

## Prisma Tables

- `AddressMaster`
- `InfrastructureMap`

## Important Files

- `app/api/address/*/route.ts` - Serverless state manager routes
- `lib/state-manager.ts` - Context/session state
- `lib/availability.ts` - Infrastructure plan filter
- `lib/normalization.ts` - Full-width/Half-width normalization
- `components/AddressFlowMachine.tsx` - frontend state machine
