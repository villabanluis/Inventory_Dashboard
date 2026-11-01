# Inventory Dashboard

A dashboard application with full CRUD functionality.

**Tech stack:** Express.js, SQLite (better-sqlite3), HTML/CSS/JavaScript

## Features
- Create, read, update, and delete products
- Dashboard cards: total products, inventory value, low-stock count
- Products-by-category chart
- Search/filter table
- Input validation on the server

## How to run
1. Install Node.js (v18 or newer)
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. Open http://localhost:3000

## API endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | List all products |
| GET | /api/stats | Dashboard statistics |
| POST | /api/products | Create a product |
| PUT | /api/products/:id | Update a product |
| DELETE | /api/products/:id | Delete a product |
