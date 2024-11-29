const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function resetDatabase() {
    try {
        prisma.Game.deleteMany();
        prisma.Type.deleteMany();
        prisma.Editor.deleteMany();


        console.log("Base de données réinitialisée !");
    } catch (error) {
        console.error("Erreur lors de la réinitialisation :", error);
    } finally {
        await prisma.$disconnect();
    }
}

resetDatabase();
