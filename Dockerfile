ENV DEPLOY_TS=20260714051102690
FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/

RUN cd backend && npm install
RUN cd frontend && npm install

COPY . .

RUN cd frontend && npm run build

EXPOSE 8080

CMD ["node", "backend/src/index.js"]
