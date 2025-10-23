# Step 1: Use official Node.js image
FROM node:18-alpine

# Step 2: Install required packages for Prisma
RUN apk add --no-cache openssl openssl-dev

# Step 3: Set working directory
WORKDIR /app

# Step 4: Copy package files and install ALL dependencies (including dev dependencies for build)
COPY package*.json ./
RUN npm install

# Step 5: Copy the full app
COPY . .

# Step 6: Generate Prisma client
RUN npx prisma generate

# Step 7: Build TypeScript
RUN npm run build

# Step 8: Remove dev dependencies to reduce image size
RUN npm prune --production

# Step 9: Expose port (Render will detect this)
EXPOSE 4000

# Step 10: Start in production mode
CMD ["npm", "start"]
