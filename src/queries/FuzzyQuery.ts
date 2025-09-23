/**
 * Fuzzy Query - Immutable Implementation
 *
 * Matches documents containing terms similar to the search term with edit distance tolerance
 */

import { Query } from '../core/Query.js';
import { QueryBody, ESField, ESValue } from '../core/types.js';

export interface FuzzyQueryBody extends QueryBody {
  fuzzy: {
    [field: string]: ESValue | {
      value: ESValue;
      fuzziness?: string | number;
      max_expansions?: number;
      prefix_length?: number;
      transpositions?: boolean;
      rewrite?: string;
      boost?: number;
    };
  };
}

export class FuzzyQuery extends Query<FuzzyQueryBody> {
  constructor(field: ESField, value: ESValue) {
    const body: FuzzyQueryBody = {
      fuzzy: {
        [field]: value
      }
    };

    super(body);
  }

  /**
   * Set fuzziness (edit distance) - returns NEW instance
   */
  fuzziness(fuzziness: string | number): FuzzyQuery {
    const operation = this._recordOperation('fuzziness', [fuzziness]);
    const [[field, currentValue]] = Object.entries(this._body.fuzzy);

    const newValue = typeof currentValue === 'object' && currentValue !== null
      ? { ...currentValue, fuzziness }
      : { value: currentValue, fuzziness };

    return this._createNew({
      fuzzy: { [field]: newValue }
    }, operation);
  }

  /**
   * Set max expansions - returns NEW instance
   */
  maxExpansions(value: number): FuzzyQuery {
    const operation = this._recordOperation('maxExpansions', [value]);
    const [[field, currentValue]] = Object.entries(this._body.fuzzy);

    const newValue = typeof currentValue === 'object' && currentValue !== null
      ? { ...currentValue, max_expansions: value }
      : { value: currentValue, max_expansions: value };

    return this._createNew({
      fuzzy: { [field]: newValue }
    }, operation);
  }

  /**
   * Set prefix length - returns NEW instance
   */
  prefixLength(value: number): FuzzyQuery {
    const operation = this._recordOperation('prefixLength', [value]);
    const [[field, currentValue]] = Object.entries(this._body.fuzzy);

    const newValue = typeof currentValue === 'object' && currentValue !== null
      ? { ...currentValue, prefix_length: value }
      : { value: currentValue, prefix_length: value };

    return this._createNew({
      fuzzy: { [field]: newValue }
    }, operation);
  }

  /**
   * Set transpositions (allow character swaps) - returns NEW instance
   */
  transpositions(value: boolean): FuzzyQuery {
    const operation = this._recordOperation('transpositions', [value]);
    const [[field, currentValue]] = Object.entries(this._body.fuzzy);

    const newValue = typeof currentValue === 'object' && currentValue !== null
      ? { ...currentValue, transpositions: value }
      : { value: currentValue, transpositions: value };

    return this._createNew({
      fuzzy: { [field]: newValue }
    }, operation);
  }

  /**
   * Set rewrite method - returns NEW instance
   */
  rewrite(rewrite: string): FuzzyQuery {
    const operation = this._recordOperation('rewrite', [rewrite]);
    const [[field, currentValue]] = Object.entries(this._body.fuzzy);

    const newValue = typeof currentValue === 'object' && currentValue !== null
      ? { ...currentValue, rewrite }
      : { value: currentValue, rewrite };

    return this._createNew({
      fuzzy: { [field]: newValue }
    }, operation);
  }

  /**
   * Set boost value - returns NEW instance
   */
  boost(value: number): FuzzyQuery {
    const operation = this._recordOperation('boost', [value]);
    const [[field, currentValue]] = Object.entries(this._body.fuzzy);

    const newValue = typeof currentValue === 'object' && currentValue !== null
      ? { ...currentValue, boost: value }
      : { value: currentValue, boost: value };

    return this._createNew({
      fuzzy: { [field]: newValue }
    }, operation);
  }

  /**
   * Generate source code representation
   */
  toCode(): string {
    const [[field, value]] = Object.entries(this._body.fuzzy);
    const operations = this._metadata.operations;

    let code = `Q.fuzzy('${field}', ${JSON.stringify(this._getBaseValue(value))})`;

    for (const op of operations) {
      switch (op.method) {
        case 'fuzziness':
          code += `\n  .fuzziness(${JSON.stringify(op.args[0])})`;
          break;
        case 'maxExpansions':
          code += `\n  .maxExpansions(${op.args[0]})`;
          break;
        case 'prefixLength':
          code += `\n  .prefixLength(${op.args[0]})`;
          break;
        case 'transpositions':
          code += `\n  .transpositions(${op.args[0]})`;
          break;
        case 'rewrite':
          code += `\n  .rewrite('${op.args[0]}')`;
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
  clone(body?: Partial<FuzzyQueryBody>, _metadata?: any): FuzzyQuery {
    const newBody = body ? { ...this._body, ...body } : this._body;
    const [[field, value]] = Object.entries(newBody.fuzzy);

    // Create new FuzzyQuery with just field and base value to avoid recursion
    const baseValue = this._getBaseValue(value);
    const newQuery = new FuzzyQuery(field, baseValue);

    // Manually set the body to preserve all properties without triggering methods
    (newQuery as any)._body = Object.freeze(newQuery._deepClone(newBody));

    return newQuery;
  }

  /**
   * Get the field name for this fuzzy query
   */
  getField(): string {
    return Object.keys(this._body.fuzzy)[0];
  }

  /**
   * Get the value for this fuzzy query
   */
  getValue(): ESValue {
    const value = Object.values(this._body.fuzzy)[0];
    return this._getBaseValue(value);
  }

  /**
   * Get fuzziness setting
   */
  getFuzziness(): string | number | undefined {
    const value = Object.values(this._body.fuzzy)[0];
    if (typeof value === 'object' && value !== null && 'fuzziness' in value) {
      return value.fuzziness as string | number;
    }
    return undefined;
  }

  /**
   * Get max expansions setting
   */
  getMaxExpansions(): number | undefined {
    const value = Object.values(this._body.fuzzy)[0];
    if (typeof value === 'object' && value !== null && 'max_expansions' in value) {
      return value.max_expansions as number;
    }
    return undefined;
  }

  /**
   * Get prefix length setting
   */
  getPrefixLength(): number | undefined {
    const value = Object.values(this._body.fuzzy)[0];
    if (typeof value === 'object' && value !== null && 'prefix_length' in value) {
      return value.prefix_length as number;
    }
    return undefined;
  }

  /**
   * Get transpositions setting
   */
  getTranspositions(): boolean | undefined {
    const value = Object.values(this._body.fuzzy)[0];
    if (typeof value === 'object' && value !== null && 'transpositions' in value) {
      return value.transpositions as boolean;
    }
    return undefined;
  }

  /**
   * Get boost value if set
   */
  getBoost(): number | undefined {
    const value = Object.values(this._body.fuzzy)[0];
    if (typeof value === 'object' && value !== null && 'boost' in value) {
      return value.boost as number;
    }
    return undefined;
  }

  /**
   * Extract base value from fuzzy value (handles both simple and object forms)
   */
  private _getBaseValue(value: any): ESValue {
    if (typeof value === 'object' && value !== null && 'value' in value) {
      return value.value;
    }
    return value;
  }
}