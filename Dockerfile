# https://hub.docker.com/r/mhart/alpine-node/
# 

FROM mhart/alpine-node

#RUN mkdir -p /usr/src/app
WORKDIR /app
COPY package.json /app/

# for native dependencies, get extra tools
# RUN apk add --no-cache make gcc g++ python
#RUN npm install --production
RUN npm install


COPY . /app

EXPOSE 3100
CMD [ “npm”, “start” ]

