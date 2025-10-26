# Connection Status - Mobile App ↔ Backend

**Copyright (C) 2024 John Michael S. Abiol - All Rights Reserved**

---

## ✅ YES! FULLY SYNCHRONIZED!

---

## 🔗 Current Connection Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MOBILE APP                              │
│                 C:\FishShit\mobile-app                      │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  api.config.js                                       │  │
│  │  const API_BASE_URL = 'http://localhost:5544'       │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  apiService.js                                       │  │
│  │  - loginUser()                                       │  │
│  │  - registerUser()                                    │  │
│  │  - getInventory()                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  categoryService.js                                  │  │
│  │  - getItemsByCategory()                              │  │
│  │  - addItem()                                         │  │
│  │  - updateItem()                                      │  │
│  │  - deleteItem()                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓
                    HTTP Requests
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND API                            │
│                  C:\FishShit\backend                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  server.js                                           │  │
│  │  PORT = 5544                                         │  │
│  │  app.use('/api/auth', authRoutes)                    │  │
│  │  app.use('/api/inventory', inventoryRoutes)          │  │
│  │  app.use('/api/shops', shopRoutes)                   │  │
│  │  app.use('/api/orders', orderRoutes)                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Controllers                                         │  │
│  │  - authController.js                                 │  │
│  │  - inventoryController.js ← CRUD operations          │  │
│  │  - shopController.js                                 │  │
│  │  - orderController.js                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Prisma ORM                                          │  │
│  │  - schema.prisma                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    MySQL DATABASE                           │
│                   localhost:3306                            │
│                                                             │
│  Tables:                                                    │
│  - users                                                    │
│  - shops                                                    │
│  - inventory_items                                          │
│  - orders                                                   │
│  - order_items                                              │
│  - payments                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Endpoint Mapping

| Mobile App Function | → | Backend Route | → | Database Table |
|--------------------|----|---------------|-----|----------------|
| `loginUser()` | → | `POST /api/auth/login` | → | `users` |
| `registerUser()` | → | `POST /api/auth/register` | → | `users`, `shops` |
| `getItemsByCategory()` | → | `GET /api/inventory?category=X` | → | `inventory_items` |
| `addItem()` | → | `POST /api/inventory` | → | `inventory_items` |
| `updateItem()` | → | `PUT /api/inventory/:id` | → | `inventory_items` |
| `deleteItem()` | → | `DELETE /api/inventory/:id` | → | `inventory_items` |

---

## 🔄 Data Flow Example

### Adding "Puffer Fish"

```
USER CLICKS "ADD FISH"
        ↓
[Mobile App - CategoryInventoryScreen]
        ↓
formData = {
  name: "Puffer Fish",
  quantity: 25,
  price: 19.99,
  description: "Cute fish"
}
        ↓
[categoryService.addItem('FISH', formData)]
        ↓
HTTP POST http://localhost:5544/api/inventory
Headers: {
  Authorization: "Bearer eyJhbGc...",
  Content-Type: "application/json"
}
Body: {
  name: "Puffer Fish",
  category: "FISH",
  quantity: 25,
  price: 19.99,
  description: "Cute fish"
}
        ↓
[Backend - inventoryRoutes.js]
        ↓
[Middleware - auth.js]
✓ Verify JWT token
✓ Extract user info (id, role)
        ↓
[inventoryController.createInventoryItem()]
✓ Check user is OWNER
✓ Validate category
✓ Get owner's shop
        ↓
[Prisma ORM]
await prisma.inventoryItem.create({
  data: {
    name: "Puffer Fish",
    category: "FISH",
    quantity: 25,
    price: 19.99,
    description: "Cute fish",
    shopId: "shop-uuid"
  }
})
        ↓
[MySQL Database]
INSERT INTO inventory_items (...)
VALUES (...)
        ↓
← Returns created item
        ↓
[Backend Response]
{
  success: true,
  data: { id: "uuid", name: "Puffer Fish", ... }
}
        ↓
[Mobile App]
Alert.alert("Success", "Added Puffer Fish to Fish")
fetchItems() // Refresh list
        ↓
USER SEES "PUFFER FISH" IN LIST ✅
```

---

## 🌐 Configuration States

### 1. LOCAL DEVELOPMENT (Current)
```
Mobile App: http://localhost:5544
     ↓
Backend: localhost:5544
     ↓
Database: localhost:3306
```

### 2. PHYSICAL DEVICE TESTING
```
Mobile App (Phone): http://192.168.1.100:5544
     ↓ (WiFi)
Backend (Computer): 192.168.1.100:5544
     ↓
Database: localhost:3306
```

### 3. PRODUCTION (Hosted)
```
Mobile App (Anywhere): https://fish-api.railway.app
     ↓ (Internet)
Backend (Cloud): https://fish-api.railway.app
     ↓
Database (Cloud): mysql://cloud-db:3306
```

---

## 🔧 How to Switch Configurations

**One file controls everything:**

```javascript
// mobile-app/src/config/api.config.js

// OPTION 1: Local Development ✅ (Current)
const CURRENT_CONFIG = 'LOCAL';
// Backend runs on: http://localhost:5544

// OPTION 2: Physical Device Testing
const CURRENT_CONFIG = 'PHYSICAL_DEVICE';
// Backend runs on: http://YOUR_IP:5544

// OPTION 3: Production
const CURRENT_CONFIG = 'PRODUCTION';
// Backend runs on: https://your-hosted-backend.com
```

**Just change that ONE line!**

---

## ✅ Synchronization Checklist

✓ **Port Match**
  - Backend: `5544` (server.js:23)
  - Mobile: `5544` (api.config.js:10)

✓ **Endpoints Match**
  - Backend: `/api/auth/*`, `/api/inventory/*`, etc.
  - Mobile: Calls same endpoints

✓ **Authentication**
  - Backend: Generates JWT tokens
  - Mobile: Sends tokens in headers

✓ **Data Format**
  - Backend: Returns JSON
  - Mobile: Parses JSON

✓ **Error Handling**
  - Backend: Returns error messages
  - Mobile: Shows alerts

✓ **Database**
  - Backend: Connects to MySQL
  - Mobile: Doesn't need to know about DB

---

## 🚀 Deployment Ready

### When you host backend on a server:

**Step 1**: Deploy backend
```bash
# Example: Railway.app
# Get URL: https://fish-backend.railway.app
```

**Step 2**: Update mobile app
```javascript
// mobile-app/src/config/api.config.js
const API_CONFIGS = {
  PRODUCTION: 'https://fish-backend.railway.app',
};
const CURRENT_CONFIG = 'PRODUCTION';
```

**Step 3**: Build mobile app
```bash
npx expo build
```

**✅ DONE! Mobile app connects to hosted backend!**

---

## 🎯 Summary

**Question**: Does mobile-app connect to backend?
**Answer**: YES! 100% synchronized!

**Question**: Will it work when hosted?
**Answer**: YES! Just change the URL in ONE config file!

**Files that connect them**:
1. `mobile-app/src/config/api.config.js` ← Configuration
2. `mobile-app/src/services/apiService.js` ← Auth API calls
3. `mobile-app/src/services/categoryService.js` ← CRUD API calls
4. `backend/server.js` ← Receives requests
5. `backend/src/controllers/*` ← Processes requests
6. `backend/prisma/schema.prisma` ← Database structure

**They all work together perfectly!** 🎉

---

Made with ❤️ by John Michael S. Abiol
S.Y 2025-2026
