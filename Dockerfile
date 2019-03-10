FROM node:11-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

ENV TOKEN=""
ENV USER_AGENT="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3724.0 Safari/537.36"
ENV OWNER=""
ENV TIME_COUNT=9
ENV KITLE=5
ENV DEPARTMENT=695
ENV PROJECT=80
ENV DESC="Drop 2 Development"
ENV TIMETRACKER_ID=''
ENV REPORT_CHECK_INTERVAL=1800

USER node

RUN yarn install

COPY --chown=node:node . .

EXPOSE 3000

CMD [ "node", "app.js" ]
