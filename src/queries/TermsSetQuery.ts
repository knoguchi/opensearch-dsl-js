/**
 * Terms Set Query - Immutable Implementation
 *
 * Returns documents that contain a minimum number of exact terms in a specified field.
 * You can define the minimum number of matching terms using a field or script.
 */

import { Query } from '../core/Query.js';
import { QueryBody, ESField, ESValue } from '../core/types.js';

export interface TermsSetQueryBody extends QueryBody {
  terms_set: {
    [field: string]: {
      terms: ESValue[];
      minimum_should_match_field?: string;
      minimum_should_match_script?: {
        source?: string;
        id?: string;
        params?: Record<string, any>;
      };
      boost?: number;
    };
  };
}

export interface ScriptConfig {
  source?: string;
  id?: string;
  params?: Record<string, any>;
}

export class TermsSetQuery extends Query<TermsSetQueryBody> {
  constructor(field: ESField, terms: ESValue[]) {
    const body: TermsSetQueryBody = {
      terms_set: {
        [field as string]: {
          terms
        }
      }
    };

    super(body);
  }

  /**
   * Set terms array - returns NEW instance
   */
  terms(terms: ESValue[]): TermsSetQuery {
    const operation = this._recordOperation('terms', [terms]);
    const field = this.getField();

    return this._createNew({
      terms_set: {
        [field]: {
          ...this._body.terms_set[field],
          terms
        }
      }
    }, operation);
  }

  /**
   * Add terms to existing array - returns NEW instance
   */
  addTerms(...newTerms: ESValue[]): TermsSetQuery {
    const operation = this._recordOperation('addTerms', newTerms);
    const field = this.getField();
    const currentTerms = this._body.terms_set[field].terms;

    return this._createNew({
      terms_set: {
        [field]: {
          ...this._body.terms_set[field],
          terms: [...currentTerms, ...newTerms]
        }
      }
    }, operation);
  }

  /**
   * Set minimum should match field - returns NEW instance
   */
  minimumShouldMatchField(field: ESField): TermsSetQuery {
    const operation = this._recordOperation('minimumShouldMatchField', [field]);
    const queryField = this.getField();

    return this._createNew({
      terms_set: {
        [queryField]: {
          ...this._body.terms_set[queryField],
          minimum_should_match_field: field as string,
          // Remove script if field is set
          minimum_should_match_script: undefined
        }
      }
    }, operation);
  }

  /**
   * Set minimum should match script - returns NEW instance
   */
  minimumShouldMatchScript(script: ScriptConfig): TermsSetQuery {
    const operation = this._recordOperation('minimumShouldMatchScript', [script]);
    const field = this.getField();

    return this._createNew({
      terms_set: {
        [field]: {
          ...this._body.terms_set[field],
          minimum_should_match_script: script,
          // Remove field if script is set
          minimum_should_match_field: undefined
        }
      }
    }, operation);
  }

  /**
   * Set boost value - returns NEW instance
   */
  boost(value: number): TermsSetQuery {
    const operation = this._recordOperation('boost', [value]);
    const field = this.getField();

    return this._createNew({
      terms_set: {
        [field]: {
          ...this._body.terms_set[field],
          boost: value
        }
      }
    }, operation);
  }

  /**
   * Generate source code representation
   */
  toCode(): string {
    const operations = this._metadata.operations;
    const field = this.getField();
    const terms = this.getTerms();

    if (operations.length === 0) {
      return `Q.termsSet('${field}', ${JSON.stringify(terms)})`;
    }

    let code = `Q.termsSet('${field}', ${JSON.stringify(terms)})`;
    for (const op of operations) {
      switch (op.method) {
        case 'terms':
          code += `\n  .terms(${JSON.stringify(op.args[0])})`;
          break;
        case 'addTerms':
          const newTerms = op.args.map(arg => JSON.stringify(arg)).join(', ');
          code += `\n  .addTerms(${newTerms})`;
          break;
        case 'minimumShouldMatchField':
          code += `\n  .minimumShouldMatchField('${op.args[0]}')`;
          break;
        case 'minimumShouldMatchScript':
          code += `\n  .minimumShouldMatchScript(${JSON.stringify(op.args[0])})`;
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
  clone(body?: Partial<TermsSetQueryBody>, _metadata?: any): TermsSetQuery {
    const newBody = body ? { ...this._body, ...body } : this._body;
    const field = this.getField();
    const terms = this.getTerms();

    return new TermsSetQuery(field, terms);
  }

  /**
   * Get field name
   */
  getField(): string {
    return Object.keys(this._body.terms_set)[0];
  }

  /**
   * Get terms array
   */
  getTerms(): ESValue[] {
    const field = this.getField();
    return this._body.terms_set[field].terms;
  }

  /**
   * Get minimum should match field for debugging
   */
  getMinimumShouldMatchField(): string | undefined {
    const field = this.getField();
    return this._body.terms_set[field].minimum_should_match_field;
  }

  /**
   * Get minimum should match script for debugging
   */
  getMinimumShouldMatchScript(): ScriptConfig | undefined {
    const field = this.getField();
    return this._body.terms_set[field].minimum_should_match_script;
  }

  /**
   * Get boost value for debugging
   */
  getBoost(): number | undefined {
    const field = this.getField();
    return this._body.terms_set[field].boost;
  }
}