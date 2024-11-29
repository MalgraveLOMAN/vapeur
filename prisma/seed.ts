import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.typeEnum.createMany({
        data: [
            { type: 'NOTSET' },
            { type: 'Action' },
            { type: 'Aventure' },
            { type: 'RPG' },
            { type: 'Simulation' },
            { type: 'Sport' },
            { type: 'MMORPG' },
        ],
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
