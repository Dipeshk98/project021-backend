# Docker Setup for Serverless Express TypeScript App

This guide walks you through setting up and running the application using Docker.

## Table of Contents

- [Docker Setup](#docker-setup)
- [Running the Application](#running-the-application)
- [Stopping the Application](#stopping-the-application)

---

## Docker Setup


### 2. Install Docker
Ensure that Docker is installed on your local machine. You can follow the installation guide from the official Docker website: https://docs.docker.com/get-docker/



## Running the Application

### 1. Build the Docker Image
To build the Docker image for the application, run:
```bash
docker-compose up --build
```

This will:
- Start the **PostgreSQL** container.
- Start the **Express backend** container and expose it on the configured ports.


If you have **Adminer** running, you can access it at: (for databse)
- [http://localhost:8080](http://localhost:8080)

---
### 4. Log in to Adminer with the Following Credentials

In the Adminer login page, use the following credentials to connect to the PostgreSQL database:

- **System**: PostgreSQL
- **Server**: `postgres` (this is the name of the PostgreSQL service in Docker, not `localhost`)
- **Username**: `postgres`
- **Password**: `yourpassword` (this is the password defined in your `.env` file)
- **Database**: `postgres` (or the name of the database you are using)

### 5. Run Prisma Migrations

Now, apply any pending Prisma migrations to the PostgreSQL database:

```bash
npx prisma migrate dev
```

This will apply all the migrations and update the database schema.

### 6. Verify the Tables in Adminer

After the migration completes, you should be able to see the tables and data that were created by the migrations within Adminer.


## Stopping the Application

To stop the application and remove the containers, run:
```bash
docker-compose down
```
## run after local changes
To stop the application and remove the containers, run:
```bash
docker start my-backend
```