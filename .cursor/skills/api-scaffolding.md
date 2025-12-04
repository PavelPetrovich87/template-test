# API Scaffolding Skill

> **Purpose:** Rapidly setting up RESTful API structures with consistent patterns, routing, and documentation.

---

## 1. REST API Design Standards

### URL Structure
```
/api/v1/{resource}              # Collection
/api/v1/{resource}/{id}         # Single resource
/api/v1/{resource}/{id}/{sub}   # Sub-resource
```

### HTTP Methods & Status Codes
| Method | Purpose | Success | Error Codes |
| :--- | :--- | :--- | :--- |
| GET | Retrieve resource(s) | 200 OK | 404 Not Found |
| POST | Create resource | 201 Created | 400 Bad Request, 409 Conflict |
| PUT | Full update | 200 OK | 400, 404 |
| PATCH | Partial update | 200 OK | 400, 404 |
| DELETE | Remove resource | 204 No Content | 404 |

### Naming Conventions
```
✅ CORRECT                    ❌ AVOID
/api/v1/users                /api/v1/getUsers
/api/v1/users/123            /api/v1/user/123
/api/v1/users/123/orders     /api/v1/getUserOrders
/api/v1/orders?status=active /api/v1/active-orders
```

---

## 2. Route File Template

### Basic CRUD Routes
```typescript
// routes/user.routes.ts
import { Router } from 'express'
import { UserController } from '../controllers/user.controller'
import { authenticate, requireRole } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { CreateUserSchema, UpdateUserSchema, UserIdParamSchema } from '../types/user.types'

const router = Router()
const controller = new UserController()

// Public routes
router.post(
  '/',
  validate(CreateUserSchema),
  controller.create
)

// Protected routes
router.use(authenticate)

router.get(
  '/',
  controller.list
)

router.get(
  '/:id',
  validate(UserIdParamSchema, 'params'),
  controller.getById
)

router.patch(
  '/:id',
  validate(UserIdParamSchema, 'params'),
  validate(UpdateUserSchema),
  controller.update
)

router.delete(
  '/:id',
  validate(UserIdParamSchema, 'params'),
  requireRole(['admin']),
  controller.delete
)

export default router
```

### Route Registration
```typescript
// routes/index.ts
import { Router } from 'express'
import userRoutes from './user.routes'
import authRoutes from './auth.routes'
import orderRoutes from './order.routes'
import healthRoutes from './health.routes'

const router = Router()

// Health check (no auth)
router.use('/health', healthRoutes)

// API routes
router.use('/api/v1/auth', authRoutes)
router.use('/api/v1/users', userRoutes)
router.use('/api/v1/orders', orderRoutes)

export default router
```

---

## 3. Controller Template

### CRUD Controller
```typescript
// controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express'
import { UserService } from '../services/user.service'
import { CreateUserInput, UpdateUserInput } from '../types/user.types'

export class UserController {
  constructor(private userService: UserService = new UserService()) {}

  /**
   * POST /api/v1/users
   * Create a new user
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input: CreateUserInput = req.body
      const user = await this.userService.create(input)
      res.status(201).json({ data: user })
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/users
   * List users with pagination
   */
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      
      const result = await this.userService.list({ page, limit })
      
      res.status(200).json({
        data: result.items,
        meta: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/users/:id
   * Get user by ID
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const user = await this.userService.getById(id)
      res.status(200).json({ data: user })
    } catch (error) {
      next(error)
    }
  }

  /**
   * PATCH /api/v1/users/:id
   * Update user
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const input: UpdateUserInput = req.body
      const user = await this.userService.update(id, input)
      res.status(200).json({ data: user })
    } catch (error) {
      next(error)
    }
  }

  /**
   * DELETE /api/v1/users/:id
   * Delete user
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      await this.userService.delete(id)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}
```

---

## 4. Pagination & Filtering

### Query Parameters Schema
```typescript
// types/common.types.ts
import { z } from 'zod'

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
})

export const SortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export const UserFilterSchema = z.object({
  status: z.enum(['active', 'inactive']).optional(),
  role: z.string().optional(),
  search: z.string().max(100).optional(),
  createdAfter: z.coerce.date().optional(),
  createdBefore: z.coerce.date().optional()
})

export const UserListQuerySchema = PaginationSchema
  .merge(SortSchema)
  .merge(UserFilterSchema)
```

### Pagination Response
```typescript
interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Helper function
const buildPaginationMeta = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1
})
```

---

## 5. Authentication Routes Template

### Auth Routes
```typescript
// routes/auth.routes.ts
import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { validate } from '../middleware/validate.middleware'
import { LoginSchema, RegisterSchema, RefreshTokenSchema } from '../types/auth.types'
import { rateLimiter } from '../middleware/rate-limit.middleware'

const router = Router()
const controller = new AuthController()

router.post(
  '/register',
  rateLimiter({ windowMs: 60 * 60 * 1000, max: 5 }), // 5 per hour
  validate(RegisterSchema),
  controller.register
)

router.post(
  '/login',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }), // 5 per 15 min
  validate(LoginSchema),
  controller.login
)

router.post(
  '/refresh',
  validate(RefreshTokenSchema),
  controller.refresh
)

router.post(
  '/logout',
  controller.logout
)

router.post(
  '/forgot-password',
  rateLimiter({ windowMs: 60 * 60 * 1000, max: 3 }), // 3 per hour
  controller.forgotPassword
)

router.post(
  '/reset-password',
  controller.resetPassword
)

export default router
```

---

## 6. Health Check Endpoint

### Health Routes
```typescript
// routes/health.routes.ts
import { Router, Request, Response } from 'express'
import { checkDatabaseConnection } from '../config/database'
import { checkRedisConnection } from '../config/redis'

const router = Router()

/**
 * GET /health
 * Basic health check
 */
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  })
})

/**
 * GET /health/ready
 * Readiness check (all dependencies)
 */
router.get('/ready', async (req: Request, res: Response) => {
  const checks = {
    database: await checkDatabaseConnection(),
    redis: await checkRedisConnection()
  }
  
  const allHealthy = Object.values(checks).every(c => c.status === 'ok')
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ready' : 'not_ready',
    checks,
    timestamp: new Date().toISOString()
  })
})

/**
 * GET /health/live
 * Liveness check (process alive)
 */
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
})

export default router
```

---

## 7. Express App Setup

### App Configuration
```typescript
// app.ts
import express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import routes from './routes'
import { errorHandler } from './middleware/error.middleware'
import { requestLogger } from './middleware/logging.middleware'
import { env } from './config/env'

const app: Application = express()

// Security middleware
app.use(helmet())
app.use(cors({
  origin: env.CORS_ORIGINS.split(','),
  credentials: true
}))

// Request parsing
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true }))

// Compression
app.use(compression())

// Request logging
app.use(requestLogger)

// Routes
app.use(routes)

// Error handling (must be last)
app.use(errorHandler)

export default app
```

### Server Entry
```typescript
// server.ts
import app from './app'
import { env } from './config/env'
import { connectDatabase } from './config/database'
import { logger } from './utils/logger'

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase()
    logger.info('Database connected')
    
    // Start server
    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`)
    })
  } catch (error) {
    logger.error('Failed to start server', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

startServer()
```

---

## 8. API Documentation (OpenAPI)

### Swagger Setup
```typescript
// config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'REST API documentation'
    },
    servers: [
      { url: '/api/v1', description: 'API v1' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/types/*.ts']
}

export const swaggerSpec = swaggerJsdoc(options)
```

### JSDoc Annotations
```typescript
/**
 * @openapi
 * /users:
 *   get:
 *     summary: List all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
```

---

## 9. New Resource Scaffold Checklist

When adding a new resource (e.g., "Product"):

```
□ Create type definitions
  → types/product.types.ts (CreateSchema, UpdateSchema, IProduct)

□ Create model
  → models/product.model.ts (Mongoose schema or Prisma model)

□ Create service
  → services/product.service.ts (CRUD operations)

□ Create controller
  → controllers/product.controller.ts (HTTP handlers)

□ Create routes
  → routes/product.routes.ts (REST endpoints)

□ Register routes
  → routes/index.ts (add to router)

□ Add to systemPatterns.md
  → Define interface and endpoints

□ Write tests
  → __tests__/services/product.service.test.ts
```

---

## 10. API Versioning Strategy

### URL Versioning (Recommended)
```
/api/v1/users
/api/v2/users
```

### Migration Pattern
```typescript
// Support both versions during transition
router.use('/api/v1/users', v1UserRoutes)
router.use('/api/v2/users', v2UserRoutes)

// Deprecation header for old version
app.use('/api/v1', (req, res, next) => {
  res.setHeader('Deprecation', 'true')
  res.setHeader('Sunset', '2025-01-01')
  next()
})
```

---

## 11. Anti-Patterns

| ❌ Avoid | ✅ Correct Approach |
| :--- | :--- |
| Verbs in URLs (`/getUsers`) | Nouns only (`/users`) |
| Inconsistent pluralization | Always plural for collections |
| Business logic in routes | Move to controllers/services |
| No input validation | Validate all inputs with Zod |
| Hardcoded status codes | Use constants or enums |
| Missing error responses in docs | Document all error cases |
| No API versioning | Version from day one |
| Inconsistent response format | Standardize `{ data, meta, error }` |

