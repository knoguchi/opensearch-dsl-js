/**
 * Query String Query - Immutable Implementation
 *
 * Returns documents based on a provided query string, using a parser
 * based on the Lucene query syntax.
 */

import { Query } from '../core/Query.js';
import { QueryBody, ESField } from '../core/types.js';

export interface QueryStringQueryBody extends QueryBody {
  query_string: {
    query: string;
    default_field?: string;
    fields?: string[];
    default_operator?: 'AND' | 'OR';
    analyzer?: string;
    quote_analyzer?: string;
    allow_leading_wildcard?: boolean;
    enable_position_increments?: boolean;
    fuzzy_max_expansions?: number;
    fuzziness?: string | number;
    fuzzy_prefix_length?: number;
    fuzzy_transpositions?: boolean;
    phrase_slop?: number;
    boost?: number;
    auto_generate_synonyms_phrase_query?: boolean;
    max_determinized_states?: number;
    minimum_should_match?: number | string;
    lenient?: boolean;
    time_zone?: string;
    quote_field_suffix?: string;
    analyze_wildcard?: boolean;
    escape?: boolean;
    tie_breaker?: number;
    rewrite?: string;
  };
}

export class QueryStringQuery extends Query<QueryStringQueryBody> {
  constructor(query: string) {
    const body: QueryStringQueryBody = {
      query_string: {
        query
      }
    };

    super(body);
  }

  /**
   * Set query string - returns NEW instance
   */
  query(query: string): QueryStringQuery {
    const operation = this._recordOperation('query', [query]);

    return this._createNew({
      query_string: {
        ...this._body.query_string,
        query
      }
    }, operation);
  }

  /**
   * Set default field - returns NEW instance
   */
  defaultField(field: ESField): QueryStringQuery {
    const operation = this._recordOperation('defaultField', [field]);

    return this._createNew({
      query_string: {
        ...this._body.query_string,
        default_field: field as string
      }
    }, operation);
  }

  /**
   * Set fields to search - returns NEW instance
   */
  fields(fields: ESField[]): QueryStringQuery {
    const operation = this._recordOperation('fields', [fields]);

    return this._createNew({
      query_string: {
        ...this._body.query_string,
        fields: fields as string[]
      }
    }, operation);
  }

  /**
   * Set default operator - returns NEW instance
   */
  defaultOperator(operator: 'AND' | 'OR'): QueryStringQuery {
    const operation = this._recordOperation('defaultOperator', [operator]);

    return this._createNew({
      query_string: {
        ...this._body.query_string,
        default_operator: operator
      }
    }, operation);
  }

  /**
   * Set analyzer - returns NEW instance
   */
  analyzer(analyzer: string): QueryStringQuery {
    const operation = this._recordOperation('analyzer', [analyzer]);

    return this._createNew({
      query_string: {
        ...this._body.query_string,
        analyzer
      }
    }, operation);
  }

  /**
   * Set quote analyzer - returns NEW instance
   */
  quoteAnalyzer(analyzer: string): QueryStringQuery {
    const operation = this._recordOperation('quoteAnalyzer', [analyzer]);

    return this._createNew({
      query_string: {
        ...this._body.query_string,
        quote_analyzer: analyzer
      }
    }, operation);
  }

  /**
   * Allow leading wildcard - returns NEW instance
   */
  allowLeadingWildcard(allow: boolean = true): QueryStringQuery {
    const operation = this._recordOperation('allowLeadingWildcard', [allow]);

    return this._createNew({
      query_string: {
        ...this._body.query_string,
        allow_leading_wildcard: allow
      }
    }, operation);
  }

  /**
   * Set fuzziness - returns NEW instance
   */
  fuzziness(value: string | number): QueryStringQuery {
    const operation = this._recordOperation('fuzziness', [value]);

    return this._createNew({
      query_string: {
        ...this._body.query_string,
        fuzziness: value
      }
    }, operation);
  }

  /**
   * Set phrase slop - returns NEW instance
   */
  phraseSlop(slop: number): QueryStringQuery {
    const operation = this._recordOperation('phraseSlop', [slop]);

    return this._createNew({
      query_string: {
        ...this._body.query_string,
        phrase_slop: slop
      }
    }, operation);
  }

  /**
   * Set boost value - returns NEW instance
   */
  boost(value: number): QueryStringQuery {
    const operation = this._recordOperation('boost', [value]);

    return this._createNew({
      query_string: {
        ...this._body.query_string,
        boost: value
      }
    }, operation);
  }

  /**
   * Set minimum should match - returns NEW instance
   */
  minimumShouldMatch(value: number | string): QueryStringQuery {
    const operation = this._recordOperation('minimumShouldMatch', [value]);

    return this._createNew({
      query_string: {
        ...this._body.query_string,
        minimum_should_match: value
      }
    }, operation);
  }

  /**
   * Set lenient parsing - returns NEW instance
   */
  lenient(value: boolean = true): QueryStringQuery {
    const operation = this._recordOperation('lenient', [value]);

    return this._createNew({
      query_string: {
        ...this._body.query_string,
        lenient: value
      }
    }, operation);
  }

  /**
   * Set analyze wildcard - returns NEW instance
   */
  analyzeWildcard(value: boolean = true): QueryStringQuery {
    const operation = this._recordOperation('analyzeWildcard', [value]);

    return this._createNew({
      query_string: {
        ...this._body.query_string,
        analyze_wildcard: value
      }
    }, operation);
  }

  /**
   * Set tie breaker - returns NEW instance
   */
  tieBreaker(value: number): QueryStringQuery {
    const operation = this._recordOperation('tieBreaker', [value]);

    return this._createNew({
      query_string: {
        ...this._body.query_string,
        tie_breaker: value
      }
    }, operation);
  }

  /**
   * Generate source code representation
   */
  toCode(): string {
    const operations = this._metadata.operations;
    if (operations.length === 0) {
      return `Q.queryString('${this._body.query_string.query}')`;
    }

    let code = `Q.queryString('${this._body.query_string.query}')`;
    for (const op of operations) {
      switch (op.method) {
        case 'query':
          code += `\n  .query('${op.args[0]}')`;
          break;
        case 'defaultField':
          code += `\n  .defaultField('${op.args[0]}')`;
          break;
        case 'fields':
          code += `\n  .fields(${JSON.stringify(op.args[0])})`;
          break;
        case 'defaultOperator':
          code += `\n  .defaultOperator('${op.args[0]}')`;
          break;
        case 'analyzer':
        case 'quoteAnalyzer':
          code += `\n  .${op.method}('${op.args[0]}')`;
          break;
        case 'allowLeadingWildcard':
        case 'lenient':
        case 'analyzeWildcard':
          code += `\n  .${op.method}(${op.args[0]})`;
          break;
        case 'fuzziness':
          const fuzzValue = typeof op.args[0] === 'string' ? `'${op.args[0]}'` : op.args[0];
          code += `\n  .fuzziness(${fuzzValue})`;
          break;
        case 'phraseSlop':
        case 'boost':
        case 'minimumShouldMatch':
        case 'tieBreaker':
          code += `\n  .${op.method}(${op.args[0]})`;
          break;
      }
    }

    return code;
  }

  /**
   * Create a new instance with updated body
   */
  clone(body?: Partial<QueryStringQueryBody>, _metadata?: any): QueryStringQuery {
    const newBody = body ? { ...this._body, ...body } : this._body;
    const query = newBody.query_string?.query || this._body.query_string.query;

    return new QueryStringQuery(query);
  }

  /**
   * Get query string for debugging
   */
  getQuery(): string {
    return this._body.query_string.query;
  }

  /**
   * Get default field for debugging
   */
  getDefaultField(): string | undefined {
    return this._body.query_string.default_field;
  }

  /**
   * Get fields for debugging
   */
  getFields(): string[] | undefined {
    return this._body.query_string.fields;
  }

  /**
   * Get boost value for debugging
   */
  getBoost(): number | undefined {
    return this._body.query_string.boost;
  }
}