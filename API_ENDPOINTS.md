# API Endpoints Quick Reference

**Copyright (C) 2024 John Michael S. Abiol - All Rights Reserved**

---

Base URL: `http://localhost:5544/api`

---

## 🔐 Authentication Endpoints

### Register
```http
POST /auth/register

Body:
{
  "name": "Juan Dela Cruz",
  "username": "juandc",
  "email": "juan@email.com",
  "password": "password123",
  "role": "CUSTOMER",        // or "OWNER"
  "shopName": "Juan's Shop", // Required if role is OWNER
  "shopDescription": "Best fish shop" // Optional
}

Response:
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "Juan Dela Cruz",
    "username": "juandc",
    "email": "juan@email.com",
    "role": "CUSTOMER",
    "shop": { ... }  // Only if OWNER
  },
  "token": "jwt-token-here"
}
```

### Login
```http
POST /auth/login

Body:
{
  "email": "juan@email.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "juan@email.com",
    "username": "juandc",
    "name": "Juan Dela Cruz",
    "role": "CUSTOMER",
    "shop": { ... }  // Only if OWNER
  },
  "token": "jwt-token-here"
}
```

### Get Profile
```http
GET /auth/profile

Headers:
Authorization: Bearer {token}

Response:
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "juan@email.com",
    "username": "juandc",
    "name": "Juan Dela Cruz",
    "role": "CUSTOMER",
    "createdAt": "2024-01-01",
    "shop": { ... }  // Only if OWNER
  }
}
```

---

## 🏪 Shop Endpoints

### Get All Shops (Anyone authenticated)
```http
GET /shops
GET /shops?search=ocean

Headers:
Authorization: Bearer {token}

Response:
{
  "success": true,
  "shops": [
    {
      "id": "uuid",
      "name": "Ocean Fish Shop",
      "description": "Fresh saltwater fish",
      "owner": {
        "id": "uuid",
        "name": "John Doe",
        "username": "johnd"
      },
      "itemCount": 45,
      "items": [...],
      "createdAt": "2024-01-01"
    }
  ]
}
```

### Get Shop By ID (with items)
```http
GET /shops/:id
GET /shops/:id?category=FISH
GET /shops/:id?search=goldfish

Headers:
Authorization: Bearer {token}

Response:
{
  "success": true,
  "shop": {
    "id": "uuid",
    "name": "Ocean Fish Shop",
    "description": "Fresh saltwater fish",
    "owner": {...},
    "items": [
      {
        "id": "uuid",
        "name": "Goldfish",
        "category": "FISH",
        "quantity": 50,
        "price": 5.99,
        "description": "Beautiful goldfish"
      }
    ]
  }
}
```

### Get My Shop (Owner only)
```http
GET /shops/my/shop

Headers:
Authorization: Bearer {owner-token}

Response:
{
  "success": true,
  "shop": {
    "id": "uuid",
    "name": "My Shop",
    "description": "...",
    "ownerId": "uuid",
    "items": [...]
  }
}
```

### Update My Shop (Owner only)
```http
PUT /shops/my/shop

Headers:
Authorization: Bearer {owner-token}

Body:
{
  "name": "New Shop Name",
  "description": "New description"
}

Response:
{
  "success": true,
  "shop": { updated shop data }
}
```

---

## 📦 Inventory Endpoints

### Get All Inventory (with filters)
```http
GET /inventory
GET /inventory?category=FISH
GET /inventory?search=goldfish
GET /inventory?shopId=uuid
GET /inventory?category=FISH&search=gold&shopId=uuid

Headers:
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Goldfish",
      "category": "FISH",
      "quantity": 50,
      "price": 5.99,
      "description": "Beautiful goldfish",
      "shop": {
        "id": "uuid",
        "name": "Ocean Shop",
        "owner": {...}
      }
    }
  ]
}
```

### Get Single Item
```http
GET /inventory/:id

Headers:
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Goldfish",
    "category": "FISH",
    "quantity": 50,
    "price": 5.99,
    "description": "Beautiful goldfish"
  }
}
```

### Create Item (Owner only)
```http
POST /inventory

Headers:
Authorization: Bearer {owner-token}

Body:
{
  "name": "Goldfish",
  "category": "FISH",  // FISH, FISH_FOOD, FISH_PLANT, AQUARIUM
  "quantity": 50,
  "price": 5.99,
  "description": "Beautiful goldfish"
}

Response:
{
  "success": true,
  "data": { created item with shop info }
}
```

### Update Item (Owner only - own items)
```http
PUT /inventory/:id

Headers:
Authorization: Bearer {owner-token}

Body:
{
  "name": "Updated name",
  "category": "FISH",
  "quantity": 100,
  "price": 6.99,
  "description": "Updated description"
}

Response:
{
  "success": true,
  "data": { updated item }
}
```

### Delete Item (Owner only - own items)
```http
DELETE /inventory/:id

Headers:
Authorization: Bearer {owner-token}

Response:
{
  "success": true,
  "message": "Item deleted successfully"
}
```

---

## 🛒 Order Endpoints

### Create Order (Customer only)
```http
POST /orders

Headers:
Authorization: Bearer {customer-token}

Body:
{
  "items": [
    {
      "itemId": "uuid",
      "quantity": 2
    },
    {
      "itemId": "uuid2",
      "quantity": 1
    }
  ]
}

Response:
{
  "success": true,
  "order": {
    "id": "uuid",
    "customerId": "uuid",
    "totalAmount": 20.97,
    "status": "PENDING",
    "items": [...],
    "customer": {...}
  }
}
```

### Get My Orders (Customer only)
```http
GET /orders/my/orders

Headers:
Authorization: Bearer {customer-token}

Response:
{
  "success": true,
  "orders": [
    {
      "id": "uuid",
      "customerId": "uuid",
      "totalAmount": 20.97,
      "status": "COMPLETED",
      "items": [...],
      "payment": {...},
      "createdAt": "2024-01-01"
    }
  ]
}
```

### Get Order by ID
```http
GET /orders/:id

Headers:
Authorization: Bearer {token}

Response:
{
  "success": true,
  "order": {
    "id": "uuid",
    "customerId": "uuid",
    "totalAmount": 20.97,
    "status": "PENDING",
    "items": [...],
    "customer": {...},
    "payment": {...}
  }
}
```

### Update Order Status
```http
PUT /orders/:id/status

Headers:
Authorization: Bearer {token}

Body:
{
  "status": "COMPLETED"  // PENDING, COMPLETED, CANCELLED
}

Response:
{
  "success": true,
  "order": { updated order }
}
```

### Get Shop Orders (Owner only - Market History)
```http
GET /orders/shop/orders

Headers:
Authorization: Bearer {owner-token}

Response:
{
  "success": true,
  "orders": [
    {
      "id": "uuid",
      "customerId": "uuid",
      "totalAmount": 20.97,
      "status": "COMPLETED",
      "items": [only items from this shop],
      "customer": {...},
      "payment": {...}
    }
  ]
}
```

---

## 💳 Payment Endpoints

### Create Payment (Customer only)
```http
POST /orders/payment

Headers:
Authorization: Bearer {customer-token}

Body:
{
  "orderId": "uuid",
  "paymentMethod": "Cash"  // or "GCash", "PayMaya", etc.
}

Response:
{
  "success": true,
  "payment": {
    "id": "uuid",
    "orderId": "uuid",
    "amount": 20.97,
    "status": "PAID",
    "paymentMethod": "Cash",
    "order": {...}
  }
}
```

### Get Payment History (Customer only)
```http
GET /orders/my/payments

Headers:
Authorization: Bearer {customer-token}

Response:
{
  "success": true,
  "payments": [
    {
      "id": "uuid",
      "customerId": "uuid",
      "totalAmount": 20.97,
      "status": "COMPLETED",
      "items": [...],
      "payment": {
        "id": "uuid",
        "amount": 20.97,
        "status": "PAID",
        "paymentMethod": "Cash"
      }
    }
  ]
}
```

---

## 🔑 Authentication Header

All protected endpoints need:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get token from `/auth/login` or `/auth/register`

---

## ⚠️ Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description here"
}
```

Common status codes:
- `400` - Bad request (missing fields, validation error)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (wrong role for this action)
- `404` - Not found
- `500` - Server error

---

## 📝 Category Values

Valid categories for inventory items:
- `FISH`
- `FISH_FOOD`
- `FISH_PLANT`
- `AQUARIUM`

## 📝 Order Status Values
- `PENDING`
- `COMPLETED`
- `CANCELLED`

## 📝 Payment Status Values
- `PENDING`
- `PAID`
- `FAILED`

## 📝 Role Values
- `CUSTOMER`
- `OWNER`

---

## 🧪 Test with Postman/Thunder Client

1. Register a user
2. Copy the token from response
3. Use token in Authorization header for other requests
4. Test different roles (CUSTOMER vs OWNER)

---

Done! Tanan endpoints ready na. Just need i-connect sa mobile app. 🚀
