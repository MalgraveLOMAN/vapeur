// Imports
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");
const hbs = require("hbs");
const path = require("path");
const { deserialize } = require("v8");

// App creation
const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

// Server & Handlebars config
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
hbs.registerPartials(path.join(__dirname, "views", "partials"));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

//Gestion des menu déroulant des fomulaires, ajout global à la réponse de requête
//Si types et editors sont vide alors, le récupérer dans la bdd, sinon, juste assigner à res.locals.type
//https://www.geeksforgeeks.org/express-js-res-locals-property/
let TypesEditorObject = { types: null, editors: null };
app.use(async (req, res, next) => {
    try {
        if (!TypesEditorObject.types || !TypesEditorObject.editors) {
            TypesEditorObject.types = await prisma.Type.findMany();
            TypesEditorObject.editors = await prisma.Editor.findMany({
                where: {
                    active: true,
                }
            });
        }
        res.locals.types = TypesEditorObject.types;
        res.locals.editors = TypesEditorObject.editors;
        next();
    } catch (error) {
        console.error(error);
        next(error);
    }
});

//Renvoyer les dates sous un format YYYY
function formatGameDates(games) {
    games.forEach(game => {
        if (game.releaseDate instanceof Date) {
            game.releaseDate = game.releaseDate.getFullYear();
        }
    });
    return games;
}

//Data Creation & Data Check

async function CheckInsert() {
    try {
        const types = await prisma.Type.findMany();
        if (types.length > 0) {
            return;
        }
        await prisma.Type.createMany({
            data: [
                { type: 'Action', description: 'Jeux rapides axés sur les combats et la coordination.' },
                { type: 'Aventure', description: 'Exploration et résolution d\'énigmes avec une forte narration.' },
                { type: 'RPG', description: 'Inspiré des jeux de table : un personnage qui évolue dans une histoire et un monde.' },
                { type: 'Simulation', description: 'Reproduction d\'activité ou d\'action dans divers environnements.' },
                { type: 'Sport', description: 'Simulation de compétitions sportives.' },
                { type: 'MMORPG', description: 'Jeu de rôle en ligne massivement multijoueur' },
                { type: 'MOBA', description: 'Jeu de de bataille dans une arène en ligne multijoueur' },
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
                {
                    name: 'Nintendo',
                    description: "Nintendo est une entreprise multinationale japonaise par Yamauchi Fusajirō8 à Kyoto. Elle est spécialisée dans la fabrication de consoles de jeu vidéo depuis 1977 avec la sortie de la Color TV-Game, ainsi que dans la conception de jeux vidéo, dont les séries Mario et The Legend of Zelda."
                },
                {
                    name: 'RiotGames',
                    description: "Riot Games est une entreprise américaine d'édition et de développement de jeux vidéo fondée en 2006 et située à Los Angeles, en Californie. Elle organise aussi plusieurs tournois de sport électronique."
                },
                {
                    name: 'NaughtyDog',
                    description: "Naughty Dog est une société américaine de développement de jeu vidéo domiciliée à Santa Monica, fondée en 1984 par Andy Gavin et Jason Rubin sous le nom de JAM Software, avant d'être rebaptisé Naughty Dog en 1989."
                },
                {
                    name: 'FromSoftware',
                    description: "FromSoftware, Inc. (株式会社フロム・ソフトウェア, Kabushikigaisha Furomu Sofutowea?) est une entreprise japonaise de développement de jeux vidéo, fondée en 1986 et située à Tokyo. Elle est notamment connue pour avoir créé les séries Dark Souls et Armored Core, ainsi que les jeux Bloodborne (2015), Sekiro: Shadows Die Twice (2019) et Elden Ring (2022).",
                }
            ],
        });

        const types = await prisma.Type.findMany();

        const typeAction = await types.find(type => type.type === 'Action');
        const typeAventure = await types.find(type => type.type === 'Aventure');
        const typeRPG = await types.find(type => type.type === 'RPG');
        const typeSimulation = await types.find(type => type.type === 'Simulation');
        const typeSport = await types.find(type => type.type === 'Sport');
        const typeMMORPG = await types.find(type => type.type === 'MMORPG');
        const typeMOBA = await types.find(type => type.type === 'MOBA');

        if (games.length > 0) {
            return;
        }
        await prisma.Game.createMany({
            data: [
                {
                    title: 'The Legend of Zelda: Breath of the Wild',
                    description: 'Un jeu d\'aventure où le joueur explore un monde ouvert.',
                    releaseDate: new Date('2017-03-03'),
                    typeId: 2,
                    editorId: 1
                },
                {
                    title: 'Super Mario Odyssey',
                    description: 'Un jeu de plateforme en 3D où Mario doit sauver Princess Peach.',
                    releaseDate: new Date('2017-10-27'),
                    typeId: 1,
                    editorId: 1
                },
                {
                    title: 'League of Legends',
                    description: 'Un jeu de type MOBA où deux équipes s’affrontent pour détruire la base ennemie.',
                    releaseDate: new Date('2009-10-27'),
                    typeId: 7,
                    editorId: 2
                },
                {
                    title: 'Valorant',
                    description: 'Un jeu de tir tactique où chaque personnage possède des capacités uniques.',
                    releaseDate: new Date('2020-06-02'),
                    typeId: 1,
                    editorId: 2
                },
                {
                    title: 'The Last of Us Part II',
                    description: 'Un jeu d\'action-aventure dans un monde post-apocalyptique.',
                    releaseDate: new Date('2020-06-19'),
                    typeId: 3,
                    editorId: 3
                },
                {
                    title: 'Uncharted 4: A Thief\'s End',
                    description: 'Un jeu d\'aventure avec des énigmes et des combats intenses.',
                    releaseDate: new Date('2016-05-10'),
                    typeId: 1,
                    editorId: 3
                },
            ],
        });
    } catch (error) {
        console.error('Erreur lors de l\'insertion des données de test:', error);
    } finally {
        console.log('Insertion des données de test terminée');
    }
}

//Vérifier si les genres de jeux existent ou non, si non alors les insérer dans la base de données
CheckInsert();
//Insérer un sample de données pour effectuer des tests
DataTests();

//////////////////
//              //
//    C R U D   //
//              //
//////////////////

// Create Data Section

app.post("/gameCreate", async function (req, res) {
    try {
        const {
            'game-title': title,
            'game-description': description,
            'game-editor': editorId,
            'game-type': typeId,
            'game-release-date': releaseDate
        } = req.body;
        await prisma.game.create({
            data: {
                title,
                description,
                releaseDate: new Date(releaseDate),
                typeId: parseInt(typeId),
                editorId: parseInt(editorId),
            },
        });
        res.redirect(req.get("referer"));
    } catch (error) {
        console.error("An error has occured : ", error);
        res.status(500).send("An error has occured.");
    }
});

app.post("/editorCreate", async function (req, res) {
    try {
        const {
            'game-editor-name': name,
            'game-editor-description': description
        } = req.body;

        //Si l'editeur existait au paravant, alors il a déjà une description, si rien n'est renseigné dans le formulaire
        // L'editeur reprend sa description initiale
        const updateData = { active: true };
        if (description) {
            updateData.description = description;
        }

        await prisma.editor.upsert({
            where: {
                name: name,
            },
            update: updateData,
            create: {
                name: name,
                description: description,
            }
        });

        res.redirect(req.get("referer"));
    } catch (error) {
        console.error("An error has occurred:", error);
        res.status(500).send("An error has occurred.");
    }
});


// Read Data Section

// Afficher les jeux mis en avant sur la page principale index.hbs
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
    formatGameDates(games);
    res.render("games/index", {
        title: "Vapeur - Home page",
        games,
    });
});

// Afficher listType.hbs (Liste des genres de jeux)
app.get("/types", async (req, res) => {
    const types = await prisma.Type.findMany();
    res.render("types/listTypes", {
        title: "Vapeur - Game Types",
        types,
    });
});

// Afficher gamesByType.hbs (Liste des jeux d'un même genre)
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
    formatGameDates(types.games);
    res.render("types/gamesByType", {
        title: `Vapeur - ${types.type}`,
        types,
    });
});

// Afficher listGames.hbs (Liste de tous les jeux)
app.get("/games", async (req, res) => {
    const games = await prisma.Game.findMany({
        include: {
            type: true,
            editor: true,
        },
    });
    formatGameDates(games);
    res.render("games/listGames", {
        title: "Vapeur - All Games",
        games,
    });
});

// Afficher gameDetails.hbs (Détails d'un seul jeu)
app.get("/games/:id", async (req, res) => {
    const { id } = req.params;
    const games = await prisma.Game.findUnique({
        where: { id: parseInt(id) },
        include: {
            type: true,
            editor: true,
        },
    });
    games.releaseDate = games.releaseDate.getFullYear();

    res.render("games/gameDetails", {
        title: `Vapeur - ${games.title}`,
        games,
    });
});

// Afficher les listEditors.hbs (Liste de tous les éditeurs de jeux)
app.get("/editors", async (req, res) => {
    const a_editors = await prisma.Editor.findMany();
    res.render("editors/listEditors", {
        title: "Vapeur - Editors",
        a_editors,
    });
});

// Afficher gamesByEditor.hbs (Liste des jeux édités par un éditeur)
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
    if (editor.active) {
        formatGameDates(editor.games);
        res.render("editors/gamesByEditor", {
            title: `Vapeur - ${editor.name}`,
            editor,
        });
    }
    else {
        res.redirect("/404");
    }
});

// Update Data Section

app.post("/removeFront", async (req, res) => {
    let games = req.body['game-id'];
    games: [games];
    for (const game of games) {
        await prisma.Game.update({
            where: {
                id: parseInt(game),
            },
            data: {
                FrontPage: false,
            },
        });
    }
    res.redirect(req.get("referer"));
});


//Ajouter les games de la frontpage
app.post("/addFront", async (req, res) => {
    let games = req.body['game-id'];
    games: [games];
    for (const game of games) {
        await prisma.Game.update({
            where: {
                id: parseInt(game),
            },
            data: {
                FrontPage: true,
            },
        });
    }
    res.redirect(req.get("referer"));
})


//Supprimer les editeurs
app.post("/editor/delete", async (req, res) => {
    let editors = req.body['editor-id'];
    editors: [editors];
    for (const editor of editors) {
        await prisma.Editor.update({
            where: {
                id: parseInt(editor),
            },
            data: {
                active: false,
            },
        });
    }
    res.redirect(req.get("referer"));
})

// Delete Data Section


//Supprimer les games
app.post("/game/delete", async (req, res) => {
    let games = req.body['game-id'];
    games: [games];
    for (const game of games) {
        await prisma.Game.delete({
            where: {
                id: parseInt(game),
            },
        });
    }
    res.redirect(req.get("referer"));
})

//////////////////////
//                  //
//   A faire : 404  //
//                  //
//////////////////////

// Mettre le serveur en mode écoute
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});