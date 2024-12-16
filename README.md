# Vapeur - Mathieu Dumas - MalgraveLOMAN

## Avant de commencer installez Node.js et npm

- **Node.js** : [Télécharger Node.js](https://nodejs.org/)
- **npm** : Inclus avec Node.js.

## Installation et Démarrage

1. Clonez le projet sur votre ordinateur ou téléchargez le code source et suivez les étapes :
   ```bash
   git clone <https://github.com/MalgraveLOMAN/vapeur.git>
   ```

2. Dans le terminal Node, rendez-vous à la racine du projet et executez les étapes suivantes :

3. Installez les dépendances :
   ```bash
   npm install
   # ou
   # npm i
   ```

4. Générez les fichiers Prisma :
   ```bash
   npx prisma generate
   ```

5. Créer un fichier `.env` à la racine du projet et copiez :
   ```env
   DATABASE_URL="file:./database.db"
   ```

6. Initialiser la base de données :
   ```bash
   npx prisma migrate dev --name init
   ```

7. Lancez le serveur :
   ```bash
   npm start
   ```

## Commandes supplémentaires

- **Mode de développement :** :
  ```bash
  npm run dev
  ```

- **Vider la base de données : ** :
  ```bash
  npx prisma migrate reset
  ```