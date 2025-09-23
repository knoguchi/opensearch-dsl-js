/**
 * Match Phrase Prefix Query - Immutable Implementation
 *
 * Like match_phrase, but allows prefix matching on the last term.
 * Perfect for autocomplete and typeahead functionality.
 */

import { Query } from '../core/Query.js';
import { QueryBody, ESField } from '../core/types.js';

export interface MatchPhrasePrefixQueryBody extends QueryBody {
  match_phrase_prefix: {
    [field: string]: {
      query: string;
      analyzer?: string;
      max_expansions?: number;
      slop?: number;
      zero_terms_query?: 'none' | 'all';
      boost?: number;
    } | string;
  };
}

export class MatchPhrasePrefixQuery extends Query<MatchPhrasePrefixQueryBody> {
  constructor(field: ESField, query: string) {
    const body: MatchPhrasePrefixQueryBody = {
      match_phrase_prefix: {
        [field as string]: query
      }
    };

    super(body);
  }

  /**
   * Set analyzer - returns NEW instance
   */
  analyzer(analyzer: string): MatchPhrasePrefixQuery {
    const operation = this._recordOperation('analyzer', [analyzer]);
    const field = this.getField();
    const currentQuery = this.getQuery();

    return this._createNew({
      match_phrase_prefix: {
        [field]: {
          query: currentQuery,
          ...this._getFieldObject(),
          analyzer
        }
      }
    }, operation);
  }

  /**
   * Set maximum expansions for prefix - returns NEW instance
   */
  maxExpansions(max: number): MatchPhrasePrefixQuery {
    const operation = this._recordOperation('maxExpansions', [max]);
    const field = this.getField();
    const currentQuery = this.getQuery();

    return this._createNew({
      match_phrase_prefix: {
        [field]: {
          query: currentQuery,
          ...this._getFieldObject(),
          max_expansions: max
        }
      }
    }, operation);
  }

  /**
   * Set slop (word distance tolerance) - returns NEW instance
   */
  slop(slop: number): MatchPhrasePrefixQuery {
    const operation = this._recordOperation('slop', [slop]);
    const field = this.getField();
    const currentQuery = this.getQuery();

    return this._createNew({
      match_phrase_prefix: {
        [field]: {
          query: currentQuery,
          ...this._getFieldObject(),
          slop
        }
      }
    }, operation);
  }

  /**
   * Set zero terms query behavior - returns NEW instance
   */
  zeroTermsQuery(behavior: 'none' | 'all'): MatchPhrasePrefixQuery {
    const operation = this._recordOperation('zeroTermsQuery', [behavior]);
    const field = this.getField();
    const currentQuery = this.getQuery();

    return this._createNew({
      match_phrase_prefix: {
        [field]: {
          query: currentQuery,
          ...this._getFieldObject(),
          zero_terms_query: behavior
        }
      }
    }, operation);
  }

  /**
   * Set boost value - returns NEW instance
   */
  boost(value: number): MatchPhrasePrefixQuery {
    const operation = this._recordOperation('boost', [value]);
    const field = this.getField();
    const currentQuery = this.getQuery();

    return this._createNew({
      match_phrase_prefix: {
        [field]: {
          query: currentQuery,
          ...this._getFieldObject(),
          boost: value
        }
      }
    }, operation);
  }

  /**
   * Generate source code representation
   */
  toCode(): string {
    const operations = this._metadata.operations;
    const field = this.getField();
    const query = this.getQuery();

    if (operations.length === 0) {
      return `Q.matchPhrasePrefix('${field}', '${query}')`;
    }

    let code = `Q.matchPhrasePrefix('${field}', '${query}')`;
    for (const op of operations) {
      switch (op.method) {
        case 'analyzer':
          code += `\n  .analyzer('${op.args[0]}')`;
          break;
        case 'maxExpansions':
        case 'slop':
        case 'boost':
          code += `\n  .${op.method}(${op.args[0]})`;
          break;
        case 'zeroTermsQuery':
          code += `\n  .zeroTermsQuery('${op.args[0]}')`;
          break;
      }
    }

    return code;
  }

  /**
   * Create a new instance with updated body
   */
  clone(body?: Partial<MatchPhrasePrefixQueryBody>, _metadata?: any): MatchPhrasePrefixQuery {
    const newBody = body ? { ...this._body, ...body } : this._body;
    const field = this.getField();
    const query = this.getQuery();

    return new MatchPhrasePrefixQuery(field, query);
  }

  /**
   * Get field name
   */
  getField(): string {
    return Object.keys(this._body.match_phrase_prefix)[0];
  }

  /**
   * Get query string
   */
  getQuery(): string {
    const field = this.getField();
    const fieldValue = this._body.match_phrase_prefix[field];
    return typeof fieldValue === 'string' ? fieldValue : fieldValue.query;
  }

  /**
   * Get field object (for chaining operations)
   */
  private _getFieldObject(): any {
    const field = this.getField();
    const fieldValue = this._body.match_phrase_prefix[field];
    if (typeof fieldValue === 'string') {
      return {};
    }
    const { query, ...rest } = fieldValue;
    return rest;
  }

  /**
   * Get analyzer for debugging
   */
  getAnalyzer(): string | undefined {
    const fieldObj = this._getFieldObject();
    return fieldObj.analyzer;
  }

  /**
   * Get max expansions for debugging
   */
  getMaxExpansions(): number | undefined {
    const fieldObj = this._getFieldObject();
    return fieldObj.max_expansions;
  }

  /**
   * Get slop for debugging
   */
  getSlop(): number | undefined {
    const fieldObj = this._getFieldObject();
    return fieldObj.slop;
  }

  /**
   * Get boost value for debugging
   */
  getBoost(): number | undefined {
    const fieldObj = this._getFieldObject();
    return fieldObj.boost;
  }
}