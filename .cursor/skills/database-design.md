# Database Design Skill

> **Purpose:** Designing efficient, normalized, and scalable database schemas with data integrity and performance optimization.

---

## 1. Schema Design Principles

### The 5 Questions Before Any Schema
```
1. What are the core entities? (User, Order, Product)
2. What are the relationships? (1:1, 1:N, N:M)
3. What are the access patterns? (Read-heavy? Write-heavy?)
4. What is the expected data volume? (rows, growth rate)
5. What are the consistency requirements? (ACID? Eventual?)
```

### Naming Conventions
```sql
-- Tables: plural, snake_case
users, order_items, user_preferences

-- Columns: singular, snake_case
user_id, created_at, is_active

-- Primary Keys: id or {table}_id
id (preferred) or user_id

-- Foreign Keys: {referenced_table}_id
user_id, order_id

-- Indexes: idx_{table}_{columns}
idx_users_email, idx_orders_user_id_created_at

-- Constraints: {type}_{table}_{columns}
uk_users_email, fk_orders_user_id
```

---

## 2. Normalization Guide

### Normal Forms Checklist
```
1NF: ✓ Atomic values (no arrays in columns)
     ✓ Unique column names
     ✓ Single value per cell

2NF: ✓ 1NF satisfied
     ✓ No partial dependencies (all non-key columns depend on FULL primary key)

3NF: ✓ 2NF satisfied
     ✓ No transitive dependencies (non-key columns don't depend on other non-key columns)
```

### When to Denormalize
Denormalize ONLY when:
- Read performance is critical AND
- Write frequency is low AND
- Data consistency can be managed

```sql
-- Example: Denormalized order total
-- Instead of calculating: SUM(order_items.price * quantity)
-- Store: orders.total_amount (update via trigger or application)
```

---

## 3. Data Type Selection

### Strings
| Use Case | Type | Notes |
| :--- | :--- | :--- |
| Fixed length (country code) | `CHAR(2)` | Faster for fixed sizes |
| Variable short text | `VARCHAR(255)` | Email, username |
| Long text | `TEXT` | Descriptions, content |
| UUID | `UUID` or `CHAR(36)` | Native UUID when available |

### Numbers
| Use Case | Type | Notes |
| :--- | :--- | :--- |
| Primary keys | `BIGINT` or `UUID` | BIGINT for performance |
| Money/currency | `DECIMAL(19,4)` | NEVER use FLOAT |
| Counters | `INTEGER` | With CHECK >= 0 |
| Percentages | `DECIMAL(5,2)` | 0.00 to 100.00 |

### Dates & Times
| Use Case | Type | Notes |
| :--- | :--- | :--- |
| Timestamps | `TIMESTAMPTZ` | ALWAYS with timezone |
| Date only | `DATE` | Birthdays, deadlines |
| Time only | `TIME` | Schedules |
| Duration | `INTERVAL` | PostgreSQL specific |

### Booleans & Enums
```sql
-- Booleans: use for true binary states
is_active BOOLEAN NOT NULL DEFAULT true

-- Enums: use for fixed, rarely-changing values
status VARCHAR(20) CHECK (status IN ('pending', 'active', 'completed'))
-- OR (PostgreSQL)
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered')
```

---

## 4. Indexing Strategy

### Index Decision Matrix
| Query Pattern | Index Type |
| :--- | :--- |
| Equality (`WHERE x = ?`) | B-tree (default) |
| Range (`WHERE x > ?`) | B-tree |
| Pattern (`WHERE x LIKE 'abc%'`) | B-tree (prefix only) |
| Full text search | GIN / Full-text index |
| JSON fields | GIN |
| Geospatial | GiST / R-tree |

### Index Best Practices
```sql
-- 1. Index foreign keys (for JOIN performance)
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- 2. Composite indexes: most selective column first
CREATE INDEX idx_orders_status_created ON orders(status, created_at);

-- 3. Covering indexes for frequent queries
CREATE INDEX idx_users_email_name ON users(email) INCLUDE (first_name, last_name);

-- 4. Partial indexes for filtered queries
CREATE INDEX idx_orders_pending ON orders(created_at) WHERE status = 'pending';
```

### Index Anti-Patterns
```
❌ Index every column
❌ Index low-cardinality columns alone (boolean, status)
❌ Too many indexes on write-heavy tables
❌ Unused indexes (check pg_stat_user_indexes)
```

---

## 5. Relationship Patterns

### One-to-One (1:1)
```sql
-- Option A: Same table (preferred if always accessed together)
users (id, email, profile_bio, profile_avatar_url)

-- Option B: Separate table (if large/optional data)
users (id, email)
user_profiles (user_id PRIMARY KEY REFERENCES users(id), bio, avatar_url)
```

### One-to-Many (1:N)
```sql
-- Foreign key on the "many" side
users (id, email)
orders (id, user_id REFERENCES users(id), total)
```

### Many-to-Many (N:M)
```sql
-- Junction table with composite primary key
users (id, email)
roles (id, name)
user_roles (
  user_id REFERENCES users(id),
  role_id REFERENCES roles(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
)
```

---

## 6. Data Integrity Constraints

### Essential Constraints
```sql
-- NOT NULL: Required fields
email VARCHAR(255) NOT NULL

-- UNIQUE: No duplicates
email VARCHAR(255) UNIQUE

-- CHECK: Value validation
age INTEGER CHECK (age >= 0 AND age <= 150)
status VARCHAR(20) CHECK (status IN ('active', 'inactive'))

-- FOREIGN KEY: Referential integrity
user_id BIGINT REFERENCES users(id) ON DELETE CASCADE

-- DEFAULT: Sensible defaults
created_at TIMESTAMPTZ DEFAULT NOW()
is_active BOOLEAN DEFAULT true
```

### Foreign Key Actions
| Action | Use When |
| :--- | :--- |
| `CASCADE` | Child records should be deleted with parent |
| `SET NULL` | Child should remain, reference cleared |
| `RESTRICT` | Prevent deletion if children exist |
| `NO ACTION` | Check at transaction end (default) |

---

## 7. Migration Strategy

### Migration Principles
```
1. Additive First: Add new columns as nullable
2. Backfill: Populate data for existing rows
3. Enforce: Add NOT NULL or constraints after backfill
4. Cleanup: Remove old columns in separate migration
```

### Safe Migration Patterns
```sql
-- ✅ SAFE: Add nullable column
ALTER TABLE users ADD COLUMN middle_name VARCHAR(100);

-- ✅ SAFE: Add column with default (Postgres 11+)
ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false;

-- ⚠️ CAREFUL: Add NOT NULL requires default or backfill
ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active' NOT NULL;

-- ❌ DANGEROUS: Rename column (breaks application)
-- Use: Add new → migrate data → update app → drop old

-- ❌ DANGEROUS: Change column type (may fail)
-- Use: Add new column → migrate → switch → drop old
```

### Zero-Downtime Migration
```
Phase 1: Add new column (nullable)
Phase 2: Deploy code that writes to BOTH columns
Phase 3: Backfill old rows
Phase 4: Deploy code that reads from new column
Phase 5: Add NOT NULL constraint
Phase 6: Deploy code that only writes to new column
Phase 7: Drop old column
```

---

## 8. Performance Patterns

### Query Optimization Checklist
```
□ Use EXPLAIN ANALYZE to verify query plan
□ Avoid SELECT * (specify columns)
□ Use pagination (LIMIT/OFFSET or cursor-based)
□ Avoid N+1 queries (use JOINs or batch loading)
□ Use prepared statements (plan caching)
```

### Pagination Patterns
```sql
-- Offset pagination (simple but slow for large offsets)
SELECT * FROM orders ORDER BY id LIMIT 20 OFFSET 100;

-- Cursor pagination (better for large datasets)
SELECT * FROM orders WHERE id > :last_seen_id ORDER BY id LIMIT 20;
```

### Batch Operations
```sql
-- Insert many rows efficiently
INSERT INTO users (email, name) VALUES
  ('a@example.com', 'Alice'),
  ('b@example.com', 'Bob'),
  ('c@example.com', 'Charlie');

-- Update with batching (avoid locking entire table)
UPDATE orders SET status = 'archived'
WHERE id IN (SELECT id FROM orders WHERE created_at < '2023-01-01' LIMIT 1000);
```

---

## 9. Schema Documentation Template

For `systemPatterns.md`:

```markdown
## Database Schema: {Feature Name}

### Entity: {TableName}
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, AUTO | Unique identifier |
| ... | ... | ... | ... |

### Relationships
- {TableA} 1:N {TableB} via {foreign_key}
- {TableA} N:M {TableB} via {junction_table}

### Indexes
| Name | Columns | Type | Purpose |
| :--- | :--- | :--- | :--- |
| idx_... | col1, col2 | B-tree | Query optimization for... |

### Access Patterns
- Read: {Describe common read queries}
- Write: {Describe write frequency and patterns}

### Migration Notes
- Backward compatible: {Yes/No}
- Requires backfill: {Yes/No}
- Estimated duration: {Time}
```

---

## 10. Anti-Patterns

| ❌ Avoid | ✅ Correct Approach |
| :--- | :--- |
| Store money as FLOAT | Use DECIMAL(19,4) |
| Timestamp without timezone | Always use TIMESTAMPTZ |
| Storing JSON for relational data | Proper normalized tables |
| No foreign key constraints | Enforce referential integrity |
| `SELECT *` in production | Specify needed columns |
| No indexes on foreign keys | Always index FK columns |
| UUID as clustered primary key | Use BIGINT or ordered UUIDs |
| Soft deletes everywhere | Only when audit trail required |

