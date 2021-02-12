FROM node:latest
WORKDIR /usr/src/app
COPY . .
RUN npm install -g nodemon
RUN npm install
ENV NODE_ENV development
ENV PORT=8000
EXPOSE ${PORT}
CMD [ "nodemon", "server.js" ]