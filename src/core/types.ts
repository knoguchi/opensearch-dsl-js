/**
 * Core types for the elasticsearch-dsl-js library
 */

// Operation tracking for source preservation
export interface Operation {
  method: string;
  args: any[];
  timestamp: number;
  id: string;
}

// Metadata for queries
export interface QueryMetadata {
  id: string;
  operations: ReadonlyArray<Operation>;
  created: number;
  source?: string; // Original source code if parsed
}

// Base query body type
export type QueryBody = Record<string, any>;

// Common Elasticsearch field types
export type ESValue = string | number | boolean | Date | null | undefined | Record<string, any>;
export type ESField = string;

// Query execution context
export interface QueryContext {
  variables?: Map<string, any>;
  debug?: boolean;
  optimize?: boolean;
}