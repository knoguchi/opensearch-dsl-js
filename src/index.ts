/**
 * opensearch-dsl-js - Immutable OpenSearch Query DSL
 * 
 * Main entry point for the library
 */

// Export the main Q helper
export { Q } from './Q.js';

// Export all query types
export { BoolQuery } from './queries/BoolQuery.js';
export { TermQuery } from './queries/TermQuery.js';
export { MatchQuery } from './queries/MatchQuery.js';
export { RangeQuery } from './queries/RangeQuery.js';

// Export base classes and types
export { Query } from './core/Query.js';
export type { QueryBody, QueryMetadata, Operation, QueryContext, ESValue, ESField } from './core/types.js';

// Re-export for convenience
import { Q } from './Q.js';
export default Q;