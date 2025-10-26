# Fish Inventory Management System

**Copyright (C) 2024 John Michael S. Abiol - All Rights Reserved**

A complete full-stack mobile application for managing fish shop, aquarium, and breeder inventory.

## Project Structure

```
FishShit/
├── backend/          # Node.js REST API
└── mobile-app/       # React Native mobile app
```

## Features

### Mobile App
- User authentication (Login & Registration)
- Dashboard with inventory overview
- Complete CRUD operations for inventory items
- Categories: Fish, Plant, Supply
- Real-time server status indicator
- Automatic fallback to mock data when server is unavailable
- Expo Go compatible

### Backend API
- RESTful API with Express.js
- MySQL database with Prisma ORM
- JWT authentication
- Password hashing with bcryptjs
- CORS enabled
- Health check endpoint

## Tech Stack

### Backend
- Node.js (ES6+ Modules)
- Express.js
- MySQL
- Prisma ORM
- JWT + bcryptjs
- Port: 5544

### Mobile App
- React Native
- Expo
- React Navigation
- Context API for state management
- Automatic API/Mock data switching

## Quick Start

### 1. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Configure database (edit .env file)
# DATABASE_URL="mysql://root:@localhost:3306/fish_inventory"

# Create database
mysql -u root -e "CREATE DATABASE fish_inventory;"

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start server
npm start
```

Backend will run on `http://localhost:5544`

### 2. Setup Mobile App

```bash
cd mobile-app

# Install dependencies
npm install

# Start Expo dev server
npm start
```

Scan the QR code with Expo Go app on your phone or run on emulator.

## Server Status Indicator

The mobile app automatically checks backend availability:

- **Server Online** (Green): Connected to backend API at localhost:5544
- **Server Unavailable** (Yellow): Using offline mock data
- **Checking...** (Blue): Verifying server status

When the backend is unavailable, the app seamlessly switches to mock data, allowing full offline functionality.

## Demo Credentials

Use these credentials to test the app:
- Email: `admin@fishshop.com`
- Password: `admin123`

Or create a new account via the registration screen.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Inventory (requires authentication)
- `GET /api/inventory` - Get all items
- `GET /api/inventory/:id` - Get single item
- `POST /api/inventory` - Create item
- `PUT /api/inventory/:id` - Update item
- `DELETE /api/inventory/:id` - Delete item

### Health Check
- `GET /health` - Check server status

## Database Schema

### Users
- id (UUID)
- email (unique)
- password (hashed)
- name
- timestamps

### Inventory Items
- id (UUID)
- name
- category (Fish/Plant/Supply)
- quantity
- price
- description (optional)
- timestamps

## Development Workflow

### Backend Development
```bash
cd backend
npm run dev  # Auto-reload on changes
npm run prisma:studio  # Open database GUI
```

### Mobile App Development
```bash
cd mobile-app
npm start
```

Press:
- `a` - Open on Android emulator
- `i` - Open on iOS simulator
- `w` - Open in web browser
- Scan QR - Open on physical device with Expo Go

## Configuration

### Backend (.env)
```env
DATABASE_URL="mysql://root:@localhost:3306/fish_inventory"
PORT=5544
JWT_SECRET="your-secret-key"
```

### Mobile App
API base URL is configured in `src/services/apiService.js`:
```javascript
const API_BASE_URL = 'http://localhost:5544/api';
```

For physical devices, change `localhost` to your computer's IP address.

## Features in Detail

### Authentication System
- Secure JWT-based authentication
- Password hashing with bcryptjs
- 7-day token expiration
- Protected API routes

### Inventory Management
- Add items with name, category, quantity, price, description
- Edit existing items
- Delete with confirmation
- Real-time statistics (total items, total quantity)
- Category color coding
- Pull-to-refresh

### Offline Capability
- Automatic detection of server availability
- Seamless fallback to mock data
- Visual status indicator
- No error interruptions

## Testing

### Test Backend API
```bash
# Health check
curl http://localhost:5544/health

# Register
curl -X POST http://localhost:5544/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test"}'

# Login
curl -X POST http://localhost:5544/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Test Mobile App
1. Start backend: `cd backend && npm start`
2. Start mobile app: `cd mobile-app && npm start`
3. Check login screen for server status
4. Login and test CRUD operations

## Troubleshooting

### Backend Issues
- **Port 5544 in use**: Change PORT in `.env`
- **Database connection failed**: Check MySQL is running and credentials
- **Prisma errors**: Run `npm run prisma:generate`

### Mobile App Issues
- **Can't connect to backend**:
  - Check backend is running on port 5544
  - Use your computer's IP instead of localhost on physical devices
  - App will use mock data if backend unavailable
- **Expo Go issues**: Clear cache with `npm start -- --clear`

## Production Deployment

### Backend
1. Set secure JWT_SECRET in production
2. Configure production database URL
3. Enable HTTPS
4. Configure CORS for specific origins
5. Use environment variables for sensitive data

### Mobile App
1. Build standalone app with EAS Build
2. Update API_BASE_URL to production server
3. Configure app.json for deployment
4. Submit to App Store / Play Store

## License

**Copyright (C) 2024 John Michael S. Abiol**

All rights reserved. This software is proprietary and confidential. Unauthorized copying, transferring, or reproduction of the contents of this software, via any medium, is strictly prohibited without express written permission from the copyright holder.

**Made with ❤️ by John Michael S. Abiol**

## Support

For issues and questions:
- Check README files in backend/ and mobile-app/ folders
- Review error messages in console/logs
- Verify server is running on port 5544
- Ensure database is properly configured
