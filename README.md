# 🚀 Beeyond Quick Commerce

## 📌 Project Overview

**Beeyond Quick Commerce** is a full-stack real-time order and delivery system that simulates a quick commerce platform.

* Customers can browse products, place orders, and track delivery status in real-time.
* Delivery partners can accept and update order statuses.
* Admins can monitor all users and live orders.

The system uses **WebSockets (Socket.IO)** for real-time updates and is fully **Dockerized and deployed with Nginx reverse proxy**.

---

## 🧠 System Architecture

```
Browser (Client)
      ↓
Nginx (Reverse Proxy)
      ├── / → Frontend (React + Vite)
      ├── /api → Backend (Node.js + Express)
      └── /socket.io → WebSocket Server (Socket.IO)
                        ↓
                     MongoDB Atlas
```

---

## 🛠️ Tech Stack

### Frontend

* React.js (Vite)
* Axios
* Responsive UI

### Backend

* Node.js
* Express.js
* JWT Authentication (Cookie-based)
* Role-Based Access Control

### Database

* MongoDB Atlas

### Real-Time

* Socket.IO

### DevOps

* Docker & Docker Compose
* Nginx (Reverse Proxy)
* Ubuntu VM (VirtualBox)

---

## 👥 User Roles & Features

### 🧑‍💻 Customer

* Register / Login
* Browse product catalog
* Add products to cart
* Place orders
* Track order status in real-time

### 🚚 Delivery Partner

* Register / Login
* View unassigned orders
* Accept orders (locking mechanism)
* Update order status:
  * Accepted
  * Picked Up
  * On the Way
  * Delivered

### 🛠️ Admin

* View all users
* View all orders
* Monitor order status

---

## 🔐 Authentication

* JWT-based authentication
* Token stored in **HTTP-only cookies**
* Role-based route protection (Customer / Delivery / Admin)

---

## 🔌 API Endpoints

### Auth

* `/api/auth/login`
* `/api/auth/register`

### Products

* `/api/products`

### Orders

* `/api/orders`

### Users

* `/api/users`

---

## ⚡ WebSocket Flow (Socket.IO)

1. Client connects to WebSocket server
2. Server authenticates user via cookie token
3. User joins:
   * Role-based room (customer / delivery / admin)
   * User-specific room (`user:<id>`)
4. Delivery updates trigger events
5. Events are emitted to:
   * Specific user
   * Relevant rooms

👉 This enables **real-time order tracking without page refresh**

---

## 🐳 Docker Setup

### Services:

* Frontend (React + Nginx)
* Backend (Node.js API + Socket.IO)
* MongoDB Atlas (external)

---

## 📁 Project Structure

```
frontend/
backend/
docker-compose.yml
```

---

## ⚙️ Environment Variables

Create `.env` files in both **backend** and **frontend** directories.

---

### 🔹 Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

---

### 🔹 Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=server_url
```

---

### 📝 Notes

* `MONGO_URI`: MongoDB Atlas connection string
* `JWT_SECRET`: Secret key for signing JWT tokens
* `VITE_API_BASE_URL`: Uses `/api` because Nginx reverse proxy routes API requests


---

## 🚀 Setup Instructions

### 1. SSH into server

```bash
ssh <your-server>
```

### 2. Clone repository

```bash
git clone <repo-url>
cd <project-folder>
```

### 3. Start application

```bash
docker compose up -d --build
```

---

## 🌐 Reverse Proxy (Nginx)

Nginx is used as a **reverse proxy** to route traffic:

* `/` → Frontend
* `/api` → Backend
* `/socket.io` → WebSocket server

### Benefits:

* Eliminates CORS issues
* Single public entry point
* Clean production-like architecture

---

## ❤️ Health Check

```
GET /api/health
```

Returns:

```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---


## 🚀 Conclusion

This project demonstrates a complete **full-stack + DevOps workflow**, including real-time communication, containerization, and deployment strategies.

---
