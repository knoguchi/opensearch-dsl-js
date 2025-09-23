/**
 * Constant Score Query - Immutable Implementation
 *
 * Wraps a filter query and returns every matching document with a relevance score
 * equal to the boost parameter value.
 */

import { Query } from '../core/Query.js';
import { QueryBody } from '../core/types.js';

export interface ConstantScoreQueryBody extends QueryBody {
  constant_score: {
    filter: any;
    boost?: number;
  };
}

export class ConstantScoreQuery extends Query<ConstantScoreQueryBody> {
  constructor(filter: Query, boost: number = 1.0) {
    const body: ConstantScoreQueryBody = {
      constant_score: {
        filter: filter.toJSON(),
        ...(boost !== 1.0 && { boost })
      }
    };

    super(body);
  }

  /**
   * Set filter query - returns NEW instance
   */
  filter(query: Query): ConstantScoreQuery {
    const operation = this._recordOperation('filter', [query]);

    return this._createNew({
      constant_score: {
        ...this._body.constant_score,
        filter: query.toJSON()
      }
    }, operation);
  }

  /**
   * Set boost value - returns NEW instance
   */
  boost(value: number): ConstantScoreQuery {
    const operation = this._recordOperation('boost', [value]);

    const newConstantScore = { ...this._body.constant_score };
    if (value === 1.0) {
      delete newConstantScore.boost;
    } else {
      newConstantScore.boost = value;
    }

    return this._createNew({
      constant_score: newConstantScore
    }, operation);
  }

  /**
   * Generate source code representation
   */
  toCode(): string {
    const operations = this._metadata.operations;
    const boost = this._body.constant_score.boost;

    if (operations.length === 0) {
      return boost && boost !== 1.0
        ? `Q.constantScore(/* filter */, ${boost})`
        : `Q.constantScore(/* filter */)`;
    }

    let code = boost && boost !== 1.0
      ? `Q.constantScore(/* filter */, ${boost})`
      : `Q.constantScore(/* filter */)`;

    for (const op of operations) {
      switch (op.method) {
        case 'filter':
          code += `\n  .filter(/* ${op.args[0]._id} */)`;
          break;
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
  clone(body?: Partial<ConstantScoreQueryBody>, _metadata?: any): ConstantScoreQuery {
    const newBody = body ? { ...this._body, ...body } : this._body;
    const filter = this._body.constant_score.filter;
    const boost = newBody.constant_score?.boost || this._body.constant_score.boost || 1.0;

    // Create temporary Query instance for constructor
    const tempFilter = new (class extends Query<any> {
      toJSON() { return filter; }
      toCode() { return '/* filter */'; }
      clone() { return this; }
    })({});

    return new ConstantScoreQuery(tempFilter, boost);
  }

  /**
   * Get filter query for debugging
   */
  getFilter(): any {
    return this._body.constant_score.filter;
  }

  /**
   * Get boost value for debugging
   */
  getBoost(): number | undefined {
    return this._body.constant_score.boost;
  }
}