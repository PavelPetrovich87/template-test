# Backend Development Skill

> **Purpose:** Building robust, maintainable, and performant server-side applications with Node.js/TypeScript.

---

## 1. Architecture Patterns

### Layered Architecture
```
┌─────────────────────────────────────┐
│  Routes (HTTP layer)                │  → Request/Response handling
├─────────────────────────────────────┤
│  Controllers (Orchestration)        │  → Input validation, response formatting
├─────────────────────────────────────┤
│  Services (Business Logic)          │  → Core logic, reusable across controllers
├─────────────────────────────────────┤
│  Repositories (Data Access)         │  → Database queries, ORM interactions
├─────────────────────────────────────┤
│  Models (Data Structures)           │  → Entity definitions, schemas
└─────────────────────────────────────┘
```

### File Structure
```
backend/src/
├── controllers/     # Request handlers
│   └── user.controller.ts
├── services/        # Business logic
│   └── user.service.ts
├── repositories/    # Data access (optional if using ORM)
│   └── user.repository.ts
├── models/          # Database models/schemas
│   └── user.model.ts
├── routes/          # Route definitions
│   └── user.routes.ts
├── middleware/      # Express middleware
│   ├── auth.middleware.ts
│   └── error.middleware.ts
├── types/           # TypeScript interfaces
│   └── user.types.ts
├── utils/           # Helper functions
│   └── validation.ts
├── config/          # Configuration
│   ├── database.ts
│   └── env.ts
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

---

## 2. Request Handling Pattern

### Controller Structure
```typescript
// user.controller.ts
import { Request, Response, NextFunction } from 'express'
import { UserService } from '../services/user.service'
import { CreateUserSchema } from '../types/user.types'

export class UserController {
  constructor(private userService: UserService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Validate input
      const validated = CreateUserSchema.parse(req.body)
      
      // 2. Call service
      const user = await this.userService.create(validated)
      
      // 3. Return response
      res.status(201).json({ data: user })
    } catch (error) {
      next(error) // Pass to error middleware
    }
  }
}
```

### Service Structure
```typescript
// user.service.ts
import { User } from '../models/user.model'
import { CreateUserInput, IUser } from '../types/user.types'
import { AppError } from '../utils/errors'

export class UserService {
  async create(input: CreateUserInput): Promise<IUser> {
    // Check for existing user
    const existing = await User.findOne({ email: input.email })
    if (existing) {
      throw new AppError(409, 'USER_EXISTS', 'Email already registered')
    }
    
    // Create user
    const user = await User.create(input)
    return user
  }
}
```

---

## 3. Error Handling

### Custom Error Class
```typescript
// utils/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public isOperational: boolean = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
    Error.captureStackTrace(this, this.constructor)
  }
}

// Common errors
export const NotFoundError = (resource: string) => 
  new AppError(404, 'NOT_FOUND', `${resource} not found`)

export const ValidationError = (message: string) => 
  new AppError(400, 'VALIDATION_ERROR', message)

export const UnauthorizedError = () => 
  new AppError(401, 'UNAUTHORIZED', 'Authentication required')

export const ForbiddenError = () => 
  new AppError(403, 'FORBIDDEN', 'Insufficient permissions')
```

### Error Middleware
```typescript
// middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/errors'
import { ZodError } from 'zod'
import { logger } from '../utils/logger'

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error (but not stack for operational errors)
  if (err instanceof AppError && err.isOperational) {
    logger.warn({ code: err.code, message: err.message })
  } else {
    logger.error({ err, req: { method: req.method, path: req.path } })
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: err.errors
      }
    })
    return
  }

  // Handle known operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message
      }
    })
    return
  }

  // Unknown errors: don't leak details
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  })
}
```

---

## 4. Input Validation

### Schema Definition with Zod
```typescript
// types/user.types.ts
import { z } from 'zod'

export const CreateUserSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(12).max(128),
  name: z.string().min(1).max(100)
})

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional()
})

export const UserIdParamSchema = z.object({
  id: z.string().uuid()
})

// Derived types
export type CreateUserInput = z.infer<typeof CreateUserSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
```

### Validation Middleware
```typescript
// middleware/validate.middleware.ts
import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

export const validate = (schema: ZodSchema, source: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req[source] = schema.parse(req[source])
      next()
    } catch (error) {
      next(error)
    }
  }
}

// Usage in routes
router.post('/users', validate(CreateUserSchema), userController.create)
router.get('/users/:id', validate(UserIdParamSchema, 'params'), userController.getById)
```

---

## 5. Database Patterns

### Repository Pattern
```typescript
// repositories/user.repository.ts
import { User, UserDocument } from '../models/user.model'
import { CreateUserInput, UpdateUserInput } from '../types/user.types'

export class UserRepository {
  async findById(id: string): Promise<UserDocument | null> {
    return User.findById(id).exec()
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return User.findOne({ email }).exec()
  }

  async create(data: CreateUserInput): Promise<UserDocument> {
    return User.create(data)
  }

  async update(id: string, data: UpdateUserInput): Promise<UserDocument | null> {
    return User.findByIdAndUpdate(id, data, { new: true }).exec()
  }

  async delete(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id).exec()
    return result !== null
  }
}
```

### Transaction Handling
```typescript
// For operations requiring atomicity
import { startSession } from 'mongoose'

async transferFunds(fromId: string, toId: string, amount: number): Promise<void> {
  const session = await startSession()
  
  try {
    session.startTransaction()
    
    await Account.updateOne(
      { _id: fromId },
      { $inc: { balance: -amount } },
      { session }
    )
    
    await Account.updateOne(
      { _id: toId },
      { $inc: { balance: amount } },
      { session }
    )
    
    await session.commitTransaction()
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}
```

---

## 6. Authentication Implementation

### JWT Token Generation
```typescript
// services/auth.service.ts
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

interface TokenPayload {
  userId: string
  email: string
  role: string
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '15m',
    issuer: env.APP_NAME,
    audience: 'api'
  })
}

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: '7d'
  })
}

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET, {
    issuer: env.APP_NAME,
    audience: 'api'
  }) as TokenPayload
}
```

### Auth Middleware
```typescript
// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../services/auth.service'
import { UnauthorizedError, ForbiddenError } from '../utils/errors'

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw UnauthorizedError()
  }
  
  const token = authHeader.slice(7)
  
  try {
    const payload = verifyAccessToken(token)
    req.user = payload
    next()
  } catch {
    throw UnauthorizedError()
  }
}

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw ForbiddenError()
    }
    next()
  }
}
```

---

## 7. API Response Standards

### Success Response Format
```typescript
// Success responses
interface SuccessResponse<T> {
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

// Examples
// Single resource
res.status(200).json({ data: user })

// Collection with pagination
res.status(200).json({
  data: users,
  meta: { page: 1, limit: 20, total: 150 }
})

// Created resource
res.status(201).json({ data: createdUser })

// No content
res.status(204).send()
```

### Error Response Format
```typescript
interface ErrorResponse {
  error: {
    code: string        // Machine-readable code
    message: string     // Human-readable message
    details?: unknown   // Validation errors, etc.
  }
}

// Example
res.status(400).json({
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input',
    details: [
      { field: 'email', message: 'Invalid email format' }
    ]
  }
})
```

---

## 8. Performance Optimization

### Query Optimization
```typescript
// ✅ Select only needed fields
const user = await User.findById(id).select('name email').lean()

// ✅ Use pagination
const users = await User.find()
  .skip((page - 1) * limit)
  .limit(limit)
  .lean()

// ✅ Use indexes (define in model)
userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ createdAt: -1 })

// ✅ Use lean() for read-only queries
const users = await User.find().lean()  // Returns plain JS objects

// ✅ Parallel queries when independent
const [user, orders] = await Promise.all([
  User.findById(userId),
  Order.find({ userId })
])
```

### Caching Strategy
```typescript
// Redis caching for frequent reads
import { redis } from '../config/redis'

const CACHE_TTL = 300 // 5 minutes

async getUserById(id: string): Promise<IUser | null> {
  const cacheKey = `user:${id}`
  
  // Try cache first
  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }
  
  // Cache miss: query database
  const user = await User.findById(id).lean()
  
  if (user) {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(user))
  }
  
  return user
}

// Invalidate on update
async updateUser(id: string, data: UpdateUserInput): Promise<IUser> {
  const user = await User.findByIdAndUpdate(id, data, { new: true })
  await redis.del(`user:${id}`)
  return user
}
```

---

## 9. Logging Best Practices

### Logger Configuration
```typescript
// utils/logger.ts
import pino from 'pino'
import { env } from '../config/env'

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: env.NODE_ENV === 'development' 
    ? { target: 'pino-pretty' }
    : undefined,
  redact: ['req.headers.authorization', 'password', 'token']
})
```

### Request Logging Middleware
```typescript
// middleware/logging.middleware.ts
import { pinoHttp } from 'pino-http'
import { logger } from '../utils/logger'

export const requestLogger = pinoHttp({
  logger,
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error'
    if (res.statusCode >= 400) return 'warn'
    return 'info'
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`
  }
})
```

---

## 10. Testing Patterns

### Unit Test Structure
```typescript
// __tests__/services/user.service.test.ts
import { UserService } from '../../services/user.service'
import { UserRepository } from '../../repositories/user.repository'

describe('UserService', () => {
  let userService: UserService
  let mockRepository: jest.Mocked<UserRepository>

  beforeEach(() => {
    mockRepository = {
      findByEmail: jest.fn(),
      create: jest.fn()
    } as any
    
    userService = new UserService(mockRepository)
  })

  describe('create', () => {
    it('should create user when email is unique', async () => {
      mockRepository.findByEmail.mockResolvedValue(null)
      mockRepository.create.mockResolvedValue({ id: '1', email: 'test@example.com' })

      const result = await userService.create({ email: 'test@example.com', password: 'password123!' })

      expect(result.email).toBe('test@example.com')
      expect(mockRepository.create).toHaveBeenCalledTimes(1)
    })

    it('should throw error when email exists', async () => {
      mockRepository.findByEmail.mockResolvedValue({ id: '1', email: 'test@example.com' })

      await expect(
        userService.create({ email: 'test@example.com', password: 'password123!' })
      ).rejects.toThrow('Email already registered')
    })
  })
})
```

---

## 11. Anti-Patterns

| ❌ Avoid | ✅ Correct Approach |
| :--- | :--- |
| Business logic in controllers | Move to services |
| `console.log` for logging | Use structured logger (Pino) |
| Trusting `req.body` without validation | Always validate with Zod |
| Returning internal errors to client | Generic error message for 500s |
| Hardcoded secrets | Environment variables |
| `any` types | Strict TypeScript interfaces |
| N+1 database queries | Batch loading, `populate()` |
| Sync file operations | Async file operations |

