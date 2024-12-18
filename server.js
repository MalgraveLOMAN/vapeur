//Imports
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");
const hbs = require("hbs");
const path = require("path");
const multer = require('multer');
//PrimaClient Creation & Express server Creation
const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

//Express & Handlebars config
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

hbs.registerPartials(path.join(__dirname, "views", "partials"));

//Helper used in editGames in order to set a dropdown menu value
hbs.registerHelper('setValue', function (value1, value2, attribute) {
    return value1 === value2 ? attribute : '';
});

//Multer configuration & filtering
const ImageFile = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const Types = ['image/jpeg', 'image/png',];
    if (Types.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsuported image type'), false);
    }
};

const upload = multer({
    storage: ImageFile,
    fileFilter
});

//https://www.geeksforgeeks.org/express-js-res-locals-property/
//Local.res creation & gestion
let TypesEditorObject = { types: null, editors: null, lastUpdate: 0 };
app.use(async (req, res, next) => {
    let now = Date.now();
    try {
        if (!TypesEditorObject.types || !TypesEditorObject.editors || now - TypesEditorObject.lastUpdate > 100) {
            TypesEditorObject.types = await prisma.Type.findMany();
            TypesEditorObject.editors = await prisma.Editor.findMany({
                where: {
                    active: true,
                },
            });
            TypesEditorObject.lastUpdate = now;
        }
        res.locals.types = TypesEditorObject.types;
        res.locals.editors = TypesEditorObject.editors;
        next();
    } catch (error) {
        console.error(error);
        next();
    }
});

//Return YYYY type dates
function formatGameDates(games) {
    games.forEach(game => {
        if (game.releaseDate instanceof Date) {
            game.releaseDate = game.releaseDate.getFullYear();
        }
    });
    return games;
}

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


//
//  CREATE
//

//Create Game with Image & Add To DB
app.post('/gameCreate', upload.single('game-image'), async function (req, res) {
    try {
        const {
            'game-title': title,
            'game-description': description,
            'game-editor': editorId,
            'game-type': typeId,
            'game-release-date': releaseDate
        } = req.body;

        const imagePath = req.file ? `/img/${req.file.filename}` : null;

        await prisma.game.create({
            data: {
                title,
                description,
                releaseDate: new Date(releaseDate),
                typeId: parseInt(typeId),
                editorId: parseInt(editorId),
                imagePath
            },
        });
        res.redirect(req.get('referer'));
    } catch (error) {
        console.error('An error has occured: ', error);
        res.status(500).send('An error has occured.');
    }
});

//Create Editor & Add To DB
app.post("/editorCreate", async function (req, res) {
    try {
        const {
            'game-editor-name': name,
            'game-editor-description': description
        } = req.body;

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

//
// READ
//

//Show MainPage (index.hbs)
app.get("/", async (req, res) => {
    const games = await prisma.Game.findMany({
        where: {
            FrontPage: true,
        },
        include: {
            type: true,
            editor: true,
        },
        orderBy: {
            title: 'asc',
        },
    });
    formatGameDates(games);
    res.render("games/index", {
        title: "Vapeur - Home page",
        games,
    });
});

//Show PageTypes (listTypes.hbs)
app.get("/types", async (req, res) => {
    const types = await prisma.Type.findMany({
        orderBy: {
            type: 'asc',
        },
    });
    res.render("types/listTypes", {
        title: "Vapeur - Game Types",
        types,
    });
});

//Show One particular Type & Its games(gamesByType.hbs)
app.get("/games/type/:id", async (req, res, next) => {
    const { id } = req.params;

    const types = await prisma.Type.findUnique({
        where: { id: parseInt(id) },
        include: {
            games: {
                include: {
                    editor: true,
                },
                orderBy: {
                    title: 'asc',
                },
            },
        },
    });
    if (types) {
        formatGameDates(types.games);
        res.render("types/gamesByType", {
            title: `Vapeur - ${types.type}`,
            types,
        });
    } else {
        return next();
    }
});

//Show all games (listGames.hbs)
app.get("/games", async (req, res) => {
    const games = await prisma.Game.findMany({
        include: {
            type: true,
            editor: true,
        },
        orderBy: {
            title: 'asc',
        },
    });
    formatGameDates(games);
    res.render("games/listGames", {
        title: "Vapeur - All Games",
        games,
    });
});

//Show One particular Game (gameDetails.hbs)
app.get("/games/:id", async (req, res, next) => {
    const { id } = req.params;
    const games = await prisma.Game.findUnique({
        where: { id: parseInt(id) },
        include: {
            type: true,
            editor: true,
        },
    });
    if (games) {
        games.releaseDate = games.releaseDate.getFullYear();
        res.render("games/gameDetails", {
            title: `Vapeur - ${games.title}`,
            games,
        });
    } else {
        return next();
    }
});

//Show all editors (listEditors.hbs)
app.get("/editors", async (req, res) => {
    const a_editors = await prisma.Editor.findMany({
        orderBy: {
            name: 'asc',
        },
    });
    res.render("editors/listEditors", {
        title: "Vapeur - Editors",
        a_editors,
    });
});

//Show One particular Editor & Its games(gamesByEditor.hbs)
app.get("/games/editor/:id", async (req, res, next) => {
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
    if (editor && editor.active) {
            formatGameDates(editor.games);
        res.render("editors/gamesByEditor", {
            title: `Vapeur - ${editor.name}`,
            editor,
        });}
    else {
        return next();
    }
});

//Show the update game page (editGames.hbs)
app.get("/games/update/:id", async (req, res, next) => {
    const { id } = req.params;
    const games = await prisma.Game.findUnique({
        where: { id: parseInt(id) },
        include: {
            type: true,
            editor: true
        }
    });
    if (games) {
        games.releaseDate = new Date(games.releaseDate).toISOString().split('T')[0];
        res.render("games/editGames", {
            title: `Vapeur - Modifier ${games.title}`,
            games,
            types: res.locals.types,
            editors: res.locals.editors
        });
    } else {
        return next();
    }
});

//Show the update editor page (editEditors.hbs)
app.get("/editors/update/:id", async (req, res, next) => {
    const { id } = req.params;
    const editor = await prisma.Editor.findUnique({
        where: { id: parseInt(id) },
    });

    if (editor) {
        res.render("editors/editEditors", {
            title: `Modifier l'Éditeur : ${editor.name}`,
            editor,
        });
    } else {
        return next();
    }
});

//
// UPDATE
//

//Update One Editor Data
app.post("/editors/update/:id", async (req, res) => {
    const { id } = req.params;
    const { 'editor-name': name, 'editor-description': description } = req.body;

    await prisma.Editor.update({
        where: { id: parseInt(id) },
        data: {
            name,
            description,
        },
    });

    res.redirect(`/editors`);
});

//Update One game Data
app.post("/game/update/:id", async (req, res) => {
    const { id } = req.params;
    const { 'game-title': title, 'game-description': description, 'game-editor': editorId, 'game-type': typeId, 'game-release-date': releaseDate } = req.body;
    await prisma.Game.update({
        where: { id: parseInt(id) },
        data: {
            title,
            description,
            releaseDate: new Date(releaseDate),
            typeId: parseInt(typeId),
            editorId: parseInt(editorId),
        },
    });
    res.redirect(`/games/${id}`);
});
//Remove a game from Front Page
app.post("/removeFront", async (req, res) => {
    let games = req.body['game-id'];
    games: [games];
    if (games) {

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
    }
    res.redirect(req.get("referer"));
});

//Add a game tp Front Page
app.post("/addFront", async (req, res) => {
    let games = req.body['game-id'];
    games: [games];
    if (games) {
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
    }
    res.redirect(req.get("referer"));
})

//
// DELETE
//

//Delete an editor
app.post("/editor/delete", async (req, res) => {
    let editors = req.body['editor-id'];
    editors: [editors];
    if (editors) {

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
    }
    res.redirect("/editors");
})

//Delete a game
app.post("/game/delete", async (req, res) => {
    let games = req.body['game-id'];
    games: [games];
    if (games) {
        for (const game of games) {
            await prisma.Game.delete({
                where: {
                    id: parseInt(game),
                },
            });
        }
    }
    res.redirect("/games");
})

//
// Handle 404 errors
//

app.use((req, res) => {
    res.status(404).render('404', {
        layout: false
    });
});

//Check if Datas are set in db, if not create them.
CheckInsert();

//Start Server on port = PORT
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});