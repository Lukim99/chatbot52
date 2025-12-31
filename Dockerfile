FROM node:20-alpine
WORKDIR /
COPY . .
CMD ["node", "replit.js"]