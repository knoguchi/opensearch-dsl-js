/**
 * Disjunction Max Query - Immutable Implementation
 *
 * Returns documents matching one or more queries. Unlike bool query,
 * it uses the score from the best matching query and optionally adds
 * a tie-breaker score from other matching queries.
 */

import { Query } from '../core/Query.js';
import { QueryBody } from '../core/types.js';

export interface DisMaxQueryBody extends QueryBody {
  dis_max: {
    queries: any[];
    tie_breaker?: number;
    boost?: number;
  };
}

export class DisMaxQuery extends Query<DisMaxQueryBody> {
  constructor(queries: Query[] = []) {
    const body: DisMaxQueryBody = {
      dis_max: {
        queries: queries.map(q => q.toJSON())
      }
    };

    super(body);
  }

  /**
   * Set queries array - returns NEW instance
   */
  queries(queries: Query[]): DisMaxQuery {
    const operation = this._recordOperation('queries', [queries]);

    return this._createNew({
      dis_max: {
        ...this._body.dis_max,
        queries: queries.map(q => q.toJSON())
      }
    }, operation);
  }

  /**
   * Add query to existing queries - returns NEW instance
   */
  query(query: Query): DisMaxQuery {
    const operation = this._recordOperation('query', [query]);
    const currentQueries = this._body.dis_max.queries;

    return this._createNew({
      dis_max: {
        ...this._body.dis_max,
        queries: [...currentQueries, query.toJSON()]
      }
    }, operation);
  }

  /**
   * Add multiple queries to existing queries - returns NEW instance
   */
  addQueries(...queries: Query[]): DisMaxQuery {
    const operation = this._recordOperation('addQueries', queries);
    const currentQueries = this._body.dis_max.queries;

    return this._createNew({
      dis_max: {
        ...this._body.dis_max,
        queries: [...currentQueries, ...queries.map(q => q.toJSON())]
      }
    }, operation);
  }

  /**
   * Set tie breaker value - returns NEW instance
   */
  tieBreaker(value: number): DisMaxQuery {
    if (value < 0 || value > 1) {
      throw new Error('Tie breaker must be between 0 and 1');
    }

    const operation = this._recordOperation('tieBreaker', [value]);

    return this._createNew({
      dis_max: {
        ...this._body.dis_max,
        tie_breaker: value
      }
    }, operation);
  }

  /**
   * Set boost value - returns NEW instance
   */
  boost(value: number): DisMaxQuery {
    const operation = this._recordOperation('boost', [value]);

    return this._createNew({
      dis_max: {
        ...this._body.dis_max,
        boost: value
      }
    }, operation);
  }

  /**
   * Generate source code representation
   */
  toCode(): string {
    const operations = this._metadata.operations;
    const queryCount = this._body.dis_max.queries.length;

    if (operations.length === 0) {
      return `Q.disMax([/* ${queryCount} queries */])`;
    }

    let code = `Q.disMax([/* ${queryCount} queries */])`;
    for (const op of operations) {
      switch (op.method) {
        case 'queries':
          code += `\n  .queries([/* ${op.args[0].length} queries */])`;
          break;
        case 'query':
          code += `\n  .query(/* ${op.args[0]._id} */)`;
          break;
        case 'addQueries':
          code += `\n  .addQueries(/* ${op.args.length} queries */)`;
          break;
        case 'tieBreaker':
        case 'boost':
          code += `\n  .${op.method}(${op.args[0]})`;
          break;
      }
    }

    return code;
  }

  /**
   * Create a new instance with updated body
   */
  clone(body?: Partial<DisMaxQueryBody>, _metadata?: any): DisMaxQuery {
    const newBody = body ? { ...this._body, ...body } : this._body;
    const queries = this._body.dis_max.queries;

    // Create temporary Query instances for constructor
    const tempQueries = queries.map(queryJson => new (class extends Query<any> {
      toJSON() { return queryJson; }
      toCode() { return '/* query */'; }
      clone() { return this; }
    })({}));

    return new DisMaxQuery(tempQueries);
  }

  /**
   * Get queries for debugging
   */
  getQueries(): any[] {
    return this._body.dis_max.queries;
  }

  /**
   * Get query count for debugging
   */
  getQueryCount(): number {
    return this._body.dis_max.queries.length;
  }

  /**
   * Get tie breaker value for debugging
   */
  getTieBreaker(): number | undefined {
    return this._body.dis_max.tie_breaker;
  }

  /**
   * Get boost value for debugging
   */
  getBoost(): number | undefined {
    return this._body.dis_max.boost;
  }

  /**
   * Check if dis_max query is empty
   */
  isEmpty(): boolean {
    return this._body.dis_max.queries.length === 0;
  }
}