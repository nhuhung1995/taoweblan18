import { prisma } from '@/lib/prisma';

type EligiblePlan = {
  code: string;
  name: string;
  speedMbps: number;
};

export async function filterAvailability(finalAddressId: string): Promise<EligiblePlan[]> {
  const infra = await prisma.infrastructureMap.findUnique({
    where: { addressId: finalAddressId }
  });

  if (!infra) return [];

  if (infra.infraType === 'VDSL') {
    return [
      {
        code: 'VDSL-100M',
        name: 'VDSL 100Mbps Plan',
        speedMbps: 100
      }
    ];
  }

  return [
    {
      code: 'FIBER-1G',
      name: 'Fiber 1G Plan',
      speedMbps: 1000
    },
    {
      code: 'FIBER-10G',
      name: 'Fiber 10G Plan',
      speedMbps: 10000
    }
  ];
}
