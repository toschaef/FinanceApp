FROM node:20

WORKDIR /app

RUN apt-get update && \
    apt-get install -y build-essential python3 && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 443
EXPOSE 5000

CMD ["node", "server.js"]