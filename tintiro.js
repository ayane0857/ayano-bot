const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addCoinsToAllUsers() {
    try {
        const result = await prisma.userServer.updateMany({
            data: {
                coin: {
                    increment: 500,
                },
            },
        });

        console.log(`Updated ${result.count} users' coins!`);
    } catch (error) {
        console.error('Error updating coins:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addCoinsToAllUsers();
