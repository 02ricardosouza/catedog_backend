FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies AND typescript globally in the container
RUN npm install && npm install -g typescript

COPY . .

# Use the global tsc command
RUN tsc && chmod +x scripts/start.sh

EXPOSE 3000

CMD ["sh", "scripts/start.sh"]