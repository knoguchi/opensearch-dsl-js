/**
 * Q - Query Helper for Clean Syntax
 * 
 * Provides convenient factory functions for creating queries
 */

import { BoolQuery } from './queries/BoolQuery.js';
import { TermQuery } from './queries/TermQuery.js';
import { MatchQuery } from './queries/MatchQuery.js';
import { RangeQuery } from './queries/RangeQuery.js';
import { Query } from './core/Query.js';
import { ESValue, ESField } from './core/types.js';

/**
 * Query factory functions for clean, readable query construction
 */
export const Q = {
  // Basic query constructors
  bool: (): BoolQuery => new BoolQuery(),
  term: (field: ESField, value: ESValue): TermQuery => new TermQuery(field, value),
  match: (field: ESField, query: string): MatchQuery => new MatchQuery(field, query),
  range: (field: ESField): RangeQuery => new RangeQuery(field),

  // Convenience combinators
  and: (...queries: Query[]): BoolQuery => {
    return new BoolQuery().must(queries);
  },

  or: (...queries: Query[]): BoolQuery => {
    return new BoolQuery().should(queries);
  },

  not: (query: Query): BoolQuery => {
    return new BoolQuery().mustNot(query);
  },

  // Common patterns
  exists: (field: ESField): RangeQuery => {
    // Use range query with exists pattern
    return new RangeQuery(field).gte(null);
  },

  filter: (...queries: Query[]): BoolQuery => {
    return new BoolQuery().filter(queries);
  },

  must: (...queries: Query[]): BoolQuery => {
    return new BoolQuery().must(queries);
  },

  should: (...queries: Query[]): BoolQuery => {
    return new BoolQuery().should(queries);
  },

  // Utility functions
  isEmpty: (query: Query): boolean => {
    if (query instanceof BoolQuery) {
      return query.isEmpty();
    }
    return false;
  },

  // Debugging helpers
  debug: (query: Query): void => {
    console.log('=== Query Debug ===');
    console.log('Type:', query.constructor.name);
    console.log('ID:', query.id());
    console.log('JSON:', JSON.stringify(query.toJSON(), null, 2));
    console.log('Code:', query.toCode());
    console.log('Metadata:', query.metadata());
    console.log('==================');
  },

  // Validation helpers
  validate: (query: Query): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    try {
      const json = query.toJSON();
      
      // Basic validation
      if (!json || typeof json !== 'object') {
        errors.push('Query does not produce valid JSON object');
      }
      
      // Type-specific validation
      if (query instanceof BoolQuery) {
        if (query.isEmpty()) {
          errors.push('Bool query has no clauses');
        }
      }
      
      if (query instanceof RangeQuery) {
        if (!query.hasBounds()) {
          errors.push('Range query has no bounds set');
        }
      }
      
    } catch (error) {
      errors.push(`Query serialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },

  // Comparison helpers
  equals: (query1: Query, query2: Query): boolean => {
    return query1.equals(query2);
  },

  // Serialization helpers
  serialize: (query: Query): string => {
    return JSON.stringify({
      type: query.constructor.name,
      body: query.toJSON(),
      metadata: query.metadata()
    }, null, 2);
  }
};

// Type definitions for better IDE support
export type QueryFactory = typeof Q;

// Export individual query types for advanced usage
export { BoolQuery, TermQuery, MatchQuery, RangeQuery };
export { Query } from './core/Query.js';
export type { QueryBody, QueryMetadata, Operation } from './core/types.js';