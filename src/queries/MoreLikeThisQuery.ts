/**
 * More Like This Query - Immutable Implementation
 *
 * Finds documents that are "like" the provided text, document, or collection of documents.
 */

import { Query } from '../core/Query.js';
import { QueryBody, ESField } from '../core/types.js';

export interface MoreLikeThisQueryBody extends QueryBody {
  more_like_this: {
    fields?: string[];
    like?: (string | { _index?: string; _id: string } | { doc: any })[];
    unlike?: (string | { _index?: string; _id: string } | { doc: any })[];
    max_query_terms?: number;
    min_term_freq?: number;
    min_doc_freq?: number;
    max_doc_freq?: number;
    min_word_length?: number;
    max_word_length?: number;
    stop_words?: string[];
    analyzer?: string;
    minimum_should_match?: number | string;
    boost_terms?: number;
    include?: boolean;
    boost?: number;
  };
}

export type LikeDocument = string | { _index?: string; _id: string } | { doc: any };

export class MoreLikeThisQuery extends Query<MoreLikeThisQueryBody> {
  constructor(fields: ESField | ESField[], like: LikeDocument | LikeDocument[]) {
    const body: MoreLikeThisQueryBody = {
      more_like_this: {
        fields: Array.isArray(fields) ? fields as string[] : [fields as string],
        like: Array.isArray(like) ? like : [like]
      }
    };

    super(body);
  }

  /**
   * Set fields to search - returns NEW instance
   */
  fields(fields: ESField | ESField[]): MoreLikeThisQuery {
    const operation = this._recordOperation('fields', [fields]);

    return this._createNew({
      more_like_this: {
        ...this._body.more_like_this,
        fields: Array.isArray(fields) ? fields as string[] : [fields as string]
      }
    }, operation);
  }

  /**
   * Set like documents/text - returns NEW instance
   */
  like(like: LikeDocument | LikeDocument[]): MoreLikeThisQuery {
    const operation = this._recordOperation('like', [like]);

    return this._createNew({
      more_like_this: {
        ...this._body.more_like_this,
        like: Array.isArray(like) ? like : [like]
      }
    }, operation);
  }

  /**
   * Set unlike documents/text - returns NEW instance
   */
  unlike(unlike: LikeDocument | LikeDocument[]): MoreLikeThisQuery {
    const operation = this._recordOperation('unlike', [unlike]);

    return this._createNew({
      more_like_this: {
        ...this._body.more_like_this,
        unlike: Array.isArray(unlike) ? unlike : [unlike]
      }
    }, operation);
  }

  /**
   * Set maximum number of query terms - returns NEW instance
   */
  maxQueryTerms(value: number): MoreLikeThisQuery {
    const operation = this._recordOperation('maxQueryTerms', [value]);

    return this._createNew({
      more_like_this: {
        ...this._body.more_like_this,
        max_query_terms: value
      }
    }, operation);
  }

  /**
   * Set minimum term frequency - returns NEW instance
   */
  minTermFreq(value: number): MoreLikeThisQuery {
    const operation = this._recordOperation('minTermFreq', [value]);

    return this._createNew({
      more_like_this: {
        ...this._body.more_like_this,
        min_term_freq: value
      }
    }, operation);
  }

  /**
   * Set minimum document frequency - returns NEW instance
   */
  minDocFreq(value: number): MoreLikeThisQuery {
    const operation = this._recordOperation('minDocFreq', [value]);

    return this._createNew({
      more_like_this: {
        ...this._body.more_like_this,
        min_doc_freq: value
      }
    }, operation);
  }

  /**
   * Set maximum document frequency - returns NEW instance
   */
  maxDocFreq(value: number): MoreLikeThisQuery {
    const operation = this._recordOperation('maxDocFreq', [value]);

    return this._createNew({
      more_like_this: {
        ...this._body.more_like_this,
        max_doc_freq: value
      }
    }, operation);
  }

  /**
   * Set minimum word length - returns NEW instance
   */
  minWordLength(value: number): MoreLikeThisQuery {
    const operation = this._recordOperation('minWordLength', [value]);

    return this._createNew({
      more_like_this: {
        ...this._body.more_like_this,
        min_word_length: value
      }
    }, operation);
  }

  /**
   * Set maximum word length - returns NEW instance
   */
  maxWordLength(value: number): MoreLikeThisQuery {
    const operation = this._recordOperation('maxWordLength', [value]);

    return this._createNew({
      more_like_this: {
        ...this._body.more_like_this,
        max_word_length: value
      }
    }, operation);
  }

  /**
   * Set stop words - returns NEW instance
   */
  stopWords(words: string[]): MoreLikeThisQuery {
    const operation = this._recordOperation('stopWords', [words]);

    return this._createNew({
      more_like_this: {
        ...this._body.more_like_this,
        stop_words: words
      }
    }, operation);
  }

  /**
   * Set analyzer - returns NEW instance
   */
  analyzer(analyzer: string): MoreLikeThisQuery {
    const operation = this._recordOperation('analyzer', [analyzer]);

    return this._createNew({
      more_like_this: {
        ...this._body.more_like_this,
        analyzer
      }
    }, operation);
  }

  /**
   * Set minimum should match - returns NEW instance
   */
  minimumShouldMatch(value: number | string): MoreLikeThisQuery {
    const operation = this._recordOperation('minimumShouldMatch', [value]);

    return this._createNew({
      more_like_this: {
        ...this._body.more_like_this,
        minimum_should_match: value
      }
    }, operation);
  }

  /**
   * Set boost terms - returns NEW instance
   */
  boostTerms(value: number): MoreLikeThisQuery {
    const operation = this._recordOperation('boostTerms', [value]);

    return this._createNew({
      more_like_this: {
        ...this._body.more_like_this,
        boost_terms: value
      }
    }, operation);
  }

  /**
   * Set include - returns NEW instance
   */
  include(value: boolean): MoreLikeThisQuery {
    const operation = this._recordOperation('include', [value]);

    return this._createNew({
      more_like_this: {
        ...this._body.more_like_this,
        include: value
      }
    }, operation);
  }

  /**
   * Set boost value - returns NEW instance
   */
  boost(value: number): MoreLikeThisQuery {
    const operation = this._recordOperation('boost', [value]);

    return this._createNew({
      more_like_this: {
        ...this._body.more_like_this,
        boost: value
      }
    }, operation);
  }

  /**
   * Generate source code representation
   */
  toCode(): string {
    const operations = this._metadata.operations;
    const fields = this._body.more_like_this.fields;
    const like = this._body.more_like_this.like;

    if (operations.length === 0) {
      return `Q.moreLikeThis(${JSON.stringify(fields)}, ${JSON.stringify(like)})`;
    }

    let code = `Q.moreLikeThis(${JSON.stringify(fields)}, ${JSON.stringify(like)})`;
    for (const op of operations) {
      const value = typeof op.args[0] === 'string' ? `'${op.args[0]}'` : JSON.stringify(op.args[0]);
      code += `\n  .${op.method}(${value})`;
    }

    return code;
  }

  /**
   * Create a new instance with updated body
   */
  clone(body?: Partial<MoreLikeThisQueryBody>, _metadata?: any): MoreLikeThisQuery {
    const newBody = body ? { ...this._body, ...body } : this._body;
    const fields = newBody.more_like_this?.fields || this._body.more_like_this.fields || [];
    const like = newBody.more_like_this?.like || this._body.more_like_this.like || [];

    return new MoreLikeThisQuery(fields, like);
  }

  /**
   * Get fields for debugging
   */
  getFields(): string[] | undefined {
    return this._body.more_like_this.fields;
  }

  /**
   * Get like documents for debugging
   */
  getLike(): LikeDocument[] | undefined {
    return this._body.more_like_this.like;
  }

  /**
   * Get unlike documents for debugging
   */
  getUnlike(): LikeDocument[] | undefined {
    return this._body.more_like_this.unlike;
  }

  /**
   * Get boost value for debugging
   */
  getBoost(): number | undefined {
    return this._body.more_like_this.boost;
  }
}