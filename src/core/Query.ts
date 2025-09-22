/**
 * Base immutable Query class
 * 
 * All queries extend this class and follow immutability principles:
 * - Every operation returns a new instance
 * - Original instances are never modified
 * - Safe for composition and sharing
 */

import { QueryBody, QueryMetadata, Operation } from './types.js';

let queryIdCounter = 0;

function generateId(): string {
  return `q_${++queryIdCounter}_${Date.now()}`;
}

function generateOperationId(): string {
  return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export abstract class Query<T extends QueryBody = QueryBody> {
  protected readonly _body: Readonly<T>;
  protected readonly _metadata: Readonly<QueryMetadata>;

  constructor(body: T, metadata?: Partial<QueryMetadata>) {
    // Deep freeze the body to ensure immutability
    this._body = Object.freeze(this._deepClone(body));
    
    this._metadata = Object.freeze({
      id: metadata?.id ?? generateId(),
      operations: metadata?.operations ?? [],
      created: metadata?.created ?? Date.now(),
      ...(metadata?.source && { source: metadata.source })
    } as QueryMetadata);
  }

  /**
   * Get the query body as a plain object (for ES)
   */
  toJSON(): T {
    return this._deepClone(this._body);
  }

  /**
   * Generate source code representation
   */
  abstract toCode(): string;

  /**
   * Create a new instance (used internally for immutable operations)
   */
  abstract clone(body?: Partial<T>, metadata?: Partial<QueryMetadata>): Query<T>;

  /**
   * Get query metadata
   */
  metadata(): Readonly<QueryMetadata> {
    return this._metadata;
  }

  /**
   * Get query ID
   */
  id(): string {
    return this._metadata.id;
  }

  /**
   * Conditional execution - when condition is truthy
   */
  when<Q extends Query<T>>(this: Q, condition: any, fn: (query: Q) => Q): Q {
    return condition ? fn(this) : this;
  }

  /**
   * Conditional execution - when condition is falsy
   */
  unless<Q extends Query<T>>(this: Q, condition: any, fn: (query: Q) => Q): Q {
    return !condition ? fn(this) : this;
  }

  /**
   * Record an operation for source preservation
   */
  protected _recordOperation(method: string, args: any[]): Operation {
    return {
      method,
      args: this._serializeArgs(args),
      timestamp: Date.now(),
      id: generateOperationId()
    };
  }

  /**
   * Create new instance with updated body and operations
   */
  protected _createNew<U extends Query<T>>(
    this: U,
    newBody: T,
    operation?: Operation
  ): U {
    const newOperations = operation 
      ? [...this._metadata.operations, operation]
      : this._metadata.operations;

    return this.clone(newBody, { operations: newOperations }) as U;
  }

  /**
   * Deep clone an object
   */
  protected _deepClone<U>(obj: U): U {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as U;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this._deepClone(item)) as U;
    }

    const cloned = {} as U;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this._deepClone(obj[key]);
      }
    }

    return cloned;
  }

  /**
   * Serialize arguments for operation tracking
   */
  private _serializeArgs(args: any[]): any[] {
    return args.map(arg => {
      if (arg instanceof Query) {
        return { _type: 'Query', _id: arg.id(), _toJSON: arg.toJSON() };
      }
      return arg;
    });
  }

  /**
   * Check if two queries are structurally equal
   */
  equals(other: Query): boolean {
    return JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON());
  }

  /**
   * Get a string representation for debugging
   */
  toString(): string {
    return `${this.constructor.name}(${JSON.stringify(this.toJSON(), null, 2)})`;
  }
}