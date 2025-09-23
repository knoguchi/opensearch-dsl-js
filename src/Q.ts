/**
 * Q - Query Helper for Clean Syntax
 * 
 * Provides convenient factory functions for creating queries
 */

import { BoolQuery } from './queries/BoolQuery.js';
import { TermQuery } from './queries/TermQuery.js';
import { MatchQuery } from './queries/MatchQuery.js';
import { RangeQuery } from './queries/RangeQuery.js';
import { WildcardQuery } from './queries/WildcardQuery.js';
import { PrefixQuery } from './queries/PrefixQuery.js';
import { ExistsQuery } from './queries/ExistsQuery.js';
import { TermsQuery } from './queries/TermsQuery.js';
import { IdsQuery } from './queries/IdsQuery.js';
import { MatchPhraseQuery } from './queries/MatchPhraseQuery.js';
import { MultiMatchQuery } from './queries/MultiMatchQuery.js';
import { MatchAllQuery } from './queries/MatchAllQuery.js';
import { FuzzyQuery } from './queries/FuzzyQuery.js';
import { BoostingQuery } from './queries/BoostingQuery.js';
import { ConstantScoreQuery } from './queries/ConstantScoreQuery.js';
import { NestedQuery } from './queries/NestedQuery.js';
import { MoreLikeThisQuery, LikeDocument } from './queries/MoreLikeThisQuery.js';
import { ScriptScoreQuery, ScriptConfig } from './queries/ScriptScoreQuery.js';
import { Query } from './core/Query.js';
import { ESValue, ESField } from './core/types.js';

/**
 * Query factory functions for clean, readable query construction
 */
export const Q = {
  // Basic query constructors
  bool: (): BoolQuery => new BoolQuery(),
  term: (field: ESField, value: ESValue): TermQuery => new TermQuery(field, value),
  terms: (field: ESField, values: ESValue[]): TermsQuery => new TermsQuery(field, values),
  match: (field: ESField, query: string): MatchQuery => new MatchQuery(field, query),
  matchPhrase: (field: ESField, phrase: string): MatchPhraseQuery => new MatchPhraseQuery(field, phrase),
  multiMatch: (query: string, fields: ESField | ESField[]): MultiMatchQuery => new MultiMatchQuery(query, fields),
  matchAll: (): MatchAllQuery => new MatchAllQuery(),
  range: (field: ESField): RangeQuery => new RangeQuery(field),
  wildcard: (field: ESField, pattern: string): WildcardQuery => new WildcardQuery(field, pattern),
  prefix: (field: ESField, value: string): PrefixQuery => new PrefixQuery(field, value),
  fuzzy: (field: ESField, value: ESValue): FuzzyQuery => new FuzzyQuery(field, value),
  exists: (field: ESField): ExistsQuery => new ExistsQuery(field),
  ids: (ids: string | string[]): IdsQuery => new IdsQuery(ids),

  // Compound queries
  boosting: (positive: Query, negative: Query, negativeBoost?: number): BoostingQuery =>
    new BoostingQuery(positive, negative, negativeBoost),
  constantScore: (filter: Query, boost?: number): ConstantScoreQuery =>
    new ConstantScoreQuery(filter, boost),

  // Joining queries
  nested: (path: ESField, query: Query): NestedQuery => new NestedQuery(path, query),

  // Specialized queries
  moreLikeThis: (fields: ESField | ESField[], like: LikeDocument | LikeDocument[]): MoreLikeThisQuery =>
    new MoreLikeThisQuery(fields, like),
  scriptScore: (query: Query, script: ScriptConfig): ScriptScoreQuery =>
    new ScriptScoreQuery(query, script),

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
export {
  BoolQuery, TermQuery, TermsQuery, MatchQuery, MatchPhraseQuery, MultiMatchQuery, MatchAllQuery,
  RangeQuery, WildcardQuery, PrefixQuery, FuzzyQuery, ExistsQuery, IdsQuery,
  BoostingQuery, ConstantScoreQuery, NestedQuery, MoreLikeThisQuery, ScriptScoreQuery
};
export { Query } from './core/Query.js';
export type { QueryBody, QueryMetadata, Operation } from './core/types.js';