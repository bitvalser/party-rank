FROM node:20.9.0
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "yarn.lock", "my-project-1523693285732-firebase-adminsdk-f7ilt-e82c28b1eb.json", "./"]
RUN yarn install --production
COPY dist dist
CMD ["node", "dist/server.js"]
