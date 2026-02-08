# Fastify REST API

A secure, production-ready REST API built with Fastify, TypeScript, and PostgreSQL. Features JWT-based authentication, CRUD operations for users, customers, products, and sales tracking.

## 🚀 Features

- **JWT Authentication** - Secure RS256 token-based authentication with access and refresh tokens
- **Protected Routes** - All endpoints secured with JWT middleware
- **Input Validation** - Request validation using Zod schemas
- **CRUD Operations** - Complete CRUD for Users, Customers, Products, and Sales
- **Sales Analytics** - Monthly purchase tracking and filtering capabilities
- **Type Safety** - Full TypeScript implementation
- **Security** - HTTP-only cookies, parameterized queries, CORS support

## 📁 Project Structure

```
src/
├── index.ts                    # Application entry point
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts  # Authentication handlers
│   │   ├── auth.routes.ts      # Auth route definitions
│   │   └── schema/
│   │       └── auth.schema.ts  # Zod validation schemas
│   ├── customer/
│   │   ├── customer.controller.ts
│   │   ├── customer.routes.ts
│   │   └── schema/
│   │       └── customer.schema.ts
│   ├── product/
│   │   ├── product.controller.ts
│   │   ├── product.routes.ts
│   │   └── schema/
│   │       └── product.schema.ts
│   ├── sales/
│   │   ├── sales.controller.ts
│   │   ├── sales.routes.ts
│   │   └── schema/
│   │       └── sales.schema.ts
│   └── user/
│       ├── user.controller.ts
│       ├── user.routes.ts
│       └── schema/
│           └── user.schema.ts
└── common/
    ├── constants/
    │   └── auth.constant.ts    # JWT configuration
    ├── middlewares/
    │   └── verify-jwt.middleware.ts
    └── schemas/
        └── id.schema.ts        # Shared validation schemas
```

## 🛠️ Tech Stack

- **Framework**: [Fastify](https://www.fastify.io/) v5.7.2
- **Language**: TypeScript (ESM modules)
- **Database**: PostgreSQL via [@fastify/postgres](https://github.com/fastify/fastify-postgres)
- **Authentication**: JWT (RS256) via [jose](https://github.com/panva/jose) v6.1.3
- **Validation**: [Zod](https://github.com/colinhacks/zod) v4.3.6
- **Password Hashing**: bcrypt v6.0.0
- **Cookies**: [@fastify/cookie](https://github.com/fastify/fastify-cookie) v11.0.2

**Note**: This project uses Node's native TypeScript support with ESM modules.

## 📋 Prerequisites

- **Node.js v20.6.0+** (required for native TypeScript and `--env-file` support)
- PostgreSQL database
- RSA key pair (for JWT signing)

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables (see Configuration section)
# Create a .env file in the root directory

# Start development server with auto-reload
npm run dev
```

The dev server uses Node's native `--watch-path` flag for automatic reloading and `--env-file` for environment variables.

## ⚙️ Configuration

### Available Scripts

```bash
npm run dev    # Start development server with auto-reload
npm test       # Run tests (not yet configured)
```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT Configuration
PRIVATE_PEM="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
PUBLIC_PEM="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
ACCESS_TOKEN_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d
ACCESS_TOKEN_EXPIRATION_MS=900000
REFRESH_TOKEN_EXPIRATION_MS=604800000

# Server
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
```

### Generating RSA Keys

```bash
# Generate private key
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048

# Extract public key
openssl rsa -pubout -in private_key.pem -out public_key.pem
```

## 📊 Database Schema

The API expects the following tables:

### Users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Customers
```sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Products
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Sales
```sql
CREATE TABLE sales (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  sale_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔌 API Endpoints

### Authentication

#### Authenticate User
```http
POST /authenticate
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**: Sets `accessToken` and `refreshToken` cookies
```json
{
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "user@example.com"
  }
}
```

#### Refresh Token
```http
POST /refresh
Cookie: refreshToken=<token>
```

**Response**: Refreshes the `accessToken` cookie

---

### Users (Protected Routes)

#### Get All Users
```http
GET /users
Cookie: accessToken=<token>
```

#### Get User by ID
```http
GET /users/:id
Cookie: accessToken=<token>
```

#### Create User
```http
POST /users
Cookie: accessToken=<token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Update User
```http
PATCH /users/:id
Cookie: accessToken=<token>
Content-Type: application/json

{
  "first_name": "Jane",
  "email": "jane@example.com"
}
```

#### Delete User
```http
DELETE /users/:id
Cookie: accessToken=<token>
```

---

### Customers (Protected Routes)

#### Get All Customers
```http
GET /customers
Cookie: accessToken=<token>
```

#### Get Customer by ID
```http
GET /customers/:id
Cookie: accessToken=<token>
```

#### Create Customer
```http
POST /customers
Cookie: accessToken=<token>
Content-Type: application/json

{
  "first_name": "Alice",
  "last_name": "Smith",
  "email": "alice@example.com",
  "phone": "+1234567890"
}
```

#### Update Customer
```http
PATCH /customers/:id
Cookie: accessToken=<token>
Content-Type: application/json

{
  "phone": "+0987654321"
}
```

#### Delete Customer
```http
DELETE /customers/:id
Cookie: accessToken=<token>
```

---

### Products (Protected Routes)

#### Get All Products
```http
GET /products
Cookie: accessToken=<token>
```

#### Get Product by ID
```http
GET /products/:id
Cookie: accessToken=<token>
```

#### Create Product
```http
POST /products
Cookie: accessToken=<token>
Content-Type: application/json

{
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 1299.99,
  "stock": 50
}
```

#### Update Product
```http
PATCH /products/:id
Cookie: accessToken=<token>
Content-Type: application/json

{
  "price": 1199.99,
  "stock": 45
}
```

#### Delete Product
```http
DELETE /products/:id
Cookie: accessToken=<token>
```

---

### Sales (Protected Routes)

#### Get All Sales (with optional filters)
```http
GET /sales?customerId=1&productId=2&startDate=2024-01-01&endDate=2024-12-31
Cookie: accessToken=<token>
```

**Query Parameters**:
- `customerId` (optional) - Filter by customer ID
- `productId` (optional) - Filter by product ID
- `startDate` (optional) - Filter by start date (YYYY-MM-DD)
- `endDate` (optional) - Filter by end date (YYYY-MM-DD)

#### Get Monthly Purchases
```http
GET /sales/monthly-purchases?month=2024-01
Cookie: accessToken=<token>
```

**Query Parameters**:
- `month` (required) - Month in YYYY-MM format

---

## 🔒 Security Features

- **JWT Authentication**: RS256 algorithm with public/private key pairs
- **HTTP-Only Cookies**: Prevents XSS attacks by making tokens inaccessible to JavaScript
- **Secure Cookies**: Ensures cookies are only sent over HTTPS
- **SameSite None**: Allows cross-site requests (configure based on your needs)
- **Parameterized Queries**: Prevents SQL injection attacks
- **Input Validation**: Zod schema validation on all inputs
- **Password Hashing**: bcrypt ready (needs to be uncommented in production)

## 🚧 Production Checklist

Before deploying to production:

1. **Enable Password Hashing**:
   - Uncomment bcrypt hashing in `user.controller.ts` and `auth.controller.ts`
   - Hash passwords in create and update operations
   - Verify password hashes in authentication

2. **Environment Variables**:
   - Use proper secret management (AWS Secrets Manager, HashiCorp Vault, etc.)
   - Never commit `.env` files to version control

3. **Database**:
   - Set up proper indexes on frequently queried columns
   - Configure connection pooling
   - Enable SSL connections

4. **Security**:
   - Configure CORS properly for your domain
   - Update cookie settings (`sameSite`, `secure`, `domain`)
   - Implement rate limiting
   - Add request logging and monitoring
   - Set up error tracking (Sentry, etc.)

5. **Performance**:
   - Enable response compression
   - Configure appropriate cache headers
   - Optimize database queries

## 🧪 Testing

Testing framework not yet configured. To add tests, consider:

```bash
# Install testing dependencies
npm install --save-dev @types/node vitest

# Add test script to package.json
# "test": "vitest"
# "test:coverage": "vitest --coverage"
```

Recommended testing tools:
- **vitest** - Fast unit test framework
- **@fastify/testing** - Fastify-specific testing utilities
- **supertest** - HTTP assertion library

## 📝 License

[MIT](LICENSE)

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@example.com or open an issue in the repository.
