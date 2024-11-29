const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    await prisma.Type.createMany({
        data: [
            { type: 'NOTSET', description: 'Genre non renseigné' },
            { type: 'Action', description: 'Jeux rapides axés sur les combats et la coordination.' },
            { type: 'Aventure', description: 'Exploration et résolution d\'énigmes avec une forte narration.' },
            { type: 'RPG', description: 'Jouer un personnage qui évolue dans une histoire et un monde.' },
            { type: 'Simulation', description: 'Reproduction réaliste d’activités ou de systèmes réels.' },
            { type: 'Sport', description: 'Simulation de compétitions sportives.' },
            { type: 'MMORPG', description: 'Jeu de rôle en ligne avec de nombreux joueurs dans un monde persistant.' },
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