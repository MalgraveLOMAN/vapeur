const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");
const hbs = require("hbs");

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;
const path = require('path')

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
hbs.registerPartials(path.join(__dirname, "views", "partials"));


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

async function CheckInsert() {
    try {
        const types = await prisma.Type.findMany();
        if (types.length > 0) {
            return;
        }
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
    } catch (error) {
        console.error("Erreur lors de l'insertion des types :", error);
    } finally {
        await prisma.$disconnect();
    }
}

app.get("/", async (req, res) => {
    const games = await prisma.Game.findMany({
        where: {
            FrontPage : true,
        },
    });
    res.render("games/index", {
        games,
    });
});
app.get("/types", async (req, res)=> {
    const types = await prisma.Type.findMany();
    console.log(types)
    res.render("games/types", {
        types,
    });
});
CheckInsert();
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});