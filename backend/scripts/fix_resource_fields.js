const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const resources = await prisma.resource.findMany({
    where: {
      OR: [
        { name: null },
        { name: '' },
        { type: null },
        { type: '' },
        { unit: null }
      ]
    },
    include: { resourceItem: true }
  });

  let updated = 0;
  for (const r of resources) {
    if (!r.resourceItem) continue;
    const data = {
      name: r.name || r.resourceItem.name,
      type: r.type || r.resourceItem.type,
      unit: r.unit || r.resourceItem.unit
    };
    await prisma.resource.update({
      where: { id: r.id },
      data
    });
    updated += 1;
  }

  console.log(`Updated resources: ${updated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
