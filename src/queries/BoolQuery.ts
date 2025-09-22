/**
 * Boolean Query - Immutable Implementation
 * 
 * Combines multiple queries using boolean logic
 */

import { Query } from '../core/Query.js';
import { QueryBody } from '../core/types.js';

export interface BoolQueryBody extends QueryBody {
  bool: {
    must?: any[];
    should?: any[];
    filter?: any[];
    must_not?: any[];
    minimum_should_match?: number | string;
    boost?: number;
  };
}

export class BoolQuery extends Query<BoolQueryBody> {
  constructor(body?: Partial<BoolQueryBody>) {
    const defaultBody: BoolQueryBody = {
      bool: {}
    };
    
    super({ ...defaultBody, ...body });
  }

  /**
   * Add must clause(s) - returns NEW instance
   */
  must(query: Query | Query[]): BoolQuery {
    const queries = Array.isArray(query) ? query : [query];
    const currentMust = this._body.bool.must || [];
    const newMust = [...currentMust, ...queries.map(q => q.toJSON())];

    const operation = this._recordOperation('must', queries);
    
    return this._createNew({
      bool: { ...this._body.bool, must: newMust }
    }, operation);
  }

  /**
   * Add should clause(s) - returns NEW instance
   */
  should(query: Query | Query[]): BoolQuery {
    const queries = Array.isArray(query) ? query : [query];
    const currentShould = this._body.bool.should || [];
    const newShould = [...currentShould, ...queries.map(q => q.toJSON())];

    const operation = this._recordOperation('should', queries);

    return this._createNew({
      bool: { ...this._body.bool, should: newShould }
    }, operation);
  }

  /**
   * Add filter clause(s) - returns NEW instance
   */
  filter(query: Query | Query[]): BoolQuery {
    const queries = Array.isArray(query) ? query : [query];
    const currentFilter = this._body.bool.filter || [];
    const newFilter = [...currentFilter, ...queries.map(q => q.toJSON())];

    const operation = this._recordOperation('filter', queries);

    return this._createNew({
      bool: { ...this._body.bool, filter: newFilter }
    }, operation);
  }

  /**
   * Add must_not clause(s) - returns NEW instance
   */
  mustNot(query: Query | Query[]): BoolQuery {
    const queries = Array.isArray(query) ? query : [query];
    const currentMustNot = this._body.bool.must_not || [];
    const newMustNot = [...currentMustNot, ...queries.map(q => q.toJSON())];

    const operation = this._recordOperation('mustNot', queries);

    return this._createNew({
      bool: { ...this._body.bool, must_not: newMustNot }
    }, operation);
  }

  /**
   * Set minimum should match - returns NEW instance
   */
  minimumShouldMatch(value: number | string): BoolQuery {
    const operation = this._recordOperation('minimumShouldMatch', [value]);

    return this._createNew({
      bool: { ...this._body.bool, minimum_should_match: value }
    }, operation);
  }

  /**
   * Set boost value - returns NEW instance
   */
  boost(value: number): BoolQuery {
    const operation = this._recordOperation('boost', [value]);

    return this._createNew({
      bool: { ...this._body.bool, boost: value }
    }, operation);
  }

  /**
   * Generate source code representation
   */
  toCode(): string {
    const operations = this._metadata.operations;
    if (operations.length === 0) {
      return 'Q.bool()';
    }

    let code = 'Q.bool()';
    for (const op of operations) {
      switch (op.method) {
        case 'must':
        case 'should':
        case 'filter':
        case 'mustNot':
          const queries = op.args.map((arg: any) => 
            arg._type === 'Query' ? `/* ${arg._id} */` : JSON.stringify(arg)
          ).join(', ');
          code += `\n  .${op.method}(${queries})`;
          break;
        case 'minimumShouldMatch':
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
  clone(body?: Partial<BoolQueryBody>, _metadata?: any): BoolQuery {
    const newBody = body ? { ...this._body, ...body } : this._body;
    return new BoolQuery(newBody);
  }

  /**
   * Check if bool query is empty
   */
  isEmpty(): boolean {
    const bool = this._body.bool;
    return !bool.must?.length && 
           !bool.should?.length && 
           !bool.filter?.length && 
           !bool.must_not?.length;
  }

  /**
   * Get clause counts for debugging
   */
  getClauseCounts(): { must: number; should: number; filter: number; mustNot: number } {
    const bool = this._body.bool;
    return {
      must: bool.must?.length || 0,
      should: bool.should?.length || 0,
      filter: bool.filter?.length || 0,
      mustNot: bool.must_not?.length || 0
    };
  }
}