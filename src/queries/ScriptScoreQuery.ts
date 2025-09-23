/**
 * Script Score Query - Immutable Implementation
 *
 * Uses a script to provide a custom score for returned documents.
 */

import { Query } from '../core/Query.js';
import { QueryBody } from '../core/types.js';

export interface ScriptScoreQueryBody extends QueryBody {
  script_score: {
    query: any;
    script: {
      source?: string;
      id?: string;
      params?: Record<string, any>;
      lang?: string;
    };
    min_score?: number;
    boost?: number;
  };
}

export interface ScriptConfig {
  source?: string;
  id?: string;
  params?: Record<string, any>;
  lang?: string;
}

export class ScriptScoreQuery extends Query<ScriptScoreQueryBody> {
  constructor(query: Query, script: ScriptConfig) {
    const body: ScriptScoreQueryBody = {
      script_score: {
        query: query.toJSON(),
        script: { ...script }
      }
    };

    super(body);
  }

  /**
   * Set query - returns NEW instance
   */
  query(query: Query): ScriptScoreQuery {
    const operation = this._recordOperation('query', [query]);

    return this._createNew({
      script_score: {
        ...this._body.script_score,
        query: query.toJSON()
      }
    }, operation);
  }

  /**
   * Set script source - returns NEW instance
   */
  script(script: ScriptConfig): ScriptScoreQuery {
    const operation = this._recordOperation('script', [script]);

    return this._createNew({
      script_score: {
        ...this._body.script_score,
        script: { ...script }
      }
    }, operation);
  }

  /**
   * Set script source code - returns NEW instance
   */
  source(source: string): ScriptScoreQuery {
    const operation = this._recordOperation('source', [source]);

    return this._createNew({
      script_score: {
        ...this._body.script_score,
        script: {
          ...this._body.script_score.script,
          source
        }
      }
    }, operation);
  }

  /**
   * Set script ID - returns NEW instance
   */
  scriptId(id: string): ScriptScoreQuery {
    const operation = this._recordOperation('scriptId', [id]);

    return this._createNew({
      script_score: {
        ...this._body.script_score,
        script: {
          ...this._body.script_score.script,
          id
        }
      }
    }, operation);
  }

  /**
   * Set script parameters - returns NEW instance
   */
  params(params: Record<string, any>): ScriptScoreQuery {
    const operation = this._recordOperation('params', [params]);

    return this._createNew({
      script_score: {
        ...this._body.script_score,
        script: {
          ...this._body.script_score.script,
          params
        }
      }
    }, operation);
  }

  /**
   * Set script language - returns NEW instance
   */
  lang(lang: string): ScriptScoreQuery {
    const operation = this._recordOperation('lang', [lang]);

    return this._createNew({
      script_score: {
        ...this._body.script_score,
        script: {
          ...this._body.script_score.script,
          lang
        }
      }
    }, operation);
  }

  /**
   * Set minimum score - returns NEW instance
   */
  minScore(value: number): ScriptScoreQuery {
    const operation = this._recordOperation('minScore', [value]);

    return this._createNew({
      script_score: {
        ...this._body.script_score,
        min_score: value
      }
    }, operation);
  }

  /**
   * Set boost value - returns NEW instance
   */
  boost(value: number): ScriptScoreQuery {
    const operation = this._recordOperation('boost', [value]);

    return this._createNew({
      script_score: {
        ...this._body.script_score,
        boost: value
      }
    }, operation);
  }

  /**
   * Generate source code representation
   */
  toCode(): string {
    const operations = this._metadata.operations;
    const script = this._body.script_score.script;

    if (operations.length === 0) {
      return `Q.scriptScore(/* query */, ${JSON.stringify(script)})`;
    }

    let code = `Q.scriptScore(/* query */, ${JSON.stringify(script)})`;
    for (const op of operations) {
      switch (op.method) {
        case 'query':
          code += `\n  .query(/* ${op.args[0]._id} */)`;
          break;
        case 'script':
          code += `\n  .script(${JSON.stringify(op.args[0])})`;
          break;
        case 'source':
          code += `\n  .source('${op.args[0]}')`;
          break;
        case 'scriptId':
          code += `\n  .scriptId('${op.args[0]}')`;
          break;
        case 'params':
          code += `\n  .params(${JSON.stringify(op.args[0])})`;
          break;
        case 'lang':
          code += `\n  .lang('${op.args[0]}')`;
          break;
        case 'minScore':
        case 'boost':
          code += `\n  .${op.method}(${op.args[0]})`;
          break;
      }
    }

    return code;
  }

  /**
   * Create a new instance with updated body
   */
  clone(body?: Partial<ScriptScoreQueryBody>, _metadata?: any): ScriptScoreQuery {
    const newBody = body ? { ...this._body, ...body } : this._body;
    const query = this._body.script_score.query;
    const script = newBody.script_score?.script || this._body.script_score.script;

    // Create temporary Query instance for constructor
    const tempQuery = new (class extends Query<any> {
      toJSON() { return query; }
      toCode() { return '/* query */'; }
      clone() { return this; }
    })({});

    return new ScriptScoreQuery(tempQuery, script);
  }

  /**
   * Get query for debugging
   */
  getQuery(): any {
    return this._body.script_score.query;
  }

  /**
   * Get script for debugging
   */
  getScript(): ScriptConfig {
    return this._body.script_score.script;
  }

  /**
   * Get minimum score for debugging
   */
  getMinScore(): number | undefined {
    return this._body.script_score.min_score;
  }

  /**
   * Get boost value for debugging
   */
  getBoost(): number | undefined {
    return this._body.script_score.boost;
  }
}