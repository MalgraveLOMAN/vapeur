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
async function DataTests() {
    const games = await prisma.Game.findMany();
    const editors = await prisma.Editor.findMany();

    if (editors.length > 0) {
        return;
    }

    try {
        await prisma.Editor.createMany({
            data: [
                { name: 'Nintendo' },
                { name: 'RiotGames' },
                { name: 'NaughtyDog' },
            ],
        });

        const types = await prisma.Type.findMany();

        const typeNotSet = await types.find(type => type.type === 'NOTSET');
        const typeAction = await types.find(type => type.type === 'Action');
        const typeAventure = await types.find(type => type.type === 'Aventure');
        const typeRPG = await types.find(type => type.type === 'RPG');
        const typeSimulation = await types.find(type => type.type === 'Simulation');
        const typeSport = await types.find(type => type.type === 'Sport');
        const typeMMORPG = await types.find(type => type.type === 'MMORPG');

        if (games.length > 0) {
            return;
        }
        await prisma.Game.createMany({
            data: [
                {
                    title: 'The Legend of Zelda: Breath of the Wild',
                    description: 'Un jeu d\'aventure où le joueur explore un monde ouvert.',
                    releaseDate: new Date('2017-03-03'),
                    typeId: typeAv - enture.id,
                    editorId: (await prisma.Editor.findUnique({ where: { name: 'Nintendo' } })).id,
                },
                {
                    title: 'Super Mario Odyssey',
                    description: 'Un jeu de plateforme en 3D où Mario doit sauver Princess Peach.',
                    releaseDate: new Date('2017-10-27'),
                    typeId: typeAction.id,
                    editorId: (await prisma.Editor.findUnique({ where: { name: 'Nintendo' } })).id,
                },
                {
                    title: 'League of Legends',
                    description: 'Un jeu de type MOBA où deux équipes s’affrontent pour détruire la base ennemie.',
                    releaseDate: new Date('2009-10-27'),
                    typeId: typeMMORPG.id,
                    editorId: (await prisma.Editor.findUnique({ where: { name: 'RiotGames' } })).id,
                },
                {
                    title: 'Valorant',
                    description: 'Un jeu de tir tactique où chaque personnage possède des capacités uniques.',
                    releaseDate: new Date('2020-06-02'),
                    typeId: typeAction.id,
                    editorId: (await prisma.Editor.findUnique({ where: { name: 'RiotGames' } })).id,
                },
                {
                    title: 'The Last of Us Part II',
                    description: 'Un jeu d\'action-aventure dans un monde post-apocalyptique.',
                    releaseDate: new Date('2020-06-19'),
                    typeId: typeRPG.id,
                    editorId: (await prisma.Editor.findUnique({ where: { name: 'NaughtyDog' } })).id,
                },
                {
                    title: 'Uncharted 4: A Thief\'s End',
                    description: 'Un jeu d\'aventure avec des énigmes et des combats intenses.',
                    releaseDate: new Date('2016-05-10'),
                    typeId: typeAction.id,
                    editorId: (await prisma.Editor.findUnique({ where: { name: 'NaughtyDog' } })).id,
                },
            ],
        });
    } catch (error) {
        console.error('Erreur lors de l\'insertion des données de test:', error);
    } finally {
        console.log('Insertion des données de test terminée');
    }
}

//Helper pour changer le type des dates (ici en année)
//Utilisation dans .hbs : {{getYear Date}}
hbs.registerHelper('getYear', function (date) {
    const year = new Date(date).getFullYear();
    return year;
});

//////////////////////////////////////////////////
//                                              //
//      A Faire : Gérer les jointures !!!!      //
//                                              //
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//                                              //
//      A Faire : Gérer les Dates Niveau server //
//     voir route /                             //
//                                              //
//////////////////////////////////////////////////

// Notes :
// Optimisations possibles : 
// Répétition de code gameType.hbs, gameList.hbs,index.hbs => Faire un seul fichier qui prends en compte les 3
//Afficher index.hbs (Liste des jeux mis en avant)
app.get("/", async (req, res) => {
    const games = await prisma.Game.findMany({
        where: {
            FrontPage: true,
        },
        include: {
            type: true,
            editor: true,
        },
    });
    games.forEach(game => {
        game.releaseDate = game.releaseDate.getFullYear();
    });
    res.render("games/index", {
        games,
    });
});

//Afficher types.hbs (Liste des genres de jeux)
app.get("/types", async (req, res) => {
    const types = await prisma.Type.findMany();
    res.render("types/typeList", {
        types,
    });
});

//Afficher gameType.hbs (Liste des jeux d'un même genre)
app.get("/games/type/:id", async (req, res) => {
    const { id } = req.params;

    const types = await prisma.Type.findUnique({
        where: { id: parseInt(id) },
        include: {
            games: {
                include: {
                    editor: true,
                },
            },
        },
    });
    res.render("types/gameType", {
        types,
    });
});


//Afficher gameList.hbs (Liste de tous les jeux)
app.get("/games", async (req, res) => {
    const games = await prisma.Game.findMany({
        include: {
            type: true,
            editor: true,
        },
    });
    res.render("games/gameList", {
        games,
    });
})

//Afficher games.hbs (Un seul seul)
app.get("/games/:id", async (req, res) => {
    const { id } = req.params;
    const games = await prisma.Game.findUnique({
        where: { id: parseInt(id) },
        include: {
            type: true,
            editor: true,
        },
    });
    res.render("games/games", {
        games,
    });
});

//Afficher les editoList.hbs (La liste de tous les éditeurs de jeux)
app.get("/editors", async (req, res) => {
    const editors = await prisma.Editor.findMany();
    res.render("editors/editorList", {
        editors,
    });
})

//Afficher gameEditor.hbs (La liste des jeux édités par un édituer)
app.get("/games/editor/:id", async (req, res) => {
    const { id } = req.params;
    const editor = await prisma.Editor.findUnique({
        where: { id: parseInt(id) },
        include: {
            games: {
                include: {
                    type: true,
                },
            },
        },
    });
    res.render("editors/gameEditor.hbs", {
        editor,
    });
});


//Vérifier si les genres de jeux existent ou non, si non alors les insérer dans la base de données
CheckInsert();
//Insérer un sample de données pour effectuer des tests
DataTests();

//Mettre le serveur en mode écoute
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});