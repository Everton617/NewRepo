FROM node:18-alpine
WORKDIR /app 
COPY . .

RUN npm i -g pnpm
RUN pnpm install 

EXPOSE 4002

ENV NODE_ENV=production
CMD npm run build:prod && npm run start
