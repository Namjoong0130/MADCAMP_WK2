require('dotenv').config({ path: __dirname + '/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { toFrontendFittingHistory } = require('./src/utils/transformers');

async function main() {
    const users = await prisma.user.findMany({ take: 1 });
    if (users.length === 0) {
        console.log('No users found');
        return;
    }
    const userId = users[0].user_id;
    console.log(`Checking fittings for User ID: ${userId}`);

    const fittings = await prisma.fitting.findMany({
        where: { user_id: userId, deleted_at: null },
        include: { results: { orderBy: { created_at: 'desc' } } },
        orderBy: { created_at: 'desc' },
    });

    console.log(`Found ${fittings.length} fittings.`);

    fittings.forEach((fitting, index) => {
        console.log(`\n--- Fitting ${index + 1} (ID: ${fitting.fitting_id}) ---`);
        const transformed = toFrontendFittingHistory(fitting);
        console.log('Transformed Data:', JSON.stringify(transformed, null, 2));
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
