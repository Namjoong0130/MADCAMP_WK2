const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const brandHandles = [
    "@skyline.designer",
    "@rose.form",
    "@chestnut.lab",
    "@oat.edition",
    "@midnight.lab",
    "@cloud.line",
    "@ink.atelier"
];

async function main() {
    console.log('Cleaning up seed data...');

    // 1. Find Owners by email
    const emails = brandHandles.map(h => `owner_${h.replace('@', '')}@example.com`);

    const owners = await prisma.user.findMany({
        where: { email: { in: emails } },
        select: { user_id: true }
    });

    const ownerIds = owners.map(u => u.user_id);

    if (ownerIds.length === 0) {
        console.log('No seed owners found.');
        return;
    }

    // 2. Find Brands owned by these users
    const brands = await prisma.brand.findMany({
        where: { owner_id: { in: ownerIds } },
        select: { brand_id: true }
    });

    const brandIds = brands.map(b => b.brand_id);

    // 3. Delete Fundings associated with Clothes of these Brands
    // First find clothes
    const clothes = await prisma.cloth.findMany({
        where: { brand_id: { in: brandIds } },
        select: { clothing_id: true }
    });
    const clothIds = clothes.map(c => c.clothing_id);

    if (clothIds.length > 0) {
        const deletedFunds = await prisma.fund.deleteMany({
            where: { clothing_id: { in: clothIds } }
        });
        console.log(`Deleted ${deletedFunds.count} Fundings.`);

        // Also delete Comments, Likes (if separate table?), etc if needed.
        // Assuming cascade or simple cleanup.
    }

    // 4. Delete Clothes
    if (brandIds.length > 0) {
        const deletedClothes = await prisma.cloth.deleteMany({
            where: { brand_id: { in: brandIds } }
        });
        console.log(`Deleted ${deletedClothes.count} Clothes.`);

        // 5. Delete Brands
        const deletedBrands = await prisma.brand.deleteMany({
            where: { brand_id: { in: brandIds } }
        });
        console.log(`Deleted ${deletedBrands.count} Brands.`);
    }

    // 6. Delete Users (Owners)
    const deletedUsers = await prisma.user.deleteMany({
        where: { user_id: { in: ownerIds } }
    });
    console.log(`Deleted ${deletedUsers.count} Owners.`);

    console.log('Seed cleanup completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
