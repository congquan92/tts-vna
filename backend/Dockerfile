FROM node:20

WORKDIR /app

# 1. chỉ copy package trước
COPY package*.json ./
RUN npm install

# 2. install python (cache layer riêng)
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-pip \
  && rm -rf /var/lib/apt/lists/*

RUN ln -sf /usr/bin/python3 /usr/bin/python

# 3. copy source sau cùng
COPY . .

RUN npm run build

CMD ["node", "dist/main.js"]