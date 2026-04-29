FROM node:22-alpine

WORKDIR /app

RUN npm i -g cross-env
COPY ./package* .
# we are using npm ci instead of npm i because npm ci uses package.lock very strictly
RUN npm ci

COPY . .

# Adding EXPOSE 3000 is just for clarity, it actually doesnt makes any difference
EXPOSE 3000
RUN npm run build
CMD ["npm", "start"]