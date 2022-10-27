FROM alpine as builder

RUN apk add --update
RUN apk add --no-cache ca-certificates
RUN apk add --no-cache --virtual .build-deps git curl build-base python3 g++ make libtool autoconf automake bash

RUN curl https://get.volta.sh | bash
RUN echo $VOLTA_HOME
ENV VOLTA_HOME ~/.volta
ENV PATH ~/.volta/bin:$PATH

WORKDIR /usr/src/app

COPY package.json yarn.lock .yarn/ ./ 
RUN yarn --immutable
RUN yarn prod-install /usr/src/build

COPY . .
RUN yarn build

RUN cp -r dist /usr/src/build

## runner
FROM node:18-alpine

LABEL name "Thoth"
LABEL version "3.1.0"
LABEL maintainer "Carter Himmel <me@fyko.net>"

EXPOSE 2399

WORKDIR /home/thoth
COPY --from=builder ~/.volta ~/.volta
COPY --from=builder /usr/src/build .
ENV PATH ~/.volta/bin:$PATH

CMD ["node", "."]

# docker run --rm -it frolvlad/alpine-glibc:latest \
# 	bash -c ' \
# 	apk update && \
# 	apk add git rust cargo openssl-dev bash ca-certificates && \
# 	git clone https://github.com/volta-cli/volta.git --depth=1 && \
# 	cd volta && OPENSSL_NO_VENDOR=1 cargo build --release && \
# 	/volta/target/release/volta install node@latest'
