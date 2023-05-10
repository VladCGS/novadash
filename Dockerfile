# podman build --no-cache -t test_alphaping -f Dockerfile ../..
FROM node:19-bullseye AS development

WORKDIR /app

COPY ./package.json ./
RUN yarn


COPY ./apps/alphaping ./apps/alphaping
COPY ./apps/ms-pairs ./apps/ms-pairs
COPY ./apps/ms-balances ./apps/ms-balances
COPY ./apps/ms-transaction ./apps/ms-transaction
COPY ./libs ./libs

COPY ./nest-cli.json ./
COPY ./tsconfig.build.json ./
COPY ./tsconfig.json ./

COPY ./.env.prod ./.env.global
COPY ./apps/alphaping/.env ./.env

RUN yarn build alphaping
RUN ls -la

FROM node:19-bullseye as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY --from=development app/.env.global ./.env.global
COPY --from=development app/.env ./.env

COPY --from=development app/dist ./dist
COPY --from=development app/node_modules ./node_modules

CMD ["node", "dist/apps/alphaping/apps/alphaping/src/main.js"]
