FROM node:16.13.2-alpine as base

ENV NODE_ENV=production

WORKDIR /app

####################
##### Sources ######
####################

FROM base as sources

COPY package.json .
COPY yarn.lock .
COPY prisma/ prisma/

RUN yarn install --production=false
RUN yarn prisma generate

####################
### Dependencies ###
####################

FROM sources as dependencies

RUN yarn install --frozen-lockfile --force --production --ignore-scripts --prefer-offline

####################
###### Build #######
####################

FROM sources as build

COPY tsconfig.json .
COPY tsconfig.build.json .
COPY src/ src/

RUN yarn build

####################
##### Release ######
####################

FROM base as release

COPY --from=dependencies --chown=node:node /app/node_modules/ /app/node_modules/
COPY --from=build --chown=node:node /app/dist/ /app/dist/
COPY --from=build --chown=node:node /app/package.json /app/package.json
COPY --from=build --chown=node:node /app/prisma/ /app/prisma/

# Create db directory
RUN mkdir /app/db
RUN chown -R node:node /app/db

USER node

CMD ["node", "/app/dist/src/index.js"]
