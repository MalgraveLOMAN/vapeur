const express = require("express");
const app = express();
const PORT = 3000;

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


app.use(express.static(__dirname + '/'));

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});