/**
 * Boosting Query - Immutable Implementation
 *
 * Returns documents matching a positive query but reduces the relevance score
 * of documents that also match a negative query.
 */

import { Query } from '../core/Query.js';
import { QueryBody } from '../core/types.js';

export interface BoostingQueryBody extends QueryBody {
  boosting: {
    positive: any;
    negative: any;
    negative_boost: number;
  };
}

export class BoostingQuery extends Query<BoostingQueryBody> {
  constructor(positive: Query, negative: Query, negativeBoost: number = 0.2) {
    const body: BoostingQueryBody = {
      boosting: {
        positive: positive.toJSON(),
        negative: negative.toJSON(),
        negative_boost: negativeBoost
      }
    };

    super(body);
  }

  /**
   * Set positive query - returns NEW instance
   */
  positive(query: Query): BoostingQuery {
    const operation = this._recordOperation('positive', [query]);

    return this._createNew({
      boosting: {
        ...this._body.boosting,
        positive: query.toJSON()
      }
    }, operation);
  }

  /**
   * Set negative query - returns NEW instance
   */
  negative(query: Query): BoostingQuery {
    const operation = this._recordOperation('negative', [query]);

    return this._createNew({
      boosting: {
        ...this._body.boosting,
        negative: query.toJSON()
      }
    }, operation);
  }

  /**
   * Set negative boost value - returns NEW instance
   */
  negativeBoost(value: number): BoostingQuery {
    if (value < 0 || value > 1) {
      throw new Error('Negative boost must be between 0 and 1');
    }

    const operation = this._recordOperation('negativeBoost', [value]);

    return this._createNew({
      boosting: {
        ...this._body.boosting,
        negative_boost: value
      }
    }, operation);
  }

  /**
   * Generate source code representation
   */
  toCode(): string {
    const operations = this._metadata.operations;
    if (operations.length === 0) {
      return `Q.boosting(/* positive */, /* negative */, ${this._body.boosting.negative_boost})`;
    }

    let code = `Q.boosting(/* positive */, /* negative */, ${this._body.boosting.negative_boost})`;
    for (const op of operations) {
      switch (op.method) {
        case 'positive':
        case 'negative':
          code += `\n  .${op.method}(/* ${op.args[0]._id} */)`;
          break;
        case 'negativeBoost':
          code += `\n  .negativeBoost(${op.args[0]})`;
          break;
      }
    }

    return code;
  }

  /**
   * Create a new instance with updated body
   */
  clone(body?: Partial<BoostingQueryBody>, _metadata?: any): BoostingQuery {
    const newBody = body ? { ...this._body, ...body } : this._body;
    const positive = this._body.boosting.positive;
    const negative = this._body.boosting.negative;
    const negativeBoost = newBody.boosting?.negative_boost || this._body.boosting.negative_boost;

    // Create temporary Query instances for constructor
    const tempPositive = new (class extends Query<any> {
      toJSON() { return positive; }
      toCode() { return '/* positive */'; }
      clone() { return this; }
    })({});

    const tempNegative = new (class extends Query<any> {
      toJSON() { return negative; }
      toCode() { return '/* negative */'; }
      clone() { return this; }
    })({});

    return new BoostingQuery(tempPositive, tempNegative, negativeBoost);
  }

  /**
   * Get positive query for debugging
   */
  getPositive(): any {
    return this._body.boosting.positive;
  }

  /**
   * Get negative query for debugging
   */
  getNegative(): any {
    return this._body.boosting.negative;
  }

  /**
   * Get negative boost value for debugging
   */
  getNegativeBoost(): number {
    return this._body.boosting.negative_boost;
  }
}