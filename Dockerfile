FROM node:18-alpine3.14
RUN apk update && apk upgrade && sync
EXPOSE 3000
WORKDIR /app/roll-of-arms
COPY . /app/roll-of-arms
EXPOSE 8080
RUN npm ci && npm run build
CMD ["npm", "start"]