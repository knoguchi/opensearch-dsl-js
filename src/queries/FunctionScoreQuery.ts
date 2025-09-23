/**
 * Function Score Query - Immutable Implementation
 *
 * Allows you to modify the score of documents returned by a query using
 * various scoring functions like field value factor, decay functions, etc.
 */

import { Query } from '../core/Query.js';
import { QueryBody, ESField } from '../core/types.js';

export interface FunctionScoreQueryBody extends QueryBody {
  function_score: {
    query?: any;
    boost?: number;
    functions?: FunctionConfig[];
    max_boost?: number;
    score_mode?: 'multiply' | 'sum' | 'avg' | 'first' | 'max' | 'min';
    boost_mode?: 'multiply' | 'replace' | 'sum' | 'avg' | 'max' | 'min';
    min_score?: number;
    random_score?: {
      seed?: number | string;
      field?: string;
    };
    field_value_factor?: {
      field: string;
      factor?: number;
      modifier?: 'none' | 'log' | 'log1p' | 'log2p' | 'ln' | 'ln1p' | 'ln2p' | 'square' | 'sqrt' | 'reciprocal';
      missing?: number;
    };
    script_score?: {
      script: {
        source?: string;
        id?: string;
        params?: Record<string, any>;
      };
    };
  };
}

export interface FunctionConfig {
  filter?: any;
  weight?: number;
  random_score?: {
    seed?: number | string;
    field?: string;
  };
  field_value_factor?: {
    field: string;
    factor?: number;
    modifier?: 'none' | 'log' | 'log1p' | 'log2p' | 'ln' | 'ln1p' | 'ln2p' | 'square' | 'sqrt' | 'reciprocal';
    missing?: number;
  };
  script_score?: {
    script: {
      source?: string;
      id?: string;
      params?: Record<string, any>;
    };
  };
  gauss?: DecayFunction;
  exp?: DecayFunction;
  linear?: DecayFunction;
}

export interface DecayFunction {
  [field: string]: {
    origin: string | number;
    scale: string | number;
    offset?: string | number;
    decay?: number;
  };
}

export interface ScriptConfig {
  source?: string;
  id?: string;
  params?: Record<string, any>;
}

export class FunctionScoreQuery extends Query<FunctionScoreQueryBody> {
  constructor(query?: Query) {
    const body: FunctionScoreQueryBody = {
      function_score: query ? { query: query.toJSON() } : {}
    };

    super(body);
  }

  /**
   * Set query - returns NEW instance
   */
  query(query: Query): FunctionScoreQuery {
    const operation = this._recordOperation('query', [query]);

    return this._createNew({
      function_score: {
        ...this._body.function_score,
        query: query.toJSON()
      }
    }, operation);
  }

  /**
   * Set boost value - returns NEW instance
   */
  boost(value: number): FunctionScoreQuery {
    const operation = this._recordOperation('boost', [value]);

    return this._createNew({
      function_score: {
        ...this._body.function_score,
        boost: value
      }
    }, operation);
  }

  /**
   * Add function - returns NEW instance
   */
  addFunction(func: FunctionConfig): FunctionScoreQuery {
    const operation = this._recordOperation('addFunction', [func]);
    const currentFunctions = this._body.function_score.functions || [];

    return this._createNew({
      function_score: {
        ...this._body.function_score,
        functions: [...currentFunctions, func]
      }
    }, operation);
  }

  /**
   * Set functions array - returns NEW instance
   */
  functions(functions: FunctionConfig[]): FunctionScoreQuery {
    const operation = this._recordOperation('functions', [functions]);

    return this._createNew({
      function_score: {
        ...this._body.function_score,
        functions
      }
    }, operation);
  }

  /**
   * Set max boost - returns NEW instance
   */
  maxBoost(value: number): FunctionScoreQuery {
    const operation = this._recordOperation('maxBoost', [value]);

    return this._createNew({
      function_score: {
        ...this._body.function_score,
        max_boost: value
      }
    }, operation);
  }

  /**
   * Set score mode - returns NEW instance
   */
  scoreMode(mode: 'multiply' | 'sum' | 'avg' | 'first' | 'max' | 'min'): FunctionScoreQuery {
    const operation = this._recordOperation('scoreMode', [mode]);

    return this._createNew({
      function_score: {
        ...this._body.function_score,
        score_mode: mode
      }
    }, operation);
  }

  /**
   * Set boost mode - returns NEW instance
   */
  boostMode(mode: 'multiply' | 'replace' | 'sum' | 'avg' | 'max' | 'min'): FunctionScoreQuery {
    const operation = this._recordOperation('boostMode', [mode]);

    return this._createNew({
      function_score: {
        ...this._body.function_score,
        boost_mode: mode
      }
    }, operation);
  }

  /**
   * Set minimum score - returns NEW instance
   */
  minScore(value: number): FunctionScoreQuery {
    const operation = this._recordOperation('minScore', [value]);

    return this._createNew({
      function_score: {
        ...this._body.function_score,
        min_score: value
      }
    }, operation);
  }

  /**
   * Set random score function - returns NEW instance
   */
  randomScore(seed?: number | string, field?: string): FunctionScoreQuery {
    const operation = this._recordOperation('randomScore', [seed, field]);
    const randomScoreConfig: any = {};
    if (seed !== undefined) randomScoreConfig.seed = seed;
    if (field !== undefined) randomScoreConfig.field = field;

    return this._createNew({
      function_score: {
        ...this._body.function_score,
        random_score: randomScoreConfig
      }
    }, operation);
  }

  /**
   * Set field value factor function - returns NEW instance
   */
  fieldValueFactor(
    field: ESField,
    factor?: number,
    modifier?: 'none' | 'log' | 'log1p' | 'log2p' | 'ln' | 'ln1p' | 'ln2p' | 'square' | 'sqrt' | 'reciprocal',
    missing?: number
  ): FunctionScoreQuery {
    const operation = this._recordOperation('fieldValueFactor', [field, factor, modifier, missing]);

    const config: any = { field: field as string };
    if (factor !== undefined) config.factor = factor;
    if (modifier !== undefined) config.modifier = modifier;
    if (missing !== undefined) config.missing = missing;

    return this._createNew({
      function_score: {
        ...this._body.function_score,
        field_value_factor: config
      }
    }, operation);
  }

  /**
   * Set script score function - returns NEW instance
   */
  scriptScore(script: ScriptConfig): FunctionScoreQuery {
    const operation = this._recordOperation('scriptScore', [script]);

    return this._createNew({
      function_score: {
        ...this._body.function_score,
        script_score: { script }
      }
    }, operation);
  }

  /**
   * Generate source code representation
   */
  toCode(): string {
    const operations = this._metadata.operations;
    const hasQuery = this._body.function_score.query !== undefined;

    if (operations.length === 0) {
      return hasQuery ? 'Q.functionScore(/* query */)' : 'Q.functionScore()';
    }

    let code = hasQuery ? 'Q.functionScore(/* query */)' : 'Q.functionScore()';
    for (const op of operations) {
      switch (op.method) {
        case 'query':
          code += `\n  .query(/* ${op.args[0]._id} */)`;
          break;
        case 'addFunction':
          code += `\n  .addFunction(${JSON.stringify(op.args[0])})`;
          break;
        case 'functions':
          code += `\n  .functions(${JSON.stringify(op.args[0])})`;
          break;
        case 'randomScore':
          const args = op.args.filter(arg => arg !== undefined);
          code += `\n  .randomScore(${args.map(arg => typeof arg === 'string' ? `'${arg}'` : arg).join(', ')})`;
          break;
        case 'fieldValueFactor':
          const [field, factor, modifier, missing] = op.args;
          const params = [`'${field}'`];
          if (factor !== undefined) params.push(factor);
          if (modifier !== undefined) params.push(`'${modifier}'`);
          if (missing !== undefined) params.push(missing);
          code += `\n  .fieldValueFactor(${params.join(', ')})`;
          break;
        case 'scriptScore':
          code += `\n  .scriptScore(${JSON.stringify(op.args[0])})`;
          break;
        case 'boost':
        case 'maxBoost':
        case 'minScore':
          code += `\n  .${op.method}(${op.args[0]})`;
          break;
        case 'scoreMode':
        case 'boostMode':
          code += `\n  .${op.method}('${op.args[0]}')`;
          break;
      }
    }

    return code;
  }

  /**
   * Create a new instance with updated body
   */
  clone(body?: Partial<FunctionScoreQueryBody>, _metadata?: any): FunctionScoreQuery {
    const newBody = body ? { ...this._body, ...body } : this._body;
    const query = this._body.function_score.query;

    // Create temporary Query instance for constructor
    const tempQuery = query ? new (class extends Query<any> {
      toJSON() { return query; }
      toCode() { return '/* query */'; }
      clone() { return this; }
    })({}) : undefined;

    return new FunctionScoreQuery(tempQuery);
  }

  /**
   * Get query for debugging
   */
  getQuery(): any {
    return this._body.function_score.query;
  }

  /**
   * Get functions for debugging
   */
  getFunctions(): FunctionConfig[] | undefined {
    return this._body.function_score.functions;
  }

  /**
   * Get boost value for debugging
   */
  getBoost(): number | undefined {
    return this._body.function_score.boost;
  }
}