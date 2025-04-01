# Step 1: Use the official Node.js image as a base image
FROM node:18-alpine

# Step 2: Install OpenSSL and other dependencies required by Prisma
RUN apk update && apk add --no-cache openssl openssl-dev

# Step 3: Set the working directory in the container
WORKDIR /app

# Step 4: Copy the package.json and package-lock.json (if present) to the container
COPY package*.json ./

# Step 5: Install dependencies
RUN npm install --force

# Step 6: Copy the entire project into the container
COPY . .

# Step 7: Generate the Prisma client (with the correct binary target for Alpine)
# You can set the binary target explicitly to ensure compatibility with Alpine
RUN npx prisma generate 

# Step 8: Expose port 4000 (ensure this is the correct port for your app)
EXPOSE 4000

# Step 9: Start the application (in development mode)
CMD ["npm", "run", "dev"]

