# ELibrary – Full-Stack Library Management System

A full-stack library management application with JWT authentication, built with ASP.NET Core 8 Web API, React + Redux Toolkit, and MySQL.

## Table of Contents
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Database Configuration](#database-configuration)
- [Default Seeded User](#default-seeded-user)
- [Roles & Permissions](#roles--permissions)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Packages & Versions](#packages--versions)
  - [Backend (NuGet)](#backend-nuget)
  - [Frontend (npm)](#frontend-npm)

## Tech Stack
- **Backend:** ASP.NET Core 8 Web API, Entity Framework Core, ASP.NET Identity, JWT Authentication
- **Frontend:** React 19, Redux Toolkit, React Router, Vite
- **Database:** MySQL (via Pomelo.EntityFrameworkCore.MySql)

## Prerequisites
Before you begin, ensure you have the following installed:

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) (or later)
- [Node.js](https://nodejs.org/) v20.x or later
- [npm](https://www.npmjs.com/) (comes with Node.js) or [Yarn](https://yarnpkg.com/)
- [MySQL Server 8+](https://dev.mysql.com/downloads/mysql/)
- [Entity Framework Core Tools](https://learn.microsoft.com/en-us/ef/core/cli/dotnet) (`dotnet tool install --global dotnet-ef`)

## Getting Started

### Backend Setup
1. Navigate to the `ELibraryApi/` directory:
   ```bash
   cd ELibraryApi
   ```
2. Restore NuGet packages:
   ```bash
   dotnet restore
   ```
3. Configure the database (see [Database Configuration](#database-configuration)).
4. Apply migrations and run:
   ```bash
   dotnet ef database update
   dotnet run
   ```
   The API will be available at `http://localhost:5000` (or as configured).

### Frontend Setup
1. Navigate to the `elibrary-frontend/` directory:
   ```bash
   cd elibrary-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173` (default Vite port).

## Database Configuration

The application is pre-configured for MySQL using Pomelo.EntityFrameworkCore.MySql.

1. Open `ELibraryApi/appsettings.json`.
2. Locate the `ConnectionStrings:DefaultConnection` entry.
3. Replace `__YOUR_PASSWORD__` with your MySQL root password:
   ```json
   "DefaultConnection": "server=localhost; port=3306; database=ELibraryDb; user=root; password=__YOUR_PASSWORD__"
   ```
4. **No other changes are required.** Proceed to run migrations and start the backend.

### Using Microsoft SQL Server
If you prefer Microsoft SQL Server, follow these steps:

1. **Change the connection string** in `ELibraryApi/appsettings.json`:
   ```json
   "DefaultConnection": "Server=localhost;Database=TodoApiDb;Trusted_Connection=True;TrustServerCertificate=True;"
   ```
   (Adjust for your SQL Server instance, user, and password.)

2. **Register the SQL Server DbContext** in `TodoApi/Program.cs`.
   Replace the existing MySQL registration:
   ```csharp
   // Remove or comment out:
   // var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
   // builder.Services.AddDbContext<ApplicationDbContext>(options =>
   //     options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

   // Add:
   var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
   builder.Services.AddDbContext<ApplicationDbContext>(options =>
       options.UseSqlServer(connectionString));
   ```
   Ensure you have the `Microsoft.EntityFrameworkCore.SqlServer` NuGet package installed. You can add it via:
   ```bash
   dotnet add package Microsoft.EntityFrameworkCore.SqlServer --version 8.0.2
   ```

### JWT Settings

Also in `ELibraryApi/appsettings.json`, make sure the JWT section is set:

```json
"JWT": {
  "Issuer": "http://localhost:5000",
  "Audience": "http://localhost:5000",
  "SigningKey": "__YOUR_LONG_RANDOM_SECRET__"
}
```

## Default Seeded User

On first startup, the API automatically migrates the database and seeds one admin account so you can log in immediately:

| Field        | Value                  |
|--------------|------------------------|
| **Username** | `admin`                |
| **Password** | `Admin@123`            |
| **Email**    | `admin@elibrary.local` |
| **Role**     | `Admin`                |


The migration also seeds three roles with fixed GUIDs: `Admin`, `Editor`, and `User`.

## Roles & Permissions

| Action                                  | User | Editor | Admin |
|-----------------------------------------|:----:|:------:|:-----:|
| Browse books / authors / categories     |  ✅  |   ✅   |  ✅   |
| Read reviews                            |  ✅  |   ✅   |  ✅   |
| Post a review                           |  ✅  |   ✅   |  ✅   |
| Edit / delete **own** review            |  ✅  |   ✅   |  ✅   |
| Create / update books, authors, categories | ❌  |   ✅   |  ✅   |
| Delete books, authors, categories       |  ❌  |   ❌   |  ✅   |
| Delete **any** review                   |  ❌  |   ❌   |  ✅   |
| Grant elevated roles at signup          |  ❌  |   ❌   |  ✅   |

## Running the Application
1. Start the backend (from `ELibraryApi/`):
   ```bash
   dotnet run
   ```
2. Start the frontend (from `elibrary-frontend/`):
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:5173`.

## API Endpoints

Base URL: `http://localhost:5000/api`

### Account
| Method | Route                | Auth   | Description                     |
|--------|----------------------|--------|---------------------------------|
| POST   | `/account/register`  | Public | Register a new user             |
| POST   | `/account/login`     | Public | Log in and receive a JWT        |
| GET    | `/account/me`        | Bearer | Current user info               |

### Books
| Method | Route          | Auth            | Description                       |
|--------|----------------|-----------------|-----------------------------------|
| GET    | `/book`        | Public          | Paged list (search/filter/sort)   |
| GET    | `/book/{id}`   | Public          | Single book with relations        |
| POST   | `/book`        | Admin, Editor   | Create book                       |
| PUT    | `/book/{id}`   | Admin, Editor   | Update book                       |
| DELETE | `/book/{id}`   | Admin           | Delete book                       |

### Authors
| Method | Route            | Auth            | Description       |
|--------|------------------|-----------------|-------------------|
| GET    | `/author`        | Public          | Paged list        |
| GET    | `/author/{id}`   | Public          | Single author     |
| POST   | `/author`        | Admin, Editor   | Create author     |
| PUT    | `/author/{id}`   | Admin, Editor   | Update author     |
| DELETE | `/author/{id}`   | Admin           | Delete author     |

### Categories
| Method | Route              | Auth            | Description       |
|--------|--------------------|-----------------|-------------------|
| GET    | `/category`        | Public          | Paged list        |
| GET    | `/category/{id}`   | Public          | Single category   |
| POST   | `/category`        | Admin, Editor   | Create category   |
| PUT    | `/category/{id}`   | Admin, Editor   | Update category   |
| DELETE | `/category/{id}`   | Admin           | Delete category   |

### Reviews
| Method | Route                       | Auth                    | Description              |
|--------|-----------------------------|-------------------------|--------------------------|
| GET    | `/review/book/{bookId}`     | Public                  | Paged reviews for book   |
| GET    | `/review/{id}`              | Public                  | Single review            |
| POST   | `/review/book/{bookId}`     | Bearer                  | Create review for book   |
| PUT    | `/review/{id}`              | Bearer (owner or Admin) | Update review            |
| DELETE | `/review/{id}`              | Bearer (owner or Admin) | Delete review            |

## Packages & Versions

### Backend (NuGet)
| Package | Version |
|---------|---------|
| Microsoft.AspNetCore.Authentication.JwtBearer | 8.0.2 |
| Microsoft.AspNetCore.Identity.EntityFrameworkCore | 8.0.2 |
| Microsoft.AspNetCore.Mvc.NewtonsoftJson | 8.0.31 |
| Microsoft.AspNetCore.OpenApi | 8.0.30 |
| Microsoft.EntityFrameworkCore | 8.0.2 |
| Microsoft.EntityFrameworkCore.Design | 8.0.0 |
| Microsoft.EntityFrameworkCore.Tools | 8.0.0 |
| Microsoft.Extensions.Identity.Core | 8.0.2 |
| Pomelo.EntityFrameworkCore.MySql | 8.0.2 |
| Swashbuckle.AspNetCore | 6.6.2 |

### Frontend (npm)
#### Dependencies
| Package | Version |
|---------|---------|
| @reduxjs/toolkit | ^2.12.0 |
| react | ^19.2.8 |
| react-dom | ^19.2.8 |
| react-redux | ^9.3.0 |
| react-router | ^8.4.0 |
| react-router-dom | ^7.18.4 |

#### Dev Dependencies
| Package | Version |
|---------|---------|
| @eslint/js | ^10.0.1 |
| @types/react | ^19.2.18 |
| @types/react-dom | ^19.2.7 |
| @vitejs/plugin-react | ^6.1.1 |
| eslint | ^10.10.0 |
| eslint-plugin-react-hooks | ^7.1.1 |
| eslint-plugin-react-refresh | ^0.5.6 |
| globals | ^17.12.0 |
| vite | ^8.3.0 |