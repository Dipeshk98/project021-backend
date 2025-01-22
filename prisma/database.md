
## Steps to Run the Project

### 1. Run Docker Compose

In the root directory of the project, run the following command to start the necessary services:

```bash
docker-compose up
```

This will start the following services:
- **PostgreSQL**: A PostgreSQL database container.
- **Adminer**: A web interface for interacting with your PostgreSQL database.

### 2. Start the Development Server

After the Docker services are up and running, start the development server:
use node 18 

```bash
npm run dev
```

This will launch the application in development mode.

### 3. Open Adminer

Once the services are running, open your browser and navigate to **Adminer**:

- **URL**: [http://localhost:8080](http://localhost:8080)

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
npx prisma migrate deploy
```

This will apply all the migrations and update the database schema.

### 6. Verify the Tables in Adminer

After the migration completes, you should be able to see the tables and data that were created by the migrations within Adminer.

