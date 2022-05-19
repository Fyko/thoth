FROM node:16-alpine

LABEL name "Thoth"
LABEL version "3.0.0"
LABEL maintainer "Carter Himmel <fyko@sycer.dev>"

# since we're starting non-interactive shell, 
# we wil need to tell bash to load .bashrc manually
ENV BASH_ENV ~/.bashrc
# needed by volta() function
ENV VOLTA_HOME /root/.volta
# make sure packages managed by volta will be in PATH
ENV PATH $VOLTA_HOME/bin:$PATH

ENV YARN_CACHE_FOLDER=/usr/local/yarn-cache
VOLUME /usr/local/yarn-cache

WORKDIR /usr/thoth

COPY package.json yarn.lock ./

RUN apk add --update
RUN apk add --no-cache ca-certificates
RUN apk add --no-cache --virtual .build-deps git curl build-base python3 g++ make libtool autoconf automake
RUN curl https://get.volta.sh | bash
RUN yarn --immutable

COPY . .

RUN yarn build
CMD ["node", "."]