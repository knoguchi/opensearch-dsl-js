/**
 * Prefix Query - Immutable Implementation
 *
 * Matches documents that have fields containing terms with a specified prefix
 */

import { Query } from '../core/Query.js';
import { QueryBody, ESField } from '../core/types.js';

export interface PrefixQueryBody extends QueryBody {
  prefix: {
    [field: string]: string | {
      value: string;
      boost?: number;
      case_insensitive?: boolean;
      rewrite?: string;
    };
  };
}

export class PrefixQuery extends Query<PrefixQueryBody> {
  constructor(field: ESField, value: string) {
    const body: PrefixQueryBody = {
      prefix: {
        [field]: value
      }
    };

    super(body);
  }

  /**
   * Set boost value - returns NEW instance
   */
  boost(value: number): PrefixQuery {
    const operation = this._recordOperation('boost', [value]);
    const [[field, currentValue]] = Object.entries(this._body.prefix);

    const newValue = typeof currentValue === 'object' && currentValue !== null
      ? { ...currentValue, boost: value }
      : { value: currentValue, boost: value };

    return this._createNew({
      prefix: { [field]: newValue }
    }, operation);
  }

  /**
   * Set case insensitive matching - returns NEW instance
   */
  caseInsensitive(value: boolean = true): PrefixQuery {
    const operation = this._recordOperation('caseInsensitive', [value]);
    const [[field, currentValue]] = Object.entries(this._body.prefix);

    const newValue = typeof currentValue === 'object' && currentValue !== null
      ? { ...currentValue, case_insensitive: value }
      : { value: currentValue, case_insensitive: value };

    return this._createNew({
      prefix: { [field]: newValue }
    }, operation);
  }

  /**
   * Set rewrite method - returns NEW instance
   */
  rewrite(rewrite: string): PrefixQuery {
    const operation = this._recordOperation('rewrite', [rewrite]);
    const [[field, currentValue]] = Object.entries(this._body.prefix);

    const newValue = typeof currentValue === 'object' && currentValue !== null
      ? { ...currentValue, rewrite }
      : { value: currentValue, rewrite };

    return this._createNew({
      prefix: { [field]: newValue }
    }, operation);
  }

  /**
   * Generate source code representation
   */
  toCode(): string {
    const [[field, value]] = Object.entries(this._body.prefix);
    const operations = this._metadata.operations;

    let code = `Q.prefix('${field}', ${JSON.stringify(this._getBaseValue(value))})`;

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
  clone(body?: Partial<PrefixQueryBody>, _metadata?: any): PrefixQuery {
    const newBody = body ? { ...this._body, ...body } : this._body;
    const [[field, value]] = Object.entries(newBody.prefix);

    // Create new PrefixQuery with just field and base value to avoid recursion
    const baseValue = this._getBaseValue(value);
    const newQuery = new PrefixQuery(field, baseValue);

    // Manually set the body to preserve all properties without triggering methods
    (newQuery as any)._body = Object.freeze(newQuery._deepClone(newBody));

    return newQuery;
  }

  /**
   * Get the field name for this prefix query
   */
  getField(): string {
    return Object.keys(this._body.prefix)[0];
  }

  /**
   * Get the prefix value for this query
   */
  getPrefix(): string {
    const value = Object.values(this._body.prefix)[0];
    return this._getBaseValue(value);
  }

  /**
   * Get boost value if set
   */
  getBoost(): number | undefined {
    const value = Object.values(this._body.prefix)[0];
    if (typeof value === 'object' && value !== null && 'boost' in value) {
      return value.boost as number;
    }
    return undefined;
  }

  /**
   * Check if case insensitive is enabled
   */
  isCaseInsensitive(): boolean {
    const value = Object.values(this._body.prefix)[0];
    if (typeof value === 'object' && value !== null && 'case_insensitive' in value) {
      return value.case_insensitive as boolean;
    }
    return false;
  }

  /**
   * Get rewrite method if set
   */
  getRewrite(): string | undefined {
    const value = Object.values(this._body.prefix)[0];
    if (typeof value === 'object' && value !== null && 'rewrite' in value) {
      return value.rewrite as string;
    }
    return undefined;
  }

  /**
   * Extract base value from prefix value (handles both simple and object forms)
   */
  private _getBaseValue(value: any): string {
    if (typeof value === 'object' && value !== null && 'value' in value) {
      return value.value;
    }
    return value;
  }
}