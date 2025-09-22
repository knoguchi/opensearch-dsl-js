/**
 * Match Query - Immutable Implementation
 * 
 * Full-text search with analysis
 */

import { Query } from '../core/Query.js';
import { QueryBody, ESField } from '../core/types.js';

export interface MatchQueryBody extends QueryBody {
  match: {
    [field: string]: string | {
      query: string;
      operator?: 'and' | 'or';
      minimum_should_match?: number | string;
      fuzziness?: 'AUTO' | number;
      prefix_length?: number;
      max_expansions?: number;
      boost?: number;
      analyzer?: string;
      auto_generate_synonyms_phrase_query?: boolean;
    };
  };
}

export class MatchQuery extends Query<MatchQueryBody> {
  constructor(field: ESField, query: string) {
    const body: MatchQueryBody = {
      match: {
        [field]: query
      }
    };
    
    super(body);
  }

  /**
   * Set operator (and/or) - returns NEW instance
   */
  operator(value: 'and' | 'or'): MatchQuery {
    const operation = this._recordOperation('operator', [value]);
    const [[field, currentValue]] = Object.entries(this._body.match);
    
    const newValue = typeof currentValue === 'object'
      ? { ...currentValue, operator: value }
      : { query: currentValue, operator: value };

    return this._createNew({
      match: { [field]: newValue }
    }, operation);
  }

  /**
   * Set minimum should match - returns NEW instance
   */
  minimumShouldMatch(value: number | string): MatchQuery {
    const operation = this._recordOperation('minimumShouldMatch', [value]);
    const [[field, currentValue]] = Object.entries(this._body.match);
    
    const newValue = typeof currentValue === 'object'
      ? { ...currentValue, minimum_should_match: value }
      : { query: currentValue, minimum_should_match: value };

    return this._createNew({
      match: { [field]: newValue }
    }, operation);
  }

  /**
   * Set fuzziness - returns NEW instance
   */
  fuzziness(value: 'AUTO' | number): MatchQuery {
    const operation = this._recordOperation('fuzziness', [value]);
    const [[field, currentValue]] = Object.entries(this._body.match);
    
    const newValue = typeof currentValue === 'object'
      ? { ...currentValue, fuzziness: value }
      : { query: currentValue, fuzziness: value };

    return this._createNew({
      match: { [field]: newValue }
    }, operation);
  }

  /**
   * Set prefix length - returns NEW instance
   */
  prefixLength(value: number): MatchQuery {
    const operation = this._recordOperation('prefixLength', [value]);
    const [[field, currentValue]] = Object.entries(this._body.match);
    
    const newValue = typeof currentValue === 'object'
      ? { ...currentValue, prefix_length: value }
      : { query: currentValue, prefix_length: value };

    return this._createNew({
      match: { [field]: newValue }
    }, operation);
  }

  /**
   * Set max expansions - returns NEW instance
   */
  maxExpansions(value: number): MatchQuery {
    const operation = this._recordOperation('maxExpansions', [value]);
    const [[field, currentValue]] = Object.entries(this._body.match);
    
    const newValue = typeof currentValue === 'object'
      ? { ...currentValue, max_expansions: value }
      : { query: currentValue, max_expansions: value };

    return this._createNew({
      match: { [field]: newValue }
    }, operation);
  }

  /**
   * Set boost value - returns NEW instance
   */
  boost(value: number): MatchQuery {
    const operation = this._recordOperation('boost', [value]);
    const [[field, currentValue]] = Object.entries(this._body.match);
    
    const newValue = typeof currentValue === 'object'
      ? { ...currentValue, boost: value }
      : { query: currentValue, boost: value };

    return this._createNew({
      match: { [field]: newValue }
    }, operation);
  }

  /**
   * Set analyzer - returns NEW instance
   */
  analyzer(value: string): MatchQuery {
    const operation = this._recordOperation('analyzer', [value]);
    const [[field, currentValue]] = Object.entries(this._body.match);
    
    const newValue = typeof currentValue === 'object'
      ? { ...currentValue, analyzer: value }
      : { query: currentValue, analyzer: value };

    return this._createNew({
      match: { [field]: newValue }
    }, operation);
  }

  /**
   * Set auto generate synonyms phrase query - returns NEW instance
   */
  autoGenerateSynonymsPhraseQuery(value: boolean): MatchQuery {
    const operation = this._recordOperation('autoGenerateSynonymsPhraseQuery', [value]);
    const [[field, currentValue]] = Object.entries(this._body.match);
    
    const newValue = typeof currentValue === 'object'
      ? { ...currentValue, auto_generate_synonyms_phrase_query: value }
      : { query: currentValue, auto_generate_synonyms_phrase_query: value };

    return this._createNew({
      match: { [field]: newValue }
    }, operation);
  }

  /**
   * Generate source code representation
   */
  toCode(): string {
    const [[field, value]] = Object.entries(this._body.match);
    const operations = this._metadata.operations;
    
    const queryText = typeof value === 'object' ? value.query : value;
    let code = `Q.match('${field}', '${queryText}')`;
    
    for (const op of operations) {
      switch (op.method) {
        case 'operator':
        case 'fuzziness':
        case 'analyzer':
          code += `\n  .${op.method}('${op.args[0]}')`;
          break;
        case 'minimumShouldMatch':
        case 'prefixLength':
        case 'maxExpansions':
        case 'boost':
        case 'autoGenerateSynonymsPhraseQuery':
          code += `\n  .${op.method}(${op.args[0]})`;
          break;
      }
    }

    return code;
  }

  /**
   * Create a new instance with updated body
   */
  clone(body?: Partial<MatchQueryBody>, _metadata?: any): MatchQuery {
    const newBody = body ? { ...this._body, ...body } : this._body;
    const [[field, value]] = Object.entries(newBody.match);
    
    // Create new MatchQuery with just field and query text to avoid recursion
    const queryText = typeof value === 'object' ? value.query : value;
    const newQuery = new MatchQuery(field, queryText);
    
    // Manually set the body to preserve all properties without triggering methods
    (newQuery as any)._body = Object.freeze(newQuery._deepClone(newBody));
    
    return newQuery;
  }

  /**
   * Get the field name for this match query
   */
  getField(): string {
    return Object.keys(this._body.match)[0];
  }

  /**
   * Get the query text for this match query
   */
  getQueryText(): string {
    const value = Object.values(this._body.match)[0];
    return typeof value === 'object' ? value.query : value;
  }

  /**
   * Get operator if set
   */
  getOperator(): 'and' | 'or' | undefined {
    const value = Object.values(this._body.match)[0];
    if (typeof value === 'object' && 'operator' in value) {
      return value.operator;
    }
    return undefined;
  }

  /**
   * Get fuzziness if set
   */
  getFuzziness(): 'AUTO' | number | undefined {
    const value = Object.values(this._body.match)[0];
    if (typeof value === 'object' && 'fuzziness' in value) {
      return value.fuzziness;
    }
    return undefined;
  }
}