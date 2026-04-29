# Unhooked api server
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