/**
 * Term Query - Immutable Implementation
 * 
 * Exact value matching for structured data
 */

import { Query } from '../core/Query.js';
import { QueryBody, ESValue, ESField } from '../core/types.js';

export interface TermQueryBody extends QueryBody {
  term: {
    [field: string]: ESValue | {
      value: ESValue;
      boost?: number;
      case_insensitive?: boolean;
    };
  };
}

export class TermQuery extends Query<TermQueryBody> {
  constructor(field: ESField, value: ESValue) {
    const body: TermQueryBody = {
      term: {
        [field]: value
      }
    };
    
    super(body);
  }

  /**
   * Set boost value - returns NEW instance
   */
  boost(value: number): TermQuery {
    const operation = this._recordOperation('boost', [value]);
    const [[field, currentValue]] = Object.entries(this._body.term);
    
    const newValue = typeof currentValue === 'object' && currentValue !== null
      ? { ...currentValue, boost: value }
      : { value: currentValue, boost: value };

    return this._createNew({
      term: { [field]: newValue }
    }, operation);
  }

  /**
   * Set case insensitive matching - returns NEW instance
   */
  caseInsensitive(value: boolean = true): TermQuery {
    const operation = this._recordOperation('caseInsensitive', [value]);
    const [[field, currentValue]] = Object.entries(this._body.term);
    
    const newValue = typeof currentValue === 'object' && currentValue !== null
      ? { ...currentValue, case_insensitive: value }
      : { value: currentValue, case_insensitive: value };

    return this._createNew({
      term: { [field]: newValue }
    }, operation);
  }

  /**
   * Generate source code representation
   */
  toCode(): string {
    const [[field, value]] = Object.entries(this._body.term);
    const operations = this._metadata.operations;
    
    let code = `Q.term('${field}', ${JSON.stringify(this._getBaseValue(value))})`;
    
    for (const op of operations) {
      switch (op.method) {
        case 'boost':
          code += `\n  .boost(${op.args[0]})`;
          break;
        case 'caseInsensitive':
          code += `\n  .caseInsensitive(${op.args[0]})`;
          break;
      }
    }

    return code;
  }

  /**
   * Create a new instance with updated body
   */
  clone(body?: Partial<TermQueryBody>, _metadata?: any): TermQuery {
    const newBody = body ? { ...this._body, ...body } : this._body;
    const [[field, value]] = Object.entries(newBody.term);
    
    // Create new TermQuery with just field and base value to avoid recursion
    const baseValue = this._getBaseValue(value);
    const newQuery = new TermQuery(field, baseValue);
    
    // Manually set the body to preserve all properties without triggering methods
    (newQuery as any)._body = Object.freeze(newQuery._deepClone(newBody));
    
    return newQuery;
  }

  /**
   * Get the field name for this term query
   */
  getField(): string {
    return Object.keys(this._body.term)[0];
  }

  /**
   * Get the value for this term query
   */
  getValue(): ESValue {
    const value = Object.values(this._body.term)[0];
    return this._getBaseValue(value);
  }

  /**
   * Get boost value if set
   */
  getBoost(): number | undefined {
    const value = Object.values(this._body.term)[0];
    if (typeof value === 'object' && value !== null && 'boost' in value) {
      return value.boost as number;
    }
    return undefined;
  }

  /**
   * Check if case insensitive is enabled
   */
  isCaseInsensitive(): boolean {
    const value = Object.values(this._body.term)[0];
    if (typeof value === 'object' && value !== null && 'case_insensitive' in value) {
      return value.case_insensitive as boolean;
    }
    return false;
  }

  /**
   * Extract base value from term value (handles both simple and object forms)
   */
  private _getBaseValue(value: any): ESValue {
    if (typeof value === 'object' && value !== null && 'value' in value) {
      return value.value;
    }
    return value;
  }
}