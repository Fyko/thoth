FROM node:12-alpine

LABEL name "Thoth"
LABEL maintainer "Fyko <fyko@sycer.dev>"

WORKDIR /usr/thoth

COPY package.json package-lock.json ./

RUN apk add --update \
        && apk add --no-cache --virtual .build-deps git build-base g++ python

RUN npm install \
        && apk del .build-deps

COPY . .

RUN npm run build
RUN npm run version
CMD [ "npm", "start" ]
