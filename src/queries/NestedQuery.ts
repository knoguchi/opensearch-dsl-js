/**
 * Nested Query - Immutable Implementation
 *
 * Wraps another query to search nested field objects.
 */

import { Query } from '../core/Query.js';
import { QueryBody, ESField } from '../core/types.js';

export interface NestedQueryBody extends QueryBody {
  nested: {
    path: string;
    query: any;
    score_mode?: 'avg' | 'sum' | 'min' | 'max' | 'none';
    boost?: number;
    ignore_unmapped?: boolean;
    inner_hits?: {
      name?: string;
      size?: number;
      from?: number;
      sort?: any[];
      _source?: boolean | string | string[];
      highlight?: any;
    };
  };
}

export class NestedQuery extends Query<NestedQueryBody> {
  constructor(path: ESField, query: Query) {
    const body: NestedQueryBody = {
      nested: {
        path: path as string,
        query: query.toJSON()
      }
    };

    super(body);
  }

  /**
   * Set nested path - returns NEW instance
   */
  path(path: ESField): NestedQuery {
    const operation = this._recordOperation('path', [path]);

    return this._createNew({
      nested: {
        ...this._body.nested,
        path: path as string
      }
    }, operation);
  }

  /**
   * Set query - returns NEW instance
   */
  query(query: Query): NestedQuery {
    const operation = this._recordOperation('query', [query]);

    return this._createNew({
      nested: {
        ...this._body.nested,
        query: query.toJSON()
      }
    }, operation);
  }

  /**
   * Set score mode - returns NEW instance
   */
  scoreMode(mode: 'avg' | 'sum' | 'min' | 'max' | 'none'): NestedQuery {
    const operation = this._recordOperation('scoreMode', [mode]);

    return this._createNew({
      nested: {
        ...this._body.nested,
        score_mode: mode
      }
    }, operation);
  }

  /**
   * Set boost value - returns NEW instance
   */
  boost(value: number): NestedQuery {
    const operation = this._recordOperation('boost', [value]);

    return this._createNew({
      nested: {
        ...this._body.nested,
        boost: value
      }
    }, operation);
  }

  /**
   * Set ignore unmapped - returns NEW instance
   */
  ignoreUnmapped(ignore: boolean = true): NestedQuery {
    const operation = this._recordOperation('ignoreUnmapped', [ignore]);

    return this._createNew({
      nested: {
        ...this._body.nested,
        ignore_unmapped: ignore
      }
    }, operation);
  }

  /**
   * Set inner hits configuration - returns NEW instance
   */
  innerHits(config: {
    name?: string;
    size?: number;
    from?: number;
    sort?: any[];
    _source?: boolean | string | string[];
    highlight?: any;
  }): NestedQuery {
    const operation = this._recordOperation('innerHits', [config]);

    return this._createNew({
      nested: {
        ...this._body.nested,
        inner_hits: config
      }
    }, operation);
  }

  /**
   * Generate source code representation
   */
  toCode(): string {
    const operations = this._metadata.operations;
    if (operations.length === 0) {
      return `Q.nested('${this._body.nested.path}', /* query */)`;
    }

    let code = `Q.nested('${this._body.nested.path}', /* query */)`;
    for (const op of operations) {
      switch (op.method) {
        case 'path':
          code += `\n  .path('${op.args[0]}')`;
          break;
        case 'query':
          code += `\n  .query(/* ${op.args[0]._id} */)`;
          break;
        case 'scoreMode':
          code += `\n  .scoreMode('${op.args[0]}')`;
          break;
        case 'boost':
          code += `\n  .boost(${op.args[0]})`;
          break;
        case 'ignoreUnmapped':
          code += `\n  .ignoreUnmapped(${op.args[0]})`;
          break;
        case 'innerHits':
          code += `\n  .innerHits(${JSON.stringify(op.args[0])})`;
          break;
      }
    }

    return code;
  }

  /**
   * Create a new instance with updated body
   */
  clone(body?: Partial<NestedQueryBody>, _metadata?: any): NestedQuery {
    const newBody = body ? { ...this._body, ...body } : this._body;
    const path = newBody.nested?.path || this._body.nested.path;
    const query = this._body.nested.query;

    // Create temporary Query instance for constructor
    const tempQuery = new (class extends Query<any> {
      toJSON() { return query; }
      toCode() { return '/* query */'; }
      clone() { return this; }
    })({});

    return new NestedQuery(path, tempQuery);
  }

  /**
   * Get path for debugging
   */
  getPath(): string {
    return this._body.nested.path;
  }

  /**
   * Get query for debugging
   */
  getQuery(): any {
    return this._body.nested.query;
  }

  /**
   * Get score mode for debugging
   */
  getScoreMode(): string | undefined {
    return this._body.nested.score_mode;
  }

  /**
   * Get boost value for debugging
   */
  getBoost(): number | undefined {
    return this._body.nested.boost;
  }

  /**
   * Get ignore unmapped setting for debugging
   */
  getIgnoreUnmapped(): boolean | undefined {
    return this._body.nested.ignore_unmapped;
  }

  /**
   * Get inner hits configuration for debugging
   */
  getInnerHits(): any {
    return this._body.nested.inner_hits;
  }
}