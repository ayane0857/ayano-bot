FROM node:24

WORKDIR /usr/src/app

# Install dependencies
COPY package.json ./
RUN bun install

# Copy source code
COPY . .

# Generate Prisma Client
RUN bunx --bun prisma generate

# Start the bot
CMD ["bun", "index.js"]
