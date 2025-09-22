/**
 * Range Query - Immutable Implementation
 * 
 * Range matching for numeric, date, and string fields
 */

import { Query } from '../core/Query.js';
import { QueryBody, ESValue, ESField } from '../core/types.js';

export interface RangeQueryBody extends QueryBody {
  range: {
    [field: string]: {
      gte?: ESValue;
      gt?: ESValue;
      lte?: ESValue;
      lt?: ESValue;
      boost?: number;
      format?: string;
      time_zone?: string;
      relation?: 'INTERSECTS' | 'CONTAINS' | 'WITHIN';
    };
  };
}

export class RangeQuery extends Query<RangeQueryBody> {
  constructor(field: ESField) {
    const body: RangeQueryBody = {
      range: {
        [field]: {}
      }
    };
    
    super(body);
  }

  /**
   * Set greater than or equal (>=) - returns NEW instance
   */
  gte(value: ESValue): RangeQuery {
    const operation = this._recordOperation('gte', [value]);
    const [[field, currentRange]] = Object.entries(this._body.range);
    
    return this._createNew({
      range: { [field]: { ...currentRange, gte: value } }
    }, operation);
  }

  /**
   * Set greater than (>) - returns NEW instance
   */
  gt(value: ESValue): RangeQuery {
    const operation = this._recordOperation('gt', [value]);
    const [[field, currentRange]] = Object.entries(this._body.range);
    
    return this._createNew({
      range: { [field]: { ...currentRange, gt: value } }
    }, operation);
  }

  /**
   * Set less than or equal (<=) - returns NEW instance
   */
  lte(value: ESValue): RangeQuery {
    const operation = this._recordOperation('lte', [value]);
    const [[field, currentRange]] = Object.entries(this._body.range);
    
    return this._createNew({
      range: { [field]: { ...currentRange, lte: value } }
    }, operation);
  }

  /**
   * Set less than (<) - returns NEW instance
   */
  lt(value: ESValue): RangeQuery {
    const operation = this._recordOperation('lt', [value]);
    const [[field, currentRange]] = Object.entries(this._body.range);
    
    return this._createNew({
      range: { [field]: { ...currentRange, lt: value } }
    }, operation);
  }

  /**
   * Set boost value - returns NEW instance
   */
  boost(value: number): RangeQuery {
    const operation = this._recordOperation('boost', [value]);
    const [[field, currentRange]] = Object.entries(this._body.range);
    
    return this._createNew({
      range: { [field]: { ...currentRange, boost: value } }
    }, operation);
  }

  /**
   * Set date format - returns NEW instance
   */
  format(value: string): RangeQuery {
    const operation = this._recordOperation('format', [value]);
    const [[field, currentRange]] = Object.entries(this._body.range);
    
    return this._createNew({
      range: { [field]: { ...currentRange, format: value } }
    }, operation);
  }

  /**
   * Set timezone - returns NEW instance
   */
  timeZone(value: string): RangeQuery {
    const operation = this._recordOperation('timeZone', [value]);
    const [[field, currentRange]] = Object.entries(this._body.range);
    
    return this._createNew({
      range: { [field]: { ...currentRange, time_zone: value } }
    }, operation);
  }

  /**
   * Set relation for geo shapes - returns NEW instance
   */
  relation(value: 'INTERSECTS' | 'CONTAINS' | 'WITHIN'): RangeQuery {
    const operation = this._recordOperation('relation', [value]);
    const [[field, currentRange]] = Object.entries(this._body.range);
    
    return this._createNew({
      range: { [field]: { ...currentRange, relation: value } }
    }, operation);
  }

  /**
   * Convenience method to set both bounds - returns NEW instance
   */
  between(min: ESValue, max: ESValue, inclusive: boolean = true): RangeQuery {
    const operation = this._recordOperation('between', [min, max, inclusive]);
    const [[field, currentRange]] = Object.entries(this._body.range);
    
    const newRange = { ...currentRange };
    if (inclusive) {
      newRange.gte = min;
      newRange.lte = max;
    } else {
      newRange.gt = min;
      newRange.lt = max;
    }
    
    return this._createNew({
      range: { [field]: newRange }
    }, operation);
  }

  /**
   * Generate source code representation
   */
  toCode(): string {
    const [[field]] = Object.entries(this._body.range);
    const operations = this._metadata.operations;
    
    let code = `Q.range('${field}')`;
    
    for (const op of operations) {
      switch (op.method) {
        case 'gte':
        case 'gt':
        case 'lte':
        case 'lt':
        case 'boost':
          code += `\n  .${op.method}(${JSON.stringify(op.args[0])})`;
          break;
        case 'format':
        case 'timeZone':
        case 'relation':
          code += `\n  .${op.method}('${op.args[0]}')`;
          break;
        case 'between':
          code += `\n  .between(${JSON.stringify(op.args[0])}, ${JSON.stringify(op.args[1])}, ${op.args[2]})`;
          break;
      }
    }

    return code;
  }

  /**
   * Create a new instance with updated body
   */
  clone(body?: Partial<RangeQueryBody>, _metadata?: any): RangeQuery {
    const newBody = body ? { ...this._body, ...body } : this._body;
    const [[field]] = Object.entries(newBody.range);
    
    // Create new RangeQuery with just field to avoid recursion
    const newQuery = new RangeQuery(field);
    
    // Manually set the body to preserve all properties without triggering methods
    (newQuery as any)._body = Object.freeze(newQuery._deepClone(newBody));
    
    return newQuery;
  }

  /**
   * Get the field name for this range query
   */
  getField(): string {
    return Object.keys(this._body.range)[0];
  }

  /**
   * Get the range bounds
   */
  getBounds(): {
    gte?: ESValue;
    gt?: ESValue;
    lte?: ESValue;
    lt?: ESValue;
  } {
    const range = Object.values(this._body.range)[0];
    return {
      gte: range.gte,
      gt: range.gt,
      lte: range.lte,
      lt: range.lt
    };
  }

  /**
   * Check if range has any bounds set
   */
  hasBounds(): boolean {
    const bounds = this.getBounds();
    return bounds.gte !== undefined || 
           bounds.gt !== undefined || 
           bounds.lte !== undefined || 
           bounds.lt !== undefined;
  }

  /**
   * Get a human-readable description of the range
   */
  describe(): string {
    const field = this.getField();
    const bounds = this.getBounds();
    const parts: string[] = [];

    if (bounds.gte !== undefined) parts.push(`${field} >= ${bounds.gte}`);
    if (bounds.gt !== undefined) parts.push(`${field} > ${bounds.gt}`);
    if (bounds.lte !== undefined) parts.push(`${field} <= ${bounds.lte}`);
    if (bounds.lt !== undefined) parts.push(`${field} < ${bounds.lt}`);

    return parts.join(' AND ') || `${field} (no bounds)`;
  }
}