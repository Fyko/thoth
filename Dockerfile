FROM node:14-alpine

LABEL name "Thoth"
LABEL maintainer "Carter Himmel <fyko@sycer.dev>"

WORKDIR /usr/thoth

COPY package.json yarn.lock .yarnclean ./

RUN apk add --update
RUN apk add --no-cache ca-certificates
RUN apk add --no-cache --virtual .build-deps git curl build-base python g++ make libtool autoconf automake
RUN yarn install

COPY . .

RUN yarn run build
CMD ["node", "."]
