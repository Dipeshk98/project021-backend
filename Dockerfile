# Step 1: Use official Node.js image
FROM node:18-alpine

# Step 2: Install required packages for Prisma
RUN apk add --no-cache openssl openssl-dev

# Step 3: Set working directory
WORKDIR /app

# Step 4: Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Step 5: Copy the full app
COPY . .

# Step 6: Generate Prisma client
RUN npx prisma generate

# Step 7: Build TypeScript (if your project has build step)
RUN npm run build

# Step 8: Expose port (Render will detect this)
EXPOSE 4000

# Step 9: Start in production mode
CMD ["npm", "start"]
