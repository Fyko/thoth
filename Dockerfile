FROM node:16-alpine

LABEL name "Thoth"
LABEL version "3.0.0"
LABEL maintainer "Carter Himmel <fyko@sycer.dev>"

WORKDIR /usr/thoth

COPY package.json yarn.lock ./

RUN apk add --update
RUN apk add --no-cache ca-certificates
RUN apk add --no-cache --virtual .build-deps git curl build-base python3 g++ make libtool autoconf automake
RUN yarn --frozen-lockfile

COPY . .

RUN yarn build
CMD ["node", "."]