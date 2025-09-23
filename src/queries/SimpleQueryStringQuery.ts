/**
 * Simple Query String Query - Immutable Implementation
 *
 * Returns documents based on a provided query string, using a simple syntax
 * that is more forgiving than the full Lucene query string syntax.
 */

import { Query } from '../core/Query.js';
import { QueryBody, ESField } from '../core/types.js';

export interface SimpleQueryStringQueryBody extends QueryBody {
  simple_query_string: {
    query: string;
    fields?: string[];
    default_operator?: 'AND' | 'OR';
    analyzer?: string;
    flags?: string;
    fuzzy_max_expansions?: number;
    fuzzy_prefix_length?: number;
    fuzzy_transpositions?: boolean;
    lenient?: boolean;
    minimum_should_match?: number | string;
    quote_field_suffix?: string;
    analyze_wildcard?: boolean;
    auto_generate_synonyms_phrase_query?: boolean;
    boost?: number;
  };
}

export class SimpleQueryStringQuery extends Query<SimpleQueryStringQueryBody> {
  constructor(query: string) {
    const body: SimpleQueryStringQueryBody = {
      simple_query_string: {
        query
      }
    };

    super(body);
  }

  /**
   * Set query string - returns NEW instance
   */
  query(query: string): SimpleQueryStringQuery {
    const operation = this._recordOperation('query', [query]);

    return this._createNew({
      simple_query_string: {
        ...this._body.simple_query_string,
        query
      }
    }, operation);
  }

  /**
   * Set fields to search - returns NEW instance
   */
  fields(fields: ESField[]): SimpleQueryStringQuery {
    const operation = this._recordOperation('fields', [fields]);

    return this._createNew({
      simple_query_string: {
        ...this._body.simple_query_string,
        fields: fields as string[]
      }
    }, operation);
  }

  /**
   * Set default operator - returns NEW instance
   */
  defaultOperator(operator: 'AND' | 'OR'): SimpleQueryStringQuery {
    const operation = this._recordOperation('defaultOperator', [operator]);

    return this._createNew({
      simple_query_string: {
        ...this._body.simple_query_string,
        default_operator: operator
      }
    }, operation);
  }

  /**
   * Set analyzer - returns NEW instance
   */
  analyzer(analyzer: string): SimpleQueryStringQuery {
    const operation = this._recordOperation('analyzer', [analyzer]);

    return this._createNew({
      simple_query_string: {
        ...this._body.simple_query_string,
        analyzer
      }
    }, operation);
  }

  /**
   * Set flags to enable/disable operators - returns NEW instance
   */
  flags(flags: string): SimpleQueryStringQuery {
    const operation = this._recordOperation('flags', [flags]);

    return this._createNew({
      simple_query_string: {
        ...this._body.simple_query_string,
        flags
      }
    }, operation);
  }

  /**
   * Set fuzzy max expansions - returns NEW instance
   */
  fuzzyMaxExpansions(max: number): SimpleQueryStringQuery {
    const operation = this._recordOperation('fuzzyMaxExpansions', [max]);

    return this._createNew({
      simple_query_string: {
        ...this._body.simple_query_string,
        fuzzy_max_expansions: max
      }
    }, operation);
  }

  /**
   * Set fuzzy prefix length - returns NEW instance
   */
  fuzzyPrefixLength(length: number): SimpleQueryStringQuery {
    const operation = this._recordOperation('fuzzyPrefixLength', [length]);

    return this._createNew({
      simple_query_string: {
        ...this._body.simple_query_string,
        fuzzy_prefix_length: length
      }
    }, operation);
  }

  /**
   * Set fuzzy transpositions - returns NEW instance
   */
  fuzzyTranspositions(enable: boolean = true): SimpleQueryStringQuery {
    const operation = this._recordOperation('fuzzyTranspositions', [enable]);

    return this._createNew({
      simple_query_string: {
        ...this._body.simple_query_string,
        fuzzy_transpositions: enable
      }
    }, operation);
  }

  /**
   * Set lenient parsing - returns NEW instance
   */
  lenient(value: boolean = true): SimpleQueryStringQuery {
    const operation = this._recordOperation('lenient', [value]);

    return this._createNew({
      simple_query_string: {
        ...this._body.simple_query_string,
        lenient: value
      }
    }, operation);
  }

  /**
   * Set minimum should match - returns NEW instance
   */
  minimumShouldMatch(value: number | string): SimpleQueryStringQuery {
    const operation = this._recordOperation('minimumShouldMatch', [value]);

    return this._createNew({
      simple_query_string: {
        ...this._body.simple_query_string,
        minimum_should_match: value
      }
    }, operation);
  }

  /**
   * Set quote field suffix - returns NEW instance
   */
  quoteFieldSuffix(suffix: string): SimpleQueryStringQuery {
    const operation = this._recordOperation('quoteFieldSuffix', [suffix]);

    return this._createNew({
      simple_query_string: {
        ...this._body.simple_query_string,
        quote_field_suffix: suffix
      }
    }, operation);
  }

  /**
   * Set analyze wildcard - returns NEW instance
   */
  analyzeWildcard(value: boolean = true): SimpleQueryStringQuery {
    const operation = this._recordOperation('analyzeWildcard', [value]);

    return this._createNew({
      simple_query_string: {
        ...this._body.simple_query_string,
        analyze_wildcard: value
      }
    }, operation);
  }

  /**
   * Set auto generate synonyms phrase query - returns NEW instance
   */
  autoGenerateSynonymsPhraseQuery(value: boolean = true): SimpleQueryStringQuery {
    const operation = this._recordOperation('autoGenerateSynonymsPhraseQuery', [value]);

    return this._createNew({
      simple_query_string: {
        ...this._body.simple_query_string,
        auto_generate_synonyms_phrase_query: value
      }
    }, operation);
  }

  /**
   * Set boost value - returns NEW instance
   */
  boost(value: number): SimpleQueryStringQuery {
    const operation = this._recordOperation('boost', [value]);

    return this._createNew({
      simple_query_string: {
        ...this._body.simple_query_string,
        boost: value
      }
    }, operation);
  }

  /**
   * Generate source code representation
   */
  toCode(): string {
    const operations = this._metadata.operations;
    if (operations.length === 0) {
      return `Q.simpleQueryString('${this._body.simple_query_string.query}')`;
    }

    let code = `Q.simpleQueryString('${this._body.simple_query_string.query}')`;
    for (const op of operations) {
      switch (op.method) {
        case 'query':
          code += `\n  .query('${op.args[0]}')`;
          break;
        case 'fields':
          code += `\n  .fields(${JSON.stringify(op.args[0])})`;
          break;
        case 'defaultOperator':
          code += `\n  .defaultOperator('${op.args[0]}')`;
          break;
        case 'analyzer':
        case 'flags':
        case 'quoteFieldSuffix':
          code += `\n  .${op.method}('${op.args[0]}')`;
          break;
        case 'fuzzyMaxExpansions':
        case 'fuzzyPrefixLength':
        case 'boost':
        case 'minimumShouldMatch':
          code += `\n  .${op.method}(${op.args[0]})`;
          break;
        case 'fuzzyTranspositions':
        case 'lenient':
        case 'analyzeWildcard':
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
  clone(body?: Partial<SimpleQueryStringQueryBody>, _metadata?: any): SimpleQueryStringQuery {
    const newBody = body ? { ...this._body, ...body } : this._body;
    const query = newBody.simple_query_string?.query || this._body.simple_query_string.query;

    return new SimpleQueryStringQuery(query);
  }

  /**
   * Get query string for debugging
   */
  getQuery(): string {
    return this._body.simple_query_string.query;
  }

  /**
   * Get fields for debugging
   */
  getFields(): string[] | undefined {
    return this._body.simple_query_string.fields;
  }

  /**
   * Get boost value for debugging
   */
  getBoost(): number | undefined {
    return this._body.simple_query_string.boost;
  }
}