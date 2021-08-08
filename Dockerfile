from node:14-buster-slim

WORKDIR /app
ADD . /app

RUN rm -rf node_modules
RUN yarn install

CMD [ "yarn", "start" ]