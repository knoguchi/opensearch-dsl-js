/**
 * Match All Query - Immutable Implementation
 *
 * Matches all documents in the index
 */

import { Query } from '../core/Query.js';
import { QueryBody } from '../core/types.js';

export interface MatchAllQueryBody extends QueryBody {
  match_all: {
    boost?: number;
  };
}

export class MatchAllQuery extends Query<MatchAllQueryBody> {
  constructor() {
    const body: MatchAllQueryBody = {
      match_all: {}
    };

    super(body);
  }

  /**
   * Set boost value - returns NEW instance
   */
  boost(value: number): MatchAllQuery {
    const operation = this._recordOperation('boost', [value]);

    return this._createNew({
      match_all: {
        boost: value
      }
    }, operation);
  }

  /**
   * Generate source code representation
   */
  toCode(): string {
    const operations = this._metadata.operations;

    let code = 'Q.matchAll()';

    for (const op of operations) {
      switch (op.method) {
        case 'boost':
          code += `\n  .boost(${op.args[0]})`;
          break;
      }
    }

    return code;
  }

  /**
   * Create a new instance with updated body
   */
  clone(body?: Partial<MatchAllQueryBody>, _metadata?: any): MatchAllQuery {
    const newBody = body ? { ...this._body, ...body } : this._body;

    // Create new MatchAllQuery to avoid recursion
    const newQuery = new MatchAllQuery();

    // Manually set the body to preserve all properties without triggering methods
    (newQuery as any)._body = Object.freeze(newQuery._deepClone(newBody));

    return newQuery;
  }

  /**
   * Get boost value if set
   */
  getBoost(): number | undefined {
    return this._body.match_all.boost;
  }

  /**
   * Check if this query has any configuration
   */
  isEmpty(): boolean {
    return Object.keys(this._body.match_all).length === 0;
  }
}