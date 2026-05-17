docker ps -a# Unhooked api server
It follows mvc architecture. Tech stack used :
- `POSTGRES`
- `EXPRESS`
- `TYPESCRIPT`
- `DOCKER`
- `REDIS`
- `BULLMQ`
- `CLOUDINARY`

## Setup using Docker
Make sure that you have docker in your system.
Execute the following command and Server will be running at 3000 PORT.

`docker run -e PORT=3000 -p 3000:3000 unhooked-server`

In case of any changes you can retry building docker again

`docker build -t unhooked-server`

In case above feels complex, just execute below command and thats it:

`npm run start-docker`

You can also use `docker compose`
- use the following command: `npm run docker-compose-dev`

## Setup without Docker
For day-to-day development, use Neon Postgres so Docker does not need to run locally.

1. Create a Neon database with the same database name, user, and password values from `src/shared/environment/.env.development`.
2. Put the Neon endpoint in `POSTGRES_HOST` and keep `POSTGRES_SSL=true`.
3. Install dependencies with `npm install`.
4. Run migrations with `npm run migrate`.
5. Start the server with `npm run start-dev`.

You can also use a full Neon connection string by setting `DATABASE_URL`. If `DATABASE_URL` contains `sslmode=require`, the server will enable SSL automatically.

If you are connecting to a database that already has the current tables, run `npm run migrate:baseline` once instead of rerunning old `CREATE TABLE` migrations.
