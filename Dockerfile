FROM node:12-alpine

LABEL name "Thoth"
LABEL version "2.1.0"
LABEL maintainer "Carter Himmel <fyko@sycer.dev>"

WORKDIR /usr/thoth

COPY package.json pnpm-lock.yaml ./

RUN apk add --update \
&& apk add --no-cache ca-certificates \
&& apk add --no-cache --virtual .build-deps git curl build-base python g++ make \
&& curl -L https://unpkg.com/@pnpm/self-installer | node \
&& pnpm i \
&& apk del .build-deps

COPY . .

ENV ID= \
	DISCORD_TOKEN= \
	COLOR= \
	OWNERS= \
	PREFIX= 
RUN pnpm run build
CMD ["node", "."]

