# opensearch-dsl-js

Immutable OpenSearch DSL for JavaScript/TypeScript - inspired by Python's elasticsearch-dsl

[![npm version](https://badge.fury.io/js/opensearch-dsl-js.svg)](https://badge.fury.io/js/opensearch-dsl-js)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **🔒 Immutable** - Every operation returns a new instance, ensuring safe composition
- **🔗 Fluent API** - Chainable methods for readable query construction
- **🎯 Type Safe** - Full TypeScript support with comprehensive type definitions
- **🧪 Thoroughly Tested** - 43 tests covering positive, negative, and edge cases
- **🐍 Python-inspired** - Familiar API if you know Python's elasticsearch-dsl
- **🔄 Conditional Logic** - `.when()` and `.unless()` for dynamic query building
- **🛡️ Safe Composition** - Share queries between functions without side effects
- **📊 OpenSearch Compatible** - Works with OpenSearch and Elasticsearch v7 API

## Installation

```bash
npm install opensearch-dsl-js
```

## Quick Start

```typescript
import { Q } from 'opensearch-dsl-js';

// Simple queries
const termQuery = Q.term('status', 'published');
const matchQuery = Q.match('title', 'opensearch tutorial');

// Complex boolean query
const searchQuery = Q.bool()
  .must(Q.match('content', 'search'))
  .should(Q.term('featured', true))
  .filter(Q.range('date').gte('2024-01-01'))
  .boost(1.5);

// Generate OpenSearch JSON
console.log(searchQuery.toJSON());
```

## Core Principles

### Immutability

Every operation returns a **new instance**, making queries safe to share and compose:

```typescript
const base = Q.bool().must(Q.term('type', 'article'));
const withBoost = base.boost(2.0);     // base is unchanged!
const withFilter = base.filter(...);   // base still unchanged!

// Safe to use base in multiple contexts
const query1 = addUserFilter(base, 'user1');
const query2 = addUserFilter(base, 'user2');
```

### Conditional Logic

Build dynamic queries with `.when()` and `.unless()`:

```typescript
const query = Q.bool()
  .must(Q.match('content', searchTerm))
  .when(userRole === 'admin', q => 
    q.should(Q.term('admin_content', true))
  )
  .unless(includePrivate, q => 
    q.filter(Q.term('is_private', false))
  );
```

### Safe Composition

Functions can safely modify queries without side effects:

```typescript
function addUserFilter(query, userId) {
  return Q.bool()
    .must(query)               // Original query unchanged
    .filter(Q.term('user_id', userId));
}
```

## API Reference

### Query Types

#### Boolean Queries
```typescript
Q.bool()
  .must(query)           // Must match
  .should(query)         // Should match (optional)
  .filter(query)         // Must match (no scoring)
  .mustNot(query)        // Must not match
  .minimumShouldMatch(2) // Minimum should clauses to match
  .boost(1.5);           // Query boost
```

#### Term Queries
```typescript
Q.term('field', 'value')
  .boost(2.0)
  .caseInsensitive(true);
```

#### Match Queries
```typescript
Q.match('field', 'search text')
  .operator('and')         // 'and' | 'or'
  .fuzziness('AUTO')       // Fuzzy matching
  .boost(1.5);
```

#### Range Queries
```typescript
Q.range('date')
  .gte('2024-01-01')       // Greater than or equal
  .lte('2024-12-31')       // Less than or equal
  .boost(0.8);

// Convenience method
Q.range('price').between(100, 500);
```

### Combinators

```typescript
// Logical operations
Q.and(query1, query2, query3);    // All must match
Q.or(query1, query2, query3);     // Any can match
Q.not(query);                     // Must not match
```

### Utilities

```typescript
// Debugging
Q.debug(query);           // Show query structure
Q.validate(query);        // Validate query
query.toCode();           // Generate source code

// Serialization
query.toJSON();           // OpenSearch JSON
query.equals(other);      // Structural equality
```

## Examples

### E-commerce Search

```typescript
function createProductSearch(params) {
  const { searchTerm, category, minPrice, maxPrice, inStock, featured } = params;
  
  return Q.bool()
    .must(Q.match('title', searchTerm))
    .when(category, q => 
      q.filter(Q.term('category', category))
    )
    .when(minPrice || maxPrice, q => {
      const range = Q.range('price');
      if (minPrice) range.gte(minPrice);
      if (maxPrice) range.lte(maxPrice);
      return q.filter(range);
    })
    .when(inStock, q => 
      q.filter(Q.term('in_stock', true))
    )
    .when(featured, q => 
      q.should(Q.term('featured', true)).boost(1.2)
    );
}

const query = createProductSearch({
  searchTerm: 'laptop',
  category: 'electronics',
  minPrice: 500,
  maxPrice: 2000,
  inStock: true,
  featured: true
});
```

### Blog Search with Authorization

```typescript
function createBlogSearch(searchTerm, userRole, userGroups) {
  return Q.bool()
    .must(Q.match('content', searchTerm))
    .filter(Q.term('published', true))
    .when(userRole !== 'admin', q => 
      q.filter(
        Q.or(
          Q.term('is_public', true),
          Q.term('author_id', userId),
          ...userGroups.map(group => Q.term('allowed_groups', group))
        )
      )
    )
    .when(userRole === 'premium', q => 
      q.should(Q.term('premium_content', true)).boost(1.3)
    );
}
```

### Aggregation Support (Coming Soon)

The library is designed to support aggregations in future versions:

```typescript
// Future API
const search = Q.search()
  .query(searchQuery)
  .agg('categories', Q.terms('category.keyword'))
  .agg('date_histogram', Q.dateHistogram('date', '1M'));
```

## Use with OpenSearch Client

```typescript
import { Client } from '@opensearch-project/opensearch';
import { Q } from 'opensearch-dsl-js';

const client = new Client({
  node: 'https://localhost:9200'
});

const query = Q.bool()
  .must(Q.match('title', 'opensearch'))
  .filter(Q.range('date').gte('2024-01-01'));

const response = await client.search({
  index: 'my-index',
  body: {
    query: query.toJSON(),
    size: 20
  }
});
```

## Testing

The library includes comprehensive tests covering:
- ✅ Immutability verification
- ✅ Safe composition patterns  
- ✅ Edge cases and error conditions
- ✅ Performance scenarios
- ✅ Memory safety

```bash
npm test        # Run all tests
npm run build   # Build TypeScript
```

## Comparison with Python elasticsearch-dsl

| Feature | Python elasticsearch-dsl | opensearch-dsl-js |
|---------|-------------------------|-------------------|
| Immutability | ✅ | ✅ |
| Fluent API | ✅ | ✅ |
| Conditional logic | ❌ | ✅ `.when()/.unless()` |
| Type safety | ❌ | ✅ Full TypeScript |
| Safe composition | ✅ | ✅ |
| Query validation | ✅ | ✅ |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Roadmap

- [ ] Aggregations support
- [ ] More query types (geo, script, etc.)
- [ ] Query optimization
- [ ] Visual query builder integration
- [ ] Performance benchmarks
- [ ] OpenSearch 2.x features

---

**Inspired by Python's elasticsearch-dsl** - bringing the same elegant, immutable query building experience to JavaScript/TypeScript.