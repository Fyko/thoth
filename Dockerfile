FROM debian:bullseye-slim as builder

LABEL name "Thoth"
LABEL version "3.1.0"
LABEL maintainer "Carter Himmel <me@fyko.net>"

EXPOSE 2399

RUN apt-get update
RUN apt-get install -y curl ca-certificates
RUN apt-get install -y git build-essential python3 g++ make libtool autoconf automake bash

ENV VOLTA_HOME /root/.volta
ENV PATH /root/.volta/bin:$PATH
RUN curl -fsSL https://get.volta.sh | bash
RUN volta --version

WORKDIR /usr/src/app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn 
RUN ls -a
RUN yarn --immutable

COPY . .
RUN yarn build

CMD node .
