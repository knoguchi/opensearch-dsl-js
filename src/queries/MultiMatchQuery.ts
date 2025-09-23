/**
 * Multi Match Query - Immutable Implementation
 *
 * Searches for text across multiple fields
 */

import { Query } from '../core/Query.js';
import { QueryBody, ESField } from '../core/types.js';

export type MultiMatchType =
  | 'best_fields'
  | 'most_fields'
  | 'cross_fields'
  | 'phrase'
  | 'phrase_prefix'
  | 'bool_prefix';

export type MultiMatchOperator = 'and' | 'or';

export type MultiMatchZeroTerms = 'none' | 'all';

export interface MultiMatchQueryBody extends QueryBody {
  multi_match: {
    query: string;
    fields: string[];
    type?: MultiMatchType;
    operator?: MultiMatchOperator;
    minimum_should_match?: string | number;
    fuzziness?: string | number;
    prefix_length?: number;
    max_expansions?: number;
    boost?: number;
    analyzer?: string;
    tie_breaker?: number;
    zero_terms_query?: MultiMatchZeroTerms;
    cutoff_frequency?: number;
    slop?: number;
  };
}

export class MultiMatchQuery extends Query<MultiMatchQueryBody> {
  constructor(query: string, fields: ESField | ESField[]) {
    const fieldsArray = Array.isArray(fields) ? fields : [fields];
    const body: MultiMatchQueryBody = {
      multi_match: {
        query,
        fields: fieldsArray
      }
    };

    super(body);
  }

  /**
   * Set query type - returns NEW instance
   */
  type(type: MultiMatchType): MultiMatchQuery {
    const operation = this._recordOperation('type', [type]);

    return this._createNew({
      multi_match: {
        ...this._body.multi_match,
        type
      }
    }, operation);
  }

  /**
   * Set operator - returns NEW instance
   */
  operator(operator: MultiMatchOperator): MultiMatchQuery {
    const operation = this._recordOperation('operator', [operator]);

    return this._createNew({
      multi_match: {
        ...this._body.multi_match,
        operator
      }
    }, operation);
  }

  /**
   * Set minimum should match - returns NEW instance
   */
  minimumShouldMatch(value: string | number): MultiMatchQuery {
    const operation = this._recordOperation('minimumShouldMatch', [value]);

    return this._createNew({
      multi_match: {
        ...this._body.multi_match,
        minimum_should_match: value
      }
    }, operation);
  }

  /**
   * Set fuzziness - returns NEW instance
   */
  fuzziness(fuzziness: string | number): MultiMatchQuery {
    const operation = this._recordOperation('fuzziness', [fuzziness]);

    return this._createNew({
      multi_match: {
        ...this._body.multi_match,
        fuzziness
      }
    }, operation);
  }

  /**
   * Set boost value - returns NEW instance
   */
  boost(value: number): MultiMatchQuery {
    const operation = this._recordOperation('boost', [value]);

    return this._createNew({
      multi_match: {
        ...this._body.multi_match,
        boost: value
      }
    }, operation);
  }

  /**
   * Set analyzer - returns NEW instance
   */
  analyzer(analyzer: string): MultiMatchQuery {
    const operation = this._recordOperation('analyzer', [analyzer]);

    return this._createNew({
      multi_match: {
        ...this._body.multi_match,
        analyzer
      }
    }, operation);
  }

  /**
   * Set tie breaker for best_fields type - returns NEW instance
   */
  tieBreaker(value: number): MultiMatchQuery {
    const operation = this._recordOperation('tieBreaker', [value]);

    return this._createNew({
      multi_match: {
        ...this._body.multi_match,
        tie_breaker: value
      }
    }, operation);
  }

  /**
   * Set slop for phrase types - returns NEW instance
   */
  slop(value: number): MultiMatchQuery {
    const operation = this._recordOperation('slop', [value]);

    return this._createNew({
      multi_match: {
        ...this._body.multi_match,
        slop: value
      }
    }, operation);
  }

  /**
   * Set zero terms query behavior - returns NEW instance
   */
  zeroTermsQuery(value: MultiMatchZeroTerms): MultiMatchQuery {
    const operation = this._recordOperation('zeroTermsQuery', [value]);

    return this._createNew({
      multi_match: {
        ...this._body.multi_match,
        zero_terms_query: value
      }
    }, operation);
  }

  /**
   * Set prefix length for fuzzy matching - returns NEW instance
   */
  prefixLength(value: number): MultiMatchQuery {
    const operation = this._recordOperation('prefixLength', [value]);

    return this._createNew({
      multi_match: {
        ...this._body.multi_match,
        prefix_length: value
      }
    }, operation);
  }

  /**
   * Set max expansions for fuzzy matching - returns NEW instance
   */
  maxExpansions(value: number): MultiMatchQuery {
    const operation = this._recordOperation('maxExpansions', [value]);

    return this._createNew({
      multi_match: {
        ...this._body.multi_match,
        max_expansions: value
      }
    }, operation);
  }

  /**
   * Add more fields to search - returns NEW instance
   */
  addFields(...newFields: string[]): MultiMatchQuery {
    const operation = this._recordOperation('addFields', newFields);
    const combinedFields = [...this._body.multi_match.fields, ...newFields];

    return this._createNew({
      multi_match: {
        ...this._body.multi_match,
        fields: combinedFields
      }
    }, operation);
  }

  /**
   * Generate source code representation
   */
  toCode(): string {
    const multiMatch = this._body.multi_match;
    const operations = this._metadata.operations;

    let code = `Q.multiMatch('${multiMatch.query}', ${JSON.stringify(multiMatch.fields)})`;

    for (const op of operations) {
      switch (op.method) {
        case 'type':
          code += `\n  .type('${op.args[0]}')`;
          break;
        case 'operator':
          code += `\n  .operator('${op.args[0]}')`;
          break;
        case 'minimumShouldMatch':
          code += `\n  .minimumShouldMatch(${JSON.stringify(op.args[0])})`;
          break;
        case 'fuzziness':
          code += `\n  .fuzziness(${JSON.stringify(op.args[0])})`;
          break;
        case 'boost':
          code += `\n  .boost(${op.args[0]})`;
          break;
        case 'analyzer':
          code += `\n  .analyzer('${op.args[0]}')`;
          break;
        case 'tieBreaker':
          code += `\n  .tieBreaker(${op.args[0]})`;
          break;
        case 'slop':
          code += `\n  .slop(${op.args[0]})`;
          break;
        case 'zeroTermsQuery':
          code += `\n  .zeroTermsQuery('${op.args[0]}')`;
          break;
        case 'prefixLength':
          code += `\n  .prefixLength(${op.args[0]})`;
          break;
        case 'maxExpansions':
          code += `\n  .maxExpansions(${op.args[0]})`;
          break;
        case 'addFields':
          code += `\n  .addFields(${op.args.map(arg => JSON.stringify(arg)).join(', ')})`;
          break;
      }
    }

    return code;
  }

  /**
   * Create a new instance with updated body
   */
  clone(body?: Partial<MultiMatchQueryBody>, _metadata?: any): MultiMatchQuery {
    const newBody = body ? { ...this._body, ...body } : this._body;
    const multiMatch = newBody.multi_match;

    // Create new MultiMatchQuery with just query and fields to avoid recursion
    const newQuery = new MultiMatchQuery(multiMatch.query, multiMatch.fields);

    // Manually set the body to preserve all properties without triggering methods
    (newQuery as any)._body = Object.freeze(newQuery._deepClone(newBody));

    return newQuery;
  }

  /**
   * Get the query string
   */
  getQuery(): string {
    return this._body.multi_match.query;
  }

  /**
   * Get the fields being searched
   */
  getFields(): string[] {
    return this._body.multi_match.fields;
  }

  /**
   * Get the query type
   */
  getType(): MultiMatchType | undefined {
    return this._body.multi_match.type;
  }

  /**
   * Get the operator
   */
  getOperator(): MultiMatchOperator | undefined {
    return this._body.multi_match.operator;
  }

  /**
   * Get boost value if set
   */
  getBoost(): number | undefined {
    return this._body.multi_match.boost;
  }

  /**
   * Get fuzziness setting
   */
  getFuzziness(): string | number | undefined {
    return this._body.multi_match.fuzziness;
  }

  /**
   * Get minimum should match setting
   */
  getMinimumShouldMatch(): string | number | undefined {
    return this._body.multi_match.minimum_should_match;
  }
}