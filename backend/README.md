# Fish Inventory Management - Backend API

Node.js REST API backend for the Fish Inventory Management System.

## Tech Stack

- Node.js with ES6+ Modules
- Express.js
- MySQL
- Prisma ORM
- JWT Authentication
- bcryptjs for password hashing

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server running locally or remotely

## Installation

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure database:
   - Edit `.env` file
   - Update `DATABASE_URL` with your MySQL credentials:
   ```
   DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
   ```

4. Create the database (if it doesn't exist):
```sql
CREATE DATABASE fish_inventory;
```

5. Generate Prisma client:
```bash
npm run prisma:generate
```

6. Run database migrations:
```bash
npm run prisma:migrate
```

## Running the Server

### Development mode:
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5544`

## API Endpoints

### Health Check
- `GET /health` - Check if server is running

### Authentication
- `POST /api/auth/register` - Register new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "User Name"
  }
  ```

- `POST /api/auth/login` - Login user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `GET /api/auth/profile` - Get user profile (requires authentication)

### Inventory Management (All require authentication)

- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory/:id` - Get single inventory item
- `POST /api/inventory` - Create new inventory item
  ```json
  {
    "name": "Goldfish",
    "category": "Fish",
    "quantity": 50,
    "price": 5.99,
    "description": "Beautiful orange goldfish"
  }
  ```

- `PUT /api/inventory/:id` - Update inventory item
  ```json
  {
    "name": "Updated Name",
    "quantity": 100,
    "price": 7.99
  }
  ```

- `DELETE /api/inventory/:id` - Delete inventory item

## Authentication

Protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Tokens are returned from login/register endpoints and are valid for 7 days.

## Database Schema

### Users Table
- id (UUID)
- email (unique)
- password (hashed)
- name
- createdAt
- updatedAt

### Inventory Items Table
- id (UUID)
- name
- category
- quantity
- price
- description (optional)
- createdAt
- updatedAt

## Environment Variables

Create a `.env` file in the backend root:

```env
DATABASE_URL="mysql://root:@localhost:3306/fish_inventory"
PORT=5544
JWT_SECRET="your-secret-key-change-this-in-production"
```

## Prisma Commands

- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Create and run migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js       # Prisma client instance
│   ├── controllers/
│   │   ├── authController.js    # Auth logic
│   │   └── inventoryController.js  # Inventory logic
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   └── routes/
│       ├── authRoutes.js     # Auth endpoints
│       └── inventoryRoutes.js   # Inventory endpoints
├── prisma/
│   └── schema.prisma         # Database schema
├── .env                      # Environment variables
├── server.js                 # Main server file
└── package.json
```

## Testing with cURL

### Register:
```bash
curl -X POST http://localhost:5544/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

### Login:
```bash
curl -X POST http://localhost:5544/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Get Inventory (with token):
```bash
curl http://localhost:5544/api/inventory \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Notes

- Server runs on port 5544 by default
- All passwords are hashed using bcryptjs
- CORS is enabled for all origins (configure for production)
- Database uses MySQL with Prisma ORM
- Uses ES6 module syntax (type: "module" in package.json)

## Troubleshooting

1. **Database connection error**: Ensure MySQL is running and credentials in `.env` are correct
2. **Prisma errors**: Run `npm run prisma:generate` after any schema changes
3. **Port already in use**: Change PORT in `.env` file
4. **Migration errors**: Check database exists and user has proper permissions
