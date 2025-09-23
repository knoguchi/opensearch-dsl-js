/**
 * Exists Query - Immutable Implementation
 *
 * Matches documents that have at least one non-null value in the original field
 */

import { Query } from '../core/Query.js';
import { QueryBody, ESField } from '../core/types.js';

export interface ExistsQueryBody extends QueryBody {
  exists: {
    field: string;
    boost?: number;
  };
}

export class ExistsQuery extends Query<ExistsQueryBody> {
  constructor(field: ESField) {
    const body: ExistsQueryBody = {
      exists: {
        field
      }
    };

    super(body);
  }

  /**
   * Set boost value - returns NEW instance
   */
  boost(value: number): ExistsQuery {
    const operation = this._recordOperation('boost', [value]);

    return this._createNew({
      exists: {
        field: this._body.exists.field,
        boost: value
      }
    }, operation);
  }

  /**
   * Generate source code representation
   */
  toCode(): string {
    const field = this._body.exists.field;
    const operations = this._metadata.operations;

    let code = `Q.exists('${field}')`;

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
  clone(body?: Partial<ExistsQueryBody>, _metadata?: any): ExistsQuery {
    const newBody = body ? { ...this._body, ...body } : this._body;
    const field = newBody.exists.field;

    // Create new ExistsQuery with just field to avoid recursion
    const newQuery = new ExistsQuery(field);

    // Manually set the body to preserve all properties without triggering methods
    (newQuery as any)._body = Object.freeze(newQuery._deepClone(newBody));

    return newQuery;
  }

  /**
   * Get the field being checked for existence
   */
  getField(): string {
    return this._body.exists.field;
  }

  /**
   * Get boost value if set
   */
  getBoost(): number | undefined {
    return this._body.exists.boost;
  }
}