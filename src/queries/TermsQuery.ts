/**
 * Terms Query - Immutable Implementation
 *
 * Matches documents that contain one or more exact terms in a provided field
 */

import { Query } from '../core/Query.js';
import { QueryBody, ESValue, ESField } from '../core/types.js';

export interface TermsQueryBody extends QueryBody {
  terms: {
    [field: string]: ESValue[] | {
      index: string;
      id: string;
      path: string;
    } | {
      values: ESValue[];
      boost?: number;
    };
  };
}

export class TermsQuery extends Query<TermsQueryBody> {
  constructor(field: ESField, values: ESValue[]) {
    const body: TermsQueryBody = {
      terms: {
        [field]: values
      }
    };

    super(body);
  }

  /**
   * Set boost value - returns NEW instance
   */
  boost(value: number): TermsQuery {
    const operation = this._recordOperation('boost', [value]);
    const [[field, currentValues]] = Object.entries(this._body.terms);

    const newValue = Array.isArray(currentValues)
      ? { values: currentValues, boost: value }
      : { ...currentValues, boost: value };

    return this._createNew({
      terms: { [field]: newValue }
    }, operation);
  }

  /**
   * Add more terms to the existing list - returns NEW instance
   */
  addTerms(...newTerms: ESValue[]): TermsQuery {
    const operation = this._recordOperation('addTerms', newTerms);
    const [[field, currentValues]] = Object.entries(this._body.terms);

    const existingValues = Array.isArray(currentValues)
      ? currentValues
      : (currentValues as any).values || [];

    const combinedValues = [...existingValues, ...newTerms];

    return this._createNew({
      terms: { [field]: combinedValues }
    }, operation);
  }

  /**
   * Use terms lookup from another document - returns NEW instance
   */
  lookup(index: string, id: string, path: string): TermsQuery {
    const operation = this._recordOperation('lookup', [index, id, path]);
    const [[field]] = Object.entries(this._body.terms);

    return this._createNew({
      terms: { [field]: { index, id, path } }
    }, operation);
  }

  /**
   * Generate source code representation
   */
  toCode(): string {
    const [[field, value]] = Object.entries(this._body.terms);
    const operations = this._metadata.operations;

    let values: ESValue[];
    if (Array.isArray(value)) {
      values = value;
    } else if ('values' in value) {
      values = (value as any).values;
    } else {
      // Terms lookup case
      return `Q.terms('${field}', []).lookup('${(value as any).index}', '${(value as any).id}', '${(value as any).path}')`;
    }

    let code = `Q.terms('${field}', ${JSON.stringify(values)})`;

    for (const op of operations) {
      switch (op.method) {
        case 'boost':
          code += `\n  .boost(${op.args[0]})`;
          break;
        case 'addTerms':
          code += `\n  .addTerms(${op.args.map(arg => JSON.stringify(arg)).join(', ')})`;
          break;
        case 'lookup':
          code += `\n  .lookup('${op.args[0]}', '${op.args[1]}', '${op.args[2]}')`;
          break;
      }
    }

    return code;
  }

  /**
   * Create a new instance with updated body
   */
  clone(body?: Partial<TermsQueryBody>, _metadata?: any): TermsQuery {
    const newBody = body ? { ...this._body, ...body } : this._body;
    const [[field, value]] = Object.entries(newBody.terms);

    // Create new TermsQuery with just field and base values to avoid recursion
    const baseValues = Array.isArray(value) ? value : (value as any).values || [];
    const newQuery = new TermsQuery(field, baseValues);

    // Manually set the body to preserve all properties without triggering methods
    (newQuery as any)._body = Object.freeze(newQuery._deepClone(newBody));

    return newQuery;
  }

  /**
   * Get the field name for this terms query
   */
  getField(): string {
    return Object.keys(this._body.terms)[0];
  }

  /**
   * Get the terms for this query
   */
  getTerms(): ESValue[] {
    const value = Object.values(this._body.terms)[0];

    if (Array.isArray(value)) {
      return value;
    } else if ('values' in value) {
      return (value as any).values;
    }

    return [];
  }

  /**
   * Get boost value if set
   */
  getBoost(): number | undefined {
    const value = Object.values(this._body.terms)[0];
    if (typeof value === 'object' && value !== null && 'boost' in value) {
      return (value as any).boost;
    }
    return undefined;
  }

  /**
   * Check if this query uses terms lookup
   */
  isLookup(): boolean {
    const value = Object.values(this._body.terms)[0];
    return typeof value === 'object' && value !== null && 'index' in value;
  }

  /**
   * Get lookup information if using terms lookup
   */
  getLookup(): { index: string; id: string; path: string } | undefined {
    const value = Object.values(this._body.terms)[0];
    if (this.isLookup()) {
      return value as { index: string; id: string; path: string };
    }
    return undefined;
  }
}