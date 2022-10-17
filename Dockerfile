FROM node:18-alpine

LABEL name "Thoth"
LABEL version "3.1.0"
LABEL maintainer "Carter Himmel <me@fyko.net>"

EXPOSE 2399

WORKDIR /usr/thoth

ENV YARN_CACHE_FOLDER=/usr/local/yarn-cache
VOLUME /usr/local/yarn-cache

COPY . .

RUN apk add --update
RUN apk add --no-cache ca-certificates
RUN apk add --no-cache --virtual .build-deps git curl build-base python3 g++ make libtool autoconf automake bash
RUN yarn --version
RUN yarn --immutable

RUN yarn build
CMD ["node", "."]