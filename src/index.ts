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
export { TermsQuery } from './queries/TermsQuery.js';
export { MatchQuery } from './queries/MatchQuery.js';
export { MatchPhraseQuery } from './queries/MatchPhraseQuery.js';
export { MultiMatchQuery } from './queries/MultiMatchQuery.js';
export { MatchAllQuery } from './queries/MatchAllQuery.js';
export { RangeQuery } from './queries/RangeQuery.js';
export { WildcardQuery } from './queries/WildcardQuery.js';
export { PrefixQuery } from './queries/PrefixQuery.js';
export { FuzzyQuery } from './queries/FuzzyQuery.js';
export { ExistsQuery } from './queries/ExistsQuery.js';
export { IdsQuery } from './queries/IdsQuery.js';
export { BoostingQuery } from './queries/BoostingQuery.js';
export { ConstantScoreQuery } from './queries/ConstantScoreQuery.js';
export { NestedQuery } from './queries/NestedQuery.js';
export { MoreLikeThisQuery } from './queries/MoreLikeThisQuery.js';
export { ScriptScoreQuery } from './queries/ScriptScoreQuery.js';
export { QueryStringQuery } from './queries/QueryStringQuery.js';
export { SimpleQueryStringQuery } from './queries/SimpleQueryStringQuery.js';
export { MatchPhrasePrefixQuery } from './queries/MatchPhrasePrefixQuery.js';
export { TermsSetQuery } from './queries/TermsSetQuery.js';
export { DisMaxQuery } from './queries/DisMaxQuery.js';
export { FunctionScoreQuery } from './queries/FunctionScoreQuery.js';

// Export base classes and types
export { Query } from './core/Query.js';
export type { QueryBody, QueryMetadata, Operation, QueryContext, ESValue, ESField } from './core/types.js';

// Re-export for convenience
import { Q } from './Q.js';
export default Q;