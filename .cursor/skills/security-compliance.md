# Security Compliance Skill

> **Purpose:** Implementing security best practices, regulatory compliance, and secure-by-default system design.

---

## 1. Security-First Design Principles

### The Security Mindset
```
1. Defense in Depth: Multiple layers of security
2. Least Privilege: Minimum access required
3. Fail Secure: Deny by default
4. Zero Trust: Verify everything, trust nothing
5. Secure by Default: Security without configuration
```

### Security Requirements Checklist
Before ANY feature design:
```
□ What data is being accessed? (PII, financial, health)
□ Who should have access? (roles, permissions)
□ How is access authenticated? (tokens, sessions)
□ How is data transmitted? (TLS, encryption)
□ How is data stored? (encryption at rest)
□ What are the audit requirements? (logging, retention)
□ What regulations apply? (GDPR, HIPAA, PCI-DSS)
```

---

## 2. Authentication Standards

### Password Requirements
```
Minimum: 12 characters
Required: Mix of uppercase, lowercase, numbers, symbols
Forbidden: Common passwords (check against breach databases)
Storage: Argon2id or bcrypt (cost factor 12+)
```

### Password Hashing Implementation
```typescript
// ✅ CORRECT: Use Argon2id
import { hash, verify } from 'argon2'

const hashedPassword = await hash(password, {
  type: argon2id,
  memoryCost: 65536,  // 64 MB
  timeCost: 3,
  parallelism: 4
})

// ❌ NEVER: MD5, SHA1, SHA256 without salt, plain bcrypt
```

### Session Management
```
Session Token: Cryptographically random, 256+ bits
Storage: Server-side (Redis) with secure cookie reference
Expiration: 15-30 minutes for sensitive apps, refresh token for longer
Rotation: New session ID after authentication
Invalidation: On logout, password change, suspicious activity
```

### JWT Best Practices
```typescript
// Token Configuration
{
  algorithm: 'RS256',        // Use asymmetric for distributed systems
  expiresIn: '15m',          // Short-lived access tokens
  issuer: 'your-app-name',   // Validate on verification
  audience: 'your-api'       // Validate on verification
}

// ❌ NEVER store in localStorage (XSS vulnerable)
// ✅ Store in httpOnly, secure, sameSite cookie
```

---

## 3. Authorization Patterns

### Role-Based Access Control (RBAC)
```typescript
// Define roles and permissions
const PERMISSIONS = {
  admin: ['read', 'write', 'delete', 'manage_users'],
  editor: ['read', 'write'],
  viewer: ['read']
}

// Middleware enforcement
const requirePermission = (permission: string) => (req, res, next) => {
  if (!req.user.permissions.includes(permission)) {
    throw new ForbiddenError('Insufficient permissions')
  }
  next()
}
```

### Attribute-Based Access Control (ABAC)
```typescript
// For complex rules: user can only edit their own resources
const canEditResource = (user: User, resource: Resource): boolean => {
  return resource.ownerId === user.id || user.role === 'admin'
}
```

### API Authorization Matrix
Document in `systemPatterns.md`:
```markdown
| Endpoint | Public | User | Admin |
| :--- | :--- | :--- | :--- |
| GET /api/products | ✅ | ✅ | ✅ |
| POST /api/orders | ❌ | ✅ | ✅ |
| DELETE /api/users/:id | ❌ | ❌ | ✅ |
```

---

## 4. Input Validation & Sanitization

### Validation Rules
```typescript
// Use schema validation (Zod example)
const UserInputSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100).regex(/^[a-zA-Z\s]+$/),
  age: z.number().int().min(0).max(150).optional(),
  url: z.string().url().optional()
})

// Validate EARLY, at the API boundary
const validated = UserInputSchema.parse(req.body)
```

### SQL Injection Prevention
```typescript
// ✅ CORRECT: Parameterized queries
const user = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
)

// ✅ CORRECT: ORM with parameter binding
const user = await User.findOne({ where: { email } })

// ❌ NEVER: String concatenation
const user = await db.query(`SELECT * FROM users WHERE email = '${email}'`)
```

### XSS Prevention
```typescript
// Frontend: React auto-escapes by default
<div>{userInput}</div>  // Safe

// ❌ NEVER: dangerouslySetInnerHTML with user input
<div dangerouslySetInnerHTML={{ __html: userInput }} />  // XSS vulnerable

// Backend: Set security headers
Content-Security-Policy: default-src 'self'; script-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
```

---

## 5. Data Protection

### Encryption at Rest
```
Database: Enable Transparent Data Encryption (TDE)
File Storage: S3 with SSE-KMS or client-side encryption
Backups: Encrypted with separate key from production
```

### Encryption in Transit
```
All traffic: TLS 1.2+ minimum (prefer 1.3)
Internal services: mTLS for service-to-service
Certificates: Auto-renewed (Let's Encrypt, ACM)
```

### Sensitive Data Handling
```typescript
// PII Classification
const PII_FIELDS = ['email', 'phone', 'ssn', 'address', 'dateOfBirth']

// Masking for logs
const maskPII = (data: object): object => {
  return Object.entries(data).reduce((acc, [key, value]) => {
    acc[key] = PII_FIELDS.includes(key) ? '***REDACTED***' : value
    return acc
  }, {})
}

// ❌ NEVER log sensitive data
logger.info('User data:', maskPII(userData))
```

---

## 6. API Security

### Security Headers
```typescript
// Required headers for all responses
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.setHeader('Content-Security-Policy', "default-src 'self'")
  next()
})
```

### Rate Limiting
```typescript
// Configure per endpoint sensitivity
const rateLimits = {
  '/api/auth/login': { windowMs: 15 * 60 * 1000, max: 5 },     // 5 per 15 min
  '/api/auth/reset-password': { windowMs: 60 * 60 * 1000, max: 3 }, // 3 per hour
  '/api/*': { windowMs: 60 * 1000, max: 100 }                  // 100 per minute
}
```

### CORS Configuration
```typescript
// Strict CORS for production
const corsOptions = {
  origin: ['https://your-app.com'],  // Explicit origins, never '*' with credentials
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

---

## 7. Audit Logging

### What to Log
```
Authentication: Login success/failure, logout, password changes
Authorization: Permission denied events
Data Access: Read/write to sensitive data
Admin Actions: User management, configuration changes
Security Events: Rate limit hits, invalid tokens, suspicious patterns
```

### Log Format
```typescript
interface AuditLog {
  timestamp: string       // ISO 8601
  eventType: string       // 'AUTH_LOGIN_SUCCESS', 'DATA_ACCESS', etc.
  userId: string | null   // Actor performing action
  resourceType: string    // 'User', 'Order', etc.
  resourceId: string      // ID of affected resource
  action: string          // 'CREATE', 'READ', 'UPDATE', 'DELETE'
  ipAddress: string       // Client IP
  userAgent: string       // Client user agent
  result: 'SUCCESS' | 'FAILURE'
  metadata: object        // Additional context (no PII!)
}
```

### Log Retention
```
Security logs: 1 year minimum (compliance dependent)
Access logs: 90 days
Application logs: 30 days
Debug logs: 7 days (never in production with sensitive data)
```

---

## 8. Compliance Frameworks

### GDPR Checklist
```
□ Lawful basis for processing documented
□ Privacy policy updated
□ Consent mechanism implemented (where required)
□ Data subject rights: access, rectification, erasure, portability
□ Data Processing Agreements with vendors
□ 72-hour breach notification process
□ Data Protection Impact Assessment for high-risk processing
```

### PCI-DSS Essentials (if handling cards)
```
□ Never store CVV/CVC
□ Encrypt cardholder data at rest
□ Use tokenization (Stripe, Braintree)
□ Network segmentation for cardholder environment
□ Regular vulnerability scans
□ Access logging and monitoring
```

### SOC 2 Controls
```
Security: Firewalls, encryption, access controls
Availability: Uptime monitoring, disaster recovery
Processing Integrity: QA processes, error handling
Confidentiality: Data classification, encryption
Privacy: PII handling, consent management
```

---

## 9. Vulnerability Management

### Dependency Security
```bash
# Regular scanning
npm audit
yarn audit
snyk test

# Automated updates
dependabot enabled
renovate bot configured
```

### Security Testing
```
Static Analysis: ESLint security rules, SonarQube
Dynamic Analysis: OWASP ZAP, Burp Suite
Penetration Testing: Annual third-party assessment
Bug Bounty: Consider for public-facing apps
```

---

## 10. Security Specification Template

For `systemPatterns.md`:

```markdown
## Security: {Feature Name}

### Authentication
- Method: {JWT, Session, API Key}
- Token Expiration: {Duration}
- Refresh Strategy: {How tokens are refreshed}

### Authorization
- Required Role: {admin, user, public}
- Resource Ownership: {Who can access what}
- Permission Matrix: {Endpoint → Role mapping}

### Data Protection
- Sensitive Fields: {List PII/sensitive fields}
- Encryption: {At rest, in transit requirements}
- Retention: {How long data is kept}

### Input Validation
- Schema: {Validation rules for each field}
- Sanitization: {XSS, SQL injection prevention}

### Audit Requirements
- Logged Events: {What actions are logged}
- Retention: {How long logs are kept}

### Compliance
- Applicable Regulations: {GDPR, HIPAA, PCI-DSS}
- Required Controls: {Specific compliance requirements}
```

---

## 11. Anti-Patterns

| ❌ Never | ✅ Instead |
| :--- | :--- |
| Store passwords in plain text | Argon2id or bcrypt |
| Use MD5/SHA1 for passwords | Use purpose-built password hashing |
| Log sensitive data | Mask/redact PII in logs |
| Trust client-side validation | Always validate server-side |
| Use `*` in CORS with credentials | Explicit origin whitelist |
| Disable HTTPS in production | TLS everywhere |
| Store secrets in code | Environment variables or secrets manager |
| Skip rate limiting | Rate limit all endpoints |

