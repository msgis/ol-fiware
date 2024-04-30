FROM node:20-alpine as build

ARG NGSI_URL
ENV NGSI_URL $NGSI_URL

WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Build app
RUN npm run build

FROM nginx
COPY --from=build /usr/src/app/dist/* /usr/share/nginx/html
