How to start Vapeur ? 

Run at filepath\vapeur>
This command : 



Dev Only : 
0.Install node_modules : npm install
1.Start Prisma Client npx prisma generate
2.Run server hot loading : npm run dev


If changes on data base are needed : 
npx prisma migrate dev --name init
Seed : npx prisma db seed (soon obsolete)
Reset Db : npx prisma migrate reset