FROM debian:buster-slim as builder

LABEL name "Thoth"
LABEL version "3.1.0"
LABEL maintainer "Carter Himmel <me@fyko.net>"

EXPOSE 2399

RUN apt-get update
RUN apt-get install -y curl ca-certificates
RUN apt-get install -y git wget build-essential python3 g++ make libtool autoconf automake bash

ENV VOLTA_VERSION=1.1.0 \
  VOLTA_HOME=/.volta \
  PATH=/.volta/bin:$PATH

RUN wget "https://github.com/volta-cli/volta/releases/download/v$VOLTA_VERSION/volta-$VOLTA_VERSION-linux.tar.gz" \
  && tar -xzf "volta-$VOLTA_VERSION-linux.tar.gz" -C /usr/local/bin \
  # Running `volta -v` triggers setting up the shims in VOLTA_HOME (otherwise node won't work)
  && volta -v \
  && rm "volta-$VOLTA_VERSION-linux.tar.gz"

WORKDIR /usr/src/app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn 
# Running `node -v` and `yarn -v` triggers Volta to install the versions set in the project
RUN node -v && yarn -v
RUN yarn --immutable

COPY . .
RUN yarn build

CMD node .
