/**
 * Match Phrase Query - Immutable Implementation
 *
 * Matches documents containing a specific phrase in the specified order
 */

import { Query } from '../core/Query.js';
import { QueryBody, ESField } from '../core/types.js';

export interface MatchPhraseQueryBody extends QueryBody {
  match_phrase: {
    [field: string]: string | {
      query: string;
      slop?: number;
      boost?: number;
      analyzer?: string;
      zero_terms_query?: 'none' | 'all';
    };
  };
}

export class MatchPhraseQuery extends Query<MatchPhraseQueryBody> {
  constructor(field: ESField, phrase: string) {
    const body: MatchPhraseQueryBody = {
      match_phrase: {
        [field]: phrase
      }
    };

    super(body);
  }

  /**
   * Set boost value - returns NEW instance
   */
  boost(value: number): MatchPhraseQuery {
    const operation = this._recordOperation('boost', [value]);
    const [[field, currentValue]] = Object.entries(this._body.match_phrase);

    const newValue = typeof currentValue === 'object' && currentValue !== null
      ? { ...currentValue, boost: value }
      : { query: currentValue, boost: value };

    return this._createNew({
      match_phrase: { [field]: newValue }
    }, operation);
  }

  /**
   * Set slop (word distance tolerance) - returns NEW instance
   */
  slop(value: number): MatchPhraseQuery {
    const operation = this._recordOperation('slop', [value]);
    const [[field, currentValue]] = Object.entries(this._body.match_phrase);

    const newValue = typeof currentValue === 'object' && currentValue !== null
      ? { ...currentValue, slop: value }
      : { query: currentValue, slop: value };

    return this._createNew({
      match_phrase: { [field]: newValue }
    }, operation);
  }

  /**
   * Set analyzer - returns NEW instance
   */
  analyzer(analyzer: string): MatchPhraseQuery {
    const operation = this._recordOperation('analyzer', [analyzer]);
    const [[field, currentValue]] = Object.entries(this._body.match_phrase);

    const newValue = typeof currentValue === 'object' && currentValue !== null
      ? { ...currentValue, analyzer }
      : { query: currentValue, analyzer };

    return this._createNew({
      match_phrase: { [field]: newValue }
    }, operation);
  }

  /**
   * Set zero terms query behavior - returns NEW instance
   */
  zeroTermsQuery(value: 'none' | 'all'): MatchPhraseQuery {
    const operation = this._recordOperation('zeroTermsQuery', [value]);
    const [[field, currentValue]] = Object.entries(this._body.match_phrase);

    const newValue = typeof currentValue === 'object' && currentValue !== null
      ? { ...currentValue, zero_terms_query: value }
      : { query: currentValue, zero_terms_query: value };

    return this._createNew({
      match_phrase: { [field]: newValue }
    }, operation);
  }

  /**
   * Generate source code representation
   */
  toCode(): string {
    const [[field, value]] = Object.entries(this._body.match_phrase);
    const operations = this._metadata.operations;

    let code = `Q.matchPhrase('${field}', ${JSON.stringify(this._getBaseValue(value))})`;

    for (const op of operations) {
      switch (op.method) {
        case 'boost':
          code += `\n  .boost(${op.args[0]})`;
          break;
        case 'slop':
          code += `\n  .slop(${op.args[0]})`;
          break;
        case 'analyzer':
          code += `\n  .analyzer('${op.args[0]}')`;
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
  clone(body?: Partial<MatchPhraseQueryBody>, _metadata?: any): MatchPhraseQuery {
    const newBody = body ? { ...this._body, ...body } : this._body;
    const [[field, value]] = Object.entries(newBody.match_phrase);

    // Create new MatchPhraseQuery with just field and base value to avoid recursion
    const baseValue = this._getBaseValue(value);
    const newQuery = new MatchPhraseQuery(field, baseValue);

    // Manually set the body to preserve all properties without triggering methods
    (newQuery as any)._body = Object.freeze(newQuery._deepClone(newBody));

    return newQuery;
  }

  /**
   * Get the field name for this match phrase query
   */
  getField(): string {
    return Object.keys(this._body.match_phrase)[0];
  }

  /**
   * Get the phrase for this query
   */
  getPhrase(): string {
    const value = Object.values(this._body.match_phrase)[0];
    return this._getBaseValue(value);
  }

  /**
   * Get boost value if set
   */
  getBoost(): number | undefined {
    const value = Object.values(this._body.match_phrase)[0];
    if (typeof value === 'object' && value !== null && 'boost' in value) {
      return value.boost as number;
    }
    return undefined;
  }

  /**
   * Get slop value if set
   */
  getSlop(): number | undefined {
    const value = Object.values(this._body.match_phrase)[0];
    if (typeof value === 'object' && value !== null && 'slop' in value) {
      return value.slop as number;
    }
    return undefined;
  }

  /**
   * Get analyzer if set
   */
  getAnalyzer(): string | undefined {
    const value = Object.values(this._body.match_phrase)[0];
    if (typeof value === 'object' && value !== null && 'analyzer' in value) {
      return value.analyzer as string;
    }
    return undefined;
  }

  /**
   * Get zero terms query setting if set
   */
  getZeroTermsQuery(): 'none' | 'all' | undefined {
    const value = Object.values(this._body.match_phrase)[0];
    if (typeof value === 'object' && value !== null && 'zero_terms_query' in value) {
      return value.zero_terms_query as 'none' | 'all';
    }
    return undefined;
  }

  /**
   * Extract base value from match phrase value (handles both simple and object forms)
   */
  private _getBaseValue(value: any): string {
    if (typeof value === 'object' && value !== null && 'query' in value) {
      return value.query;
    }
    return value;
  }
}