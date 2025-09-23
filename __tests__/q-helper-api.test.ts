/**
 * Q Helper API Tests
 *
 * Tests the primary developer-facing API surface.
 * These are the most critical tests as they verify the actual user experience.
 */

import { Q } from '../src/Q.js';
import {
  BoolQuery, TermQuery, TermsQuery, MatchQuery, MatchPhraseQuery,
  MultiMatchQuery, MatchAllQuery, RangeQuery, WildcardQuery,
  PrefixQuery, FuzzyQuery, ExistsQuery, IdsQuery
} from '../src/index.js';

describe('Q Helper API - Type Contracts', () => {
  test('Q.bool() returns BoolQuery instance', () => {
    const query = Q.bool();
    expect(query).toBeInstanceOf(BoolQuery);
  });

  test('Q.term() returns TermQuery instance', () => {
    const query = Q.term('status', 'active');
    expect(query).toBeInstanceOf(TermQuery);
  });

  test('Q.terms() returns TermsQuery instance', () => {
    const query = Q.terms('category', ['tech', 'science']);
    expect(query).toBeInstanceOf(TermsQuery);
  });

  test('Q.match() returns MatchQuery instance', () => {
    const query = Q.match('title', 'search text');
    expect(query).toBeInstanceOf(MatchQuery);
  });

  test('Q.matchPhrase() returns MatchPhraseQuery instance', () => {
    const query = Q.matchPhrase('title', 'exact phrase');
    expect(query).toBeInstanceOf(MatchPhraseQuery);
  });

  test('Q.multiMatch() returns MultiMatchQuery instance', () => {
    const query = Q.multiMatch('search', ['title', 'content']);
    expect(query).toBeInstanceOf(MultiMatchQuery);
  });

  test('Q.matchAll() returns MatchAllQuery instance', () => {
    const query = Q.matchAll();
    expect(query).toBeInstanceOf(MatchAllQuery);
  });

  test('Q.range() returns RangeQuery instance', () => {
    const query = Q.range('age');
    expect(query).toBeInstanceOf(RangeQuery);
  });

  test('Q.wildcard() returns WildcardQuery instance', () => {
    const query = Q.wildcard('name', 'john*');
    expect(query).toBeInstanceOf(WildcardQuery);
  });

  test('Q.prefix() returns PrefixQuery instance', () => {
    const query = Q.prefix('name', 'john');
    expect(query).toBeInstanceOf(PrefixQuery);
  });

  test('Q.fuzzy() returns FuzzyQuery instance', () => {
    const query = Q.fuzzy('name', 'john');
    expect(query).toBeInstanceOf(FuzzyQuery);
  });

  test('Q.exists() returns ExistsQuery instance', () => {
    const query = Q.exists('email');
    expect(query).toBeInstanceOf(ExistsQuery);
  });

  test('Q.ids() returns IdsQuery instance', () => {
    const query = Q.ids(['doc1', 'doc2']);
    expect(query).toBeInstanceOf(IdsQuery);
  });
});

describe('Q Helper API - JSON Output Validation', () => {
  test('Q.bool() generates correct empty bool query', () => {
    const query = Q.bool();
    expect(query.toJSON()).toEqual({
      bool: {}
    });
  });

  test('Q.term() generates correct term query', () => {
    const query = Q.term('status', 'active');
    expect(query.toJSON()).toEqual({
      term: {
        status: 'active'
      }
    });
  });

  test('Q.terms() generates correct terms query', () => {
    const query = Q.terms('category', ['tech', 'science']);
    expect(query.toJSON()).toEqual({
      terms: {
        category: ['tech', 'science']
      }
    });
  });

  test('Q.match() generates correct match query', () => {
    const query = Q.match('title', 'search text');
    expect(query.toJSON()).toEqual({
      match: {
        title: 'search text'
      }
    });
  });

  test('Q.matchPhrase() generates correct match_phrase query', () => {
    const query = Q.matchPhrase('title', 'exact phrase');
    expect(query.toJSON()).toEqual({
      match_phrase: {
        title: 'exact phrase'
      }
    });
  });

  test('Q.multiMatch() generates correct multi_match query', () => {
    const query = Q.multiMatch('search', ['title', 'content']);
    expect(query.toJSON()).toEqual({
      multi_match: {
        query: 'search',
        fields: ['title', 'content']
      }
    });
  });

  test('Q.matchAll() generates correct match_all query', () => {
    const query = Q.matchAll();
    expect(query.toJSON()).toEqual({
      match_all: {}
    });
  });

  test('Q.range() generates correct empty range query', () => {
    const query = Q.range('age');
    expect(query.toJSON()).toEqual({
      range: {
        age: {}
      }
    });
  });

  test('Q.wildcard() generates correct wildcard query', () => {
    const query = Q.wildcard('name', 'john*');
    expect(query.toJSON()).toEqual({
      wildcard: {
        name: 'john*'
      }
    });
  });

  test('Q.prefix() generates correct prefix query', () => {
    const query = Q.prefix('name', 'john');
    expect(query.toJSON()).toEqual({
      prefix: {
        name: 'john'
      }
    });
  });

  test('Q.fuzzy() generates correct fuzzy query', () => {
    const query = Q.fuzzy('name', 'john');
    expect(query.toJSON()).toEqual({
      fuzzy: {
        name: 'john'
      }
    });
  });

  test('Q.exists() generates correct exists query', () => {
    const query = Q.exists('email');
    expect(query.toJSON()).toEqual({
      exists: {
        field: 'email'
      }
    });
  });

  test('Q.ids() generates correct ids query', () => {
    const query = Q.ids(['doc1', 'doc2']);
    expect(query.toJSON()).toEqual({
      ids: {
        values: ['doc1', 'doc2']
      }
    });
  });

  test('Q.ids() with single ID generates correct ids query', () => {
    const query = Q.ids('doc1');
    expect(query.toJSON()).toEqual({
      ids: {
        values: ['doc1']
      }
    });
  });
});

describe('Q Helper API - Method Chaining', () => {
  test('Q.bool() supports method chaining', () => {
    const query = Q.bool()
      .must(Q.term('status', 'active'))
      .should(Q.match('title', 'search'))
      .filter(Q.exists('email'))
      .boost(1.5);

    const json = query.toJSON();
    expect(json.bool.must).toHaveLength(1);
    expect(json.bool.should).toHaveLength(1);
    expect(json.bool.filter).toHaveLength(1);
    expect(json.bool.boost).toBe(1.5);
  });

  test('Q.term() supports method chaining', () => {
    const query = Q.term('status', 'active')
      .boost(2.0)
      .caseInsensitive(true);

    expect(query.toJSON()).toEqual({
      term: {
        status: {
          value: 'active',
          boost: 2.0,
          case_insensitive: true
        }
      }
    });
  });

  test('Q.range() supports method chaining', () => {
    const query = Q.range('age')
      .gte(18)
      .lte(65)
      .boost(1.2);

    expect(query.toJSON()).toEqual({
      range: {
        age: {
          gte: 18,
          lte: 65,
          boost: 1.2
        }
      }
    });
  });
});

describe('Q Helper API - Convenience Combinators', () => {
  test('Q.and() creates bool query with must clauses', () => {
    const q1 = Q.term('status', 'active');
    const q2 = Q.match('title', 'search');
    const query = Q.and(q1, q2);

    expect(query).toBeInstanceOf(BoolQuery);
    expect(query.toJSON()).toEqual({
      bool: {
        must: [
          { term: { status: 'active' } },
          { match: { title: 'search' } }
        ]
      }
    });
  });

  test('Q.or() creates bool query with should clauses', () => {
    const q1 = Q.term('status', 'active');
    const q2 = Q.term('status', 'pending');
    const query = Q.or(q1, q2);

    expect(query).toBeInstanceOf(BoolQuery);
    expect(query.toJSON()).toEqual({
      bool: {
        should: [
          { term: { status: 'active' } },
          { term: { status: 'pending' } }
        ]
      }
    });
  });

  test('Q.not() creates bool query with must_not clause', () => {
    const q = Q.term('status', 'deleted');
    const query = Q.not(q);

    expect(query).toBeInstanceOf(BoolQuery);
    expect(query.toJSON()).toEqual({
      bool: {
        must_not: [
          { term: { status: 'deleted' } }
        ]
      }
    });
  });

  test('Q.filter() creates bool query with filter clauses', () => {
    const q1 = Q.exists('email');
    const q2 = Q.range('age').gte(18);
    const query = Q.filter(q1, q2);

    expect(query).toBeInstanceOf(BoolQuery);
    const json = query.toJSON();
    expect(json.bool.filter).toHaveLength(2);
    expect(json.bool.filter![0]).toEqual({ exists: { field: 'email' } });
  });
});

describe('Q Helper API - Parameter Validation', () => {
  test('Q.term() requires field and value parameters', () => {
    expect(() => Q.term('field', 'value')).not.toThrow();
    expect(Q.term('field', 'value').getField()).toBe('field');
    expect(Q.term('field', 'value').getValue()).toBe('value');
  });

  test('Q.terms() requires field and values array', () => {
    expect(() => Q.terms('field', ['a', 'b'])).not.toThrow();
    expect(Q.terms('field', ['a', 'b']).getField()).toBe('field');
    expect(Q.terms('field', ['a', 'b']).getTerms()).toEqual(['a', 'b']);
  });

  test('Q.multiMatch() accepts single field or array', () => {
    const singleField = Q.multiMatch('query', 'title');
    expect(singleField.getFields()).toEqual(['title']);

    const multiField = Q.multiMatch('query', ['title', 'content']);
    expect(multiField.getFields()).toEqual(['title', 'content']);
  });

  test('Q.ids() accepts single ID or array', () => {
    const singleId = Q.ids('doc1');
    expect(singleId.getIds()).toEqual(['doc1']);

    const multiIds = Q.ids(['doc1', 'doc2']);
    expect(multiIds.getIds()).toEqual(['doc1', 'doc2']);
  });
});

describe('Q Helper API - Missing Utility Functions', () => {
  test('Q.must() creates bool query with must clauses', () => {
    const q1 = Q.term('status', 'active');
    const q2 = Q.match('title', 'search');
    const query = Q.must(q1, q2);

    expect(query).toBeInstanceOf(BoolQuery);
    expect(query.toJSON()).toEqual({
      bool: {
        must: [
          { term: { status: 'active' } },
          { match: { title: 'search' } }
        ]
      }
    });
  });

  test('Q.should() creates bool query with should clauses', () => {
    const q1 = Q.term('category', 'tech');
    const q2 = Q.term('category', 'science');
    const query = Q.should(q1, q2);

    expect(query).toBeInstanceOf(BoolQuery);
    expect(query.toJSON()).toEqual({
      bool: {
        should: [
          { term: { category: 'tech' } },
          { term: { category: 'science' } }
        ]
      }
    });
  });
});

describe('Q Helper API - Debugging Helpers', () => {
  test('Q.isEmpty() correctly identifies empty bool queries', () => {
    const emptyBool = Q.bool();
    const nonEmptyBool = Q.bool().must(Q.term('status', 'active'));
    const termQuery = Q.term('field', 'value');

    expect(Q.isEmpty(emptyBool)).toBe(true);
    expect(Q.isEmpty(nonEmptyBool)).toBe(false);
    expect(Q.isEmpty(termQuery)).toBe(false);
  });

  test('Q.debug() prints query information without errors', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const query = Q.term('status', 'active');

    expect(() => Q.debug(query)).not.toThrow();
    expect(consoleSpy).toHaveBeenCalledWith('=== Query Debug ===');
    expect(consoleSpy).toHaveBeenCalledWith('Type:', 'TermQuery');

    consoleSpy.mockRestore();
  });
});

describe('Q Helper API - Validation Helpers', () => {
  test('Q.validate() returns valid for properly constructed queries', () => {
    const termQuery = Q.term('status', 'active');
    const boolQuery = Q.bool().must(Q.term('field', 'value'));
    const rangeQuery = Q.range('age').gte(18);

    expect(Q.validate(termQuery)).toEqual({ valid: true, errors: [] });
    expect(Q.validate(boolQuery)).toEqual({ valid: true, errors: [] });
    expect(Q.validate(rangeQuery)).toEqual({ valid: true, errors: [] });
  });

  test('Q.validate() detects empty bool query issues', () => {
    const emptyBool = Q.bool();
    const result = Q.validate(emptyBool);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Bool query has no clauses');
  });

  test('Q.validate() detects range query without bounds', () => {
    const unboundedRange = Q.range('age');
    const result = Q.validate(unboundedRange);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Range query has no bounds set');
  });
});

describe('Q Helper API - Comparison Helpers', () => {
  test('Q.equals() correctly compares identical queries', () => {
    const query1 = Q.term('status', 'active');
    const query2 = Q.term('status', 'active');
    const query3 = Q.term('status', 'inactive');

    expect(Q.equals(query1, query2)).toBe(true);
    expect(Q.equals(query1, query3)).toBe(false);
  });

  test('Q.equals() works with complex bool queries', () => {
    const bool1 = Q.bool().must(Q.term('status', 'active')).should(Q.match('title', 'test'));
    const bool2 = Q.bool().must(Q.term('status', 'active')).should(Q.match('title', 'test'));
    const bool3 = Q.bool().must(Q.term('status', 'active')).should(Q.match('title', 'different'));

    expect(Q.equals(bool1, bool2)).toBe(true);
    expect(Q.equals(bool1, bool3)).toBe(false);
  });
});

describe('Q Helper API - Serialization Helpers', () => {
  test('Q.serialize() produces complete query serialization', () => {
    const query = Q.term('status', 'active').boost(1.5);
    const serialized = Q.serialize(query);
    const parsed = JSON.parse(serialized);

    expect(parsed).toHaveProperty('type', 'TermQuery');
    expect(parsed).toHaveProperty('body');
    expect(parsed).toHaveProperty('metadata');
    expect(parsed.body).toEqual({
      term: {
        status: {
          value: 'active',
          boost: 1.5
        }
      }
    });
  });

  test('Q.serialize() includes metadata for reconstructibility', () => {
    const query = Q.bool().must(Q.term('status', 'active'));
    const serialized = Q.serialize(query);
    const parsed = JSON.parse(serialized);

    expect(parsed.metadata).toHaveProperty('operations');
    expect(parsed.metadata.operations).toBeInstanceOf(Array);
  });
});

describe('Q Helper API - Immutability Verification', () => {
  test('All Q helper functions return new instances', () => {
    const original = Q.term('field', 'value');
    const modified = original.boost(2.0);

    expect(original).not.toBe(modified);
    expect(original.getBoost()).toBeUndefined();
    expect(modified.getBoost()).toBe(2.0);
  });

  test('Q.bool() operations return new instances', () => {
    const original = Q.bool();
    const withMust = original.must(Q.term('status', 'active'));
    const withShould = withMust.should(Q.match('title', 'search'));

    expect(original).not.toBe(withMust);
    expect(withMust).not.toBe(withShould);
    expect(original.getClauseCounts().must).toBe(0);
    expect(withMust.getClauseCounts().must).toBe(1);
    expect(withShould.getClauseCounts().should).toBe(1);
  });
});