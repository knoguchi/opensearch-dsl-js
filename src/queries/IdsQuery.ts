/**
 * IDs Query - Immutable Implementation
 *
 * Matches documents by their document IDs
 */

import { Query } from '../core/Query.js';
import { QueryBody } from '../core/types.js';

export interface IdsQueryBody extends QueryBody {
  ids: {
    values: string[];
    boost?: number;
  };
}

export class IdsQuery extends Query<IdsQueryBody> {
  constructor(ids: string | string[]) {
    const values = Array.isArray(ids) ? ids : [ids];
    const body: IdsQueryBody = {
      ids: {
        values
      }
    };

    super(body);
  }

  /**
   * Set boost value - returns NEW instance
   */
  boost(value: number): IdsQuery {
    const operation = this._recordOperation('boost', [value]);

    return this._createNew({
      ids: {
        values: this._body.ids.values,
        boost: value
      }
    }, operation);
  }

  /**
   * Add more IDs to the existing list - returns NEW instance
   */
  addIds(...newIds: string[]): IdsQuery {
    const operation = this._recordOperation('addIds', newIds);
    const combinedIds = [...this._body.ids.values, ...newIds];

    return this._createNew({
      ids: {
        ...this._body.ids,
        values: combinedIds
      }
    }, operation);
  }

  /**
   * Remove IDs from the list - returns NEW instance
   */
  removeIds(...idsToRemove: string[]): IdsQuery {
    const operation = this._recordOperation('removeIds', idsToRemove);
    const filteredIds = this._body.ids.values.filter(id => !idsToRemove.includes(id));

    return this._createNew({
      ids: {
        ...this._body.ids,
        values: filteredIds
      }
    }, operation);
  }

  /**
   * Generate source code representation
   */
  toCode(): string {
    const values = this._body.ids.values;
    const operations = this._metadata.operations;

    let code = `Q.ids(${JSON.stringify(values)})`;

    for (const op of operations) {
      switch (op.method) {
        case 'boost':
          code += `\n  .boost(${op.args[0]})`;
          break;
        case 'addIds':
          code += `\n  .addIds(${op.args.map(arg => JSON.stringify(arg)).join(', ')})`;
          break;
        case 'removeIds':
          code += `\n  .removeIds(${op.args.map(arg => JSON.stringify(arg)).join(', ')})`;
          break;
      }
    }

    return code;
  }

  /**
   * Create a new instance with updated body
   */
  clone(body?: Partial<IdsQueryBody>, _metadata?: any): IdsQuery {
    const newBody = body ? { ...this._body, ...body } : this._body;
    const values = newBody.ids.values;

    // Create new IdsQuery with just values to avoid recursion
    const newQuery = new IdsQuery(values);

    // Manually set the body to preserve all properties without triggering methods
    (newQuery as any)._body = Object.freeze(newQuery._deepClone(newBody));

    return newQuery;
  }

  /**
   * Get the IDs for this query
   */
  getIds(): string[] {
    return this._body.ids.values;
  }

  /**
   * Get boost value if set
   */
  getBoost(): number | undefined {
    return this._body.ids.boost;
  }

  /**
   * Check if a specific ID is included
   */
  hasId(id: string): boolean {
    return this._body.ids.values.includes(id);
  }

  /**
   * Get the count of IDs
   */
  getIdCount(): number {
    return this._body.ids.values.length;
  }
}