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