# 📦 API Documentation

This document describes how to interact with the API for the following resources:

- Metal
- ItemFor
- Material
- Category

All requests and responses use `application/json`.

---

## 🧱 Common Schema

Each resource shares this structure:

```json
{
  "metalName" | "itemForName" | "materialName" | "categoryName": "string (min 3 characters)",
  "parentCategoryId": "ObjectId | null (Category only)"
}
```

---

## ⚙️ Metal API

### ✅ POST a new metal

```http
POST http://localhost:3000/api/metal
Content-Type: application/json
```

**Request Body:**

```json
{
  "metalName": "Gold"
}
```

**Success Response – 201 Created**

```json
{
  "status": "success",
  "message": "Metal created successfully",
  "data": {
    "metal": {
      "_id": "...",
      "metalName": "Gold",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

**Failure Response – 409 Conflict (Duplicate Metal)**

```json
{
  "status": "error",
  "message": "Metal already exists"
}
```

**Error Response – 400 Bad Request**

```json
{
  "status": "error",
  "message": "Invalid request body"
}
```

---

### 📅 GET all metals

```http
GET http://localhost:3000/api/metal
```

**Success Response – 200 OK**

```json
{
  "status": "success",
  "message": "Fetched all metals",
  "data": {
    "metals": [
      {
        "_id": "...",
        "metalName": "Gold"
      }
    ]
  }
}
```

**Error Response – 500 Internal Server Error**

```json
{
  "status": "error",
  "message": "Internal Server Error"
}
```

---

### 🗑 DELETE a metal by ID

```http
DELETE http://localhost:3000/api/metal/<id>
```

**Success Response – 200 OK**

```json
{
  "status": "success",
  "message": "Metal deleted"
}
```

**Not Found Response – 404 Not Found**

```json
{
  "status": "error",
  "message": "Metal not found"
}
```

**Error Response – 400 Bad Request**

```json
{
  "status": "error",
  "message": "Invalid ID"
}
```

---

### ✏️ PATCH a metal by ID

```http
PATCH http://localhost:3000/api/metal/<id>
Content-Type: application/json
```

**Request Body:**

```json
{
  "metalName": "UpdatedGold"
}
```

**Success Response – 200 OK**

```json
{
  "status": "success",
  "message": "Metal updated successfully",
  "data": {
    "metal": {
      "_id": "...",
      "metalName": "UpdatedGold"
    }
  }
}
```

**Error Response – 400 Bad Request**

```json
{
  "status": "error",
  "message": "Invalid ID or request body"
}
```

**Not Found Response – 404 Not Found**

```json
{
  "status": "error",
  "message": "Metal not found"
}
```

---

## ⚙️ ItemFor API

### ✅ POST a new itemFor

```http
POST http://localhost:3000/api/item-for
Content-Type: application/json
```

**Request Body:**

```json
{
  "itemForName": "Necklace"
}
```

**Success Response – 201 Created**  
**Error Response – 409 / 400 / 500**

---

### 📅 GET all itemFor

```http
GET http://localhost:3000/api/item-for
```

**Success Response – 200 OK**

---

### 🗑 DELETE an itemFor by ID

```http
DELETE http://localhost:3000/api/item-for/<id>
```

**Success Response – 200 OK**  
**Not Found – 404**  
**Invalid ID – 400**

---

### ✏️ PATCH an itemFor by ID

```http
PATCH http://localhost:3000/api/item-for/<id>
Content-Type: application/json
```

**Request Body:**

```json
{
  "itemForName": "UpdatedItem"
}
```

**Success Response – 200 OK**  
**Error Response – 400 / 404**

---

## ⚙️ Material API

Follows same status pattern as **Metal API**:

- POST → 201, 409, 400
- GET → 200, 500
- DELETE → 200, 404, 400
- PATCH → 200, 400, 404

---

## ⚙️ Category API

### ✅ POST a new category

```http
POST http://localhost:3000/api/category
Content-Type: application/json
```

**Request Body:**

```json
{
  "categoryName": "Jewelry",
  "parentCategoryId": null
}
```

**Success Response – 201 Created**  
**Failure – 409 Conflict**  
**Validation Error – 400 Bad Request**

---

### 📅 GET all categories

```http
GET http://localhost:3000/api/category
```

**Success Response – 200 OK**

---

### ✏️ PATCH a category by ID

```http
PATCH http://localhost:3000/api/category/<id>
Content-Type: application/json
```

**Request Body:**

```json
{
  "categoryName": "UpdatedCategory",
  "parentCategoryId": "..."
}
```

**Success Response – 200 OK**  
**Error Response – 400 / 404**

---

### 🗑 DELETE a category by ID

```http
DELETE http://localhost:3000/api/category/<id>
```

**Success Response – 200 OK**  
**Not Found Response – 404 Not Found**

---

## 📌 Notes

- All IDs must be valid MongoDB ObjectIds.
- Invalid body or ID → **400 Bad Request**
- Duplicate entries → **409 Conflict**
- Not found → **404**
- Server errors → **500 Internal Server Error**
- Successful creation → **201 Created**
- Successful read/update/delete → **200 OK**
