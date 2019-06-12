FROM node:8
WORKDIR /home/app/
COPY . /home/app/
RUN npm i
CMD ["node", "server.js"]
EXPOSE 3000
