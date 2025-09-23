/**
 * Regexp Query - Immutable Implementation
 *
 * Matches documents that have fields matching a regular expression.
 * Uses standard regular expression syntax for pattern matching.
 */

import { Query } from '../core/Query.js';
import { QueryBody, ESField } from '../core/types.js';

export interface RegexpQueryBody extends QueryBody {
  regexp: {
    [field: string]: string | {
      value: string;
      boost?: number;
      flags?: string;
      case_insensitive?: boolean;
      max_determinized_states?: number;
      rewrite?: string;
    };
  };
}

export class RegexpQuery extends Query<RegexpQueryBody> {
  constructor(field: ESField, pattern: string) {
    const body: RegexpQueryBody = {
      regexp: {
        [field]: pattern
      }
    };

    super(body);
  }

  /**
   * Set boost value - returns NEW instance
   */
  boost(value: number): RegexpQuery {
    const operation = this._recordOperation('boost', [value]);
    const [[field, currentValue]] = Object.entries(this._body.regexp);

    const newValue = typeof currentValue === 'object' && currentValue !== null
      ? { ...currentValue, boost: value }
      : { value: currentValue, boost: value };

    return this._createNew({
      regexp: { [field]: newValue }
    }, operation);
  }

  /**
   * Set regexp flags - returns NEW instance
   */
  flags(flags: string): RegexpQuery {
    const operation = this._recordOperation('flags', [flags]);
    const [[field, currentValue]] = Object.entries(this._body.regexp);

    const newValue = typeof currentValue === 'object' && currentValue !== null
      ? { ...currentValue, flags }
      : { value: currentValue, flags };

    return this._createNew({
      regexp: { [field]: newValue }
    }, operation);
  }

  /**
   * Set case insensitive matching - returns NEW instance
   */
  caseInsensitive(value: boolean = true): RegexpQuery {
    const operation = this._recordOperation('caseInsensitive', [value]);
    const [[field, currentValue]] = Object.entries(this._body.regexp);

    const newValue = typeof currentValue === 'object' && currentValue !== null
      ? { ...currentValue, case_insensitive: value }
      : { value: currentValue, case_insensitive: value };

    return this._createNew({
      regexp: { [field]: newValue }
    }, operation);
  }

  /**
   * Set max determinized states - returns NEW instance
   */
  maxDeterminizedStates(value: number): RegexpQuery {
    const operation = this._recordOperation('maxDeterminizedStates', [value]);
    const [[field, currentValue]] = Object.entries(this._body.regexp);

    const newValue = typeof currentValue === 'object' && currentValue !== null
      ? { ...currentValue, max_determinized_states: value }
      : { value: currentValue, max_determinized_states: value };

    return this._createNew({
      regexp: { [field]: newValue }
    }, operation);
  }

  /**
   * Set rewrite method - returns NEW instance
   */
  rewrite(rewrite: string): RegexpQuery {
    const operation = this._recordOperation('rewrite', [rewrite]);
    const [[field, currentValue]] = Object.entries(this._body.regexp);

    const newValue = typeof currentValue === 'object' && currentValue !== null
      ? { ...currentValue, rewrite }
      : { value: currentValue, rewrite };

    return this._createNew({
      regexp: { [field]: newValue }
    }, operation);
  }

  /**
   * Generate source code representation
   */
  toCode(): string {
    const [[field, value]] = Object.entries(this._body.regexp);
    const operations = this._metadata.operations;

    let code = `Q.regexp('${field}', ${JSON.stringify(this._getBaseValue(value))})`;

    for (const op of operations) {
      switch (op.method) {
        case 'boost':
          code += `\n  .boost(${op.args[0]})`;
          break;
        case 'flags':
          code += `\n  .flags('${op.args[0]}')`;
          break;
        case 'caseInsensitive':
          code += `\n  .caseInsensitive(${op.args[0]})`;
          break;
        case 'maxDeterminizedStates':
          code += `\n  .maxDeterminizedStates(${op.args[0]})`;
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
  clone(body?: Partial<RegexpQueryBody>, _metadata?: any): RegexpQuery {
    const newBody = body ? { ...this._body, ...body } : this._body;
    const [[field, value]] = Object.entries(newBody.regexp);

    // Create new RegexpQuery with just field and base value to avoid recursion
    const baseValue = this._getBaseValue(value);
    const newQuery = new RegexpQuery(field, baseValue);

    // Manually set the body to preserve all properties without triggering methods
    (newQuery as any)._body = Object.freeze(newQuery._deepClone(newBody));

    return newQuery;
  }

  /**
   * Get the field name for this regexp query
   */
  getField(): string {
    return Object.keys(this._body.regexp)[0];
  }

  /**
   * Get the pattern for this regexp query
   */
  getPattern(): string {
    const value = Object.values(this._body.regexp)[0];
    return this._getBaseValue(value);
  }

  /**
   * Get boost value if set
   */
  getBoost(): number | undefined {
    const value = Object.values(this._body.regexp)[0];
    if (typeof value === 'object' && value !== null && 'boost' in value) {
      return value.boost as number;
    }
    return undefined;
  }

  /**
   * Get flags if set
   */
  getFlags(): string | undefined {
    const value = Object.values(this._body.regexp)[0];
    if (typeof value === 'object' && value !== null && 'flags' in value) {
      return value.flags as string;
    }
    return undefined;
  }

  /**
   * Check if case insensitive is enabled
   */
  isCaseInsensitive(): boolean {
    const value = Object.values(this._body.regexp)[0];
    if (typeof value === 'object' && value !== null && 'case_insensitive' in value) {
      return value.case_insensitive as boolean;
    }
    return false;
  }

  /**
   * Get max determinized states if set
   */
  getMaxDeterminizedStates(): number | undefined {
    const value = Object.values(this._body.regexp)[0];
    if (typeof value === 'object' && value !== null && 'max_determinized_states' in value) {
      return value.max_determinized_states as number;
    }
    return undefined;
  }

  /**
   * Get rewrite method if set
   */
  getRewrite(): string | undefined {
    const value = Object.values(this._body.regexp)[0];
    if (typeof value === 'object' && value !== null && 'rewrite' in value) {
      return value.rewrite as string;
    }
    return undefined;
  }

  /**
   * Extract base value from regexp value (handles both simple and object forms)
   */
  private _getBaseValue(value: any): string {
    if (typeof value === 'object' && value !== null && 'value' in value) {
      return value.value;
    }
    return value;
  }
}