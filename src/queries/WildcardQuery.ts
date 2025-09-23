/**
 * Wildcard Query - Immutable Implementation
 *
 * Matches documents that have fields matching a wildcard expression
 * Uses * for multiple characters and ? for single character
 */

import { Query } from '../core/Query.js';
import { QueryBody, ESField } from '../core/types.js';

export interface WildcardQueryBody extends QueryBody {
  wildcard: {
    [field: string]: string | {
      value: string;
      boost?: number;
      case_insensitive?: boolean;
      rewrite?: string;
    };
  };
}

export class WildcardQuery extends Query<WildcardQueryBody> {
  constructor(field: ESField, pattern: string) {
    const body: WildcardQueryBody = {
      wildcard: {
        [field]: pattern
      }
    };

    super(body);
  }

  /**
   * Set boost value - returns NEW instance
   */
  boost(value: number): WildcardQuery {
    const operation = this._recordOperation('boost', [value]);
    const [[field, currentValue]] = Object.entries(this._body.wildcard);

    const newValue = typeof currentValue === 'object' && currentValue !== null
      ? { ...currentValue, boost: value }
      : { value: currentValue, boost: value };

    return this._createNew({
      wildcard: { [field]: newValue }
    }, operation);
  }

  /**
   * Set case insensitive matching - returns NEW instance
   */
  caseInsensitive(value: boolean = true): WildcardQuery {
    const operation = this._recordOperation('caseInsensitive', [value]);
    const [[field, currentValue]] = Object.entries(this._body.wildcard);

    const newValue = typeof currentValue === 'object' && currentValue !== null
      ? { ...currentValue, case_insensitive: value }
      : { value: currentValue, case_insensitive: value };

    return this._createNew({
      wildcard: { [field]: newValue }
    }, operation);
  }

  /**
   * Set rewrite method - returns NEW instance
   */
  rewrite(rewrite: string): WildcardQuery {
    const operation = this._recordOperation('rewrite', [rewrite]);
    const [[field, currentValue]] = Object.entries(this._body.wildcard);

    const newValue = typeof currentValue === 'object' && currentValue !== null
      ? { ...currentValue, rewrite }
      : { value: currentValue, rewrite };

    return this._createNew({
      wildcard: { [field]: newValue }
    }, operation);
  }

  /**
   * Generate source code representation
   */
  toCode(): string {
    const [[field, value]] = Object.entries(this._body.wildcard);
    const operations = this._metadata.operations;

    let code = `Q.wildcard('${field}', ${JSON.stringify(this._getBaseValue(value))})`;

    for (const op of operations) {
      switch (op.method) {
        case 'boost':
          code += `\n  .boost(${op.args[0]})`;
          break;
        case 'caseInsensitive':
          code += `\n  .caseInsensitive(${op.args[0]})`;
          break;
        case 'rewrite':
          code += `\n  .rewrite('${op.args[0]}')`;
          break;
      }
    }

    return code;
  }

  /**
   * Create a new instance with updated body
   */
  clone(body?: Partial<WildcardQueryBody>, _metadata?: any): WildcardQuery {
    const newBody = body ? { ...this._body, ...body } : this._body;
    const [[field, value]] = Object.entries(newBody.wildcard);

    // Create new WildcardQuery with just field and base value to avoid recursion
    const baseValue = this._getBaseValue(value);
    const newQuery = new WildcardQuery(field, baseValue);

    // Manually set the body to preserve all properties without triggering methods
    (newQuery as any)._body = Object.freeze(newQuery._deepClone(newBody));

    return newQuery;
  }

  /**
   * Get the field name for this wildcard query
   */
  getField(): string {
    return Object.keys(this._body.wildcard)[0];
  }

  /**
   * Get the pattern for this wildcard query
   */
  getPattern(): string {
    const value = Object.values(this._body.wildcard)[0];
    return this._getBaseValue(value);
  }

  /**
   * Get boost value if set
   */
  getBoost(): number | undefined {
    const value = Object.values(this._body.wildcard)[0];
    if (typeof value === 'object' && value !== null && 'boost' in value) {
      return value.boost as number;
    }
    return undefined;
  }

  /**
   * Check if case insensitive is enabled
   */
  isCaseInsensitive(): boolean {
    const value = Object.values(this._body.wildcard)[0];
    if (typeof value === 'object' && value !== null && 'case_insensitive' in value) {
      return value.case_insensitive as boolean;
    }
    return false;
  }

  /**
   * Get rewrite method if set
   */
  getRewrite(): string | undefined {
    const value = Object.values(this._body.wildcard)[0];
    if (typeof value === 'object' && value !== null && 'rewrite' in value) {
      return value.rewrite as string;
    }
    return undefined;
  }

  /**
   * Extract base value from wildcard value (handles both simple and object forms)
   */
  private _getBaseValue(value: any): string {
    if (typeof value === 'object' && value !== null && 'value' in value) {
      return value.value;
    }
    return value;
  }
}