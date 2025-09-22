/**
 * Validation and Edge Case Tests
 * 
 * Tests for error conditions, edge cases, and negative scenarios
 */

import { Q } from '../src/Q.js';

describe('Validation and Edge Cases', () => {
  describe('Query validation', () => {
    test('empty bool query validation', () => {
      const emptyBool = Q.bool();
      const validation = Q.validate(emptyBool);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Bool query has no clauses');
    });

    test('range query without bounds validation', () => {
      const emptyRange = Q.range('date');
      const validation = Q.validate(emptyRange);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Range query has no bounds set');
    });

    test('valid queries pass validation', () => {
      const validBool = Q.bool().must(Q.term('status', 'active'));
      const validRange = Q.range('price').gte(100);
      const validTerm = Q.term('category', 'electronics');
      const validMatch = Q.match('title', 'test');

      expect(Q.validate(validBool).valid).toBe(true);
      expect(Q.validate(validRange).valid).toBe(true);
      expect(Q.validate(validTerm).valid).toBe(true);
      expect(Q.validate(validMatch).valid).toBe(true);
    });
  });

  describe('Constructor edge cases', () => {
    test('TermQuery with null values', () => {
      const nullTerm = Q.term('field', null);
      
      expect(nullTerm.getValue()).toBe(null);
      expect(nullTerm.toJSON()).toEqual({ term: { field: null } });
    });

    test('MatchQuery with empty string', () => {
      const emptyMatch = Q.match('title', '');
      
      expect(emptyMatch.getQueryText()).toBe('');
      expect(emptyMatch.toJSON()).toEqual({ match: { title: '' } });
    });

    test('RangeQuery with various value types', () => {
      const dateRange = Q.range('date').gte(new Date('2024-01-01'));
      const numberRange = Q.range('price').gte(0).lte(1000);
      const stringRange = Q.range('name').gte('a').lte('z');
      
      expect(dateRange.getBounds().gte).toBeInstanceOf(Date);
      expect(numberRange.getBounds().gte).toBe(0);
      expect(stringRange.getBounds().gte).toBe('a');
    });
  });

  describe('Method chaining edge cases', () => {
    test('duplicate operations', () => {
      const query = Q.range('price')
        .gte(100)
        .gte(200)  // Second gte should override first
        .lte(500)
        .lte(300); // Second lte should override first
      
      const bounds = query.getBounds();
      expect(bounds.gte).toBe(200);
      expect(bounds.lte).toBe(300);
    });

    test('conflicting range bounds', () => {
      const conflictingRange = Q.range('price')
        .gte(500)
        .gt(400)   // Both gte and gt set
        .lte(100)  // lte less than gte
        .lt(200);  // Both lte and lt set
      
      const bounds = conflictingRange.getBounds();
      expect(bounds.gte).toBe(500);
      expect(bounds.gt).toBe(400);
      expect(bounds.lte).toBe(100);
      expect(bounds.lt).toBe(200);
      
      // Query builder doesn't validate logic - that's ES's job
      expect(conflictingRange.toJSON()).toEqual({
        range: {
          price: {
            gte: 500,
            gt: 400,
            lte: 100,
            lt: 200
          }
        }
      });
    });

    test('extreme boost values', () => {
      const extremeBoost = Q.term('field', 'value')
        .boost(Number.MAX_SAFE_INTEGER)
        .boost(-1000)
        .boost(0);
      
      expect(extremeBoost.getBoost()).toBe(0);
    });
  });

  describe('Boolean query edge cases', () => {
    test('adding same query multiple times', () => {
      const termQuery = Q.term('status', 'active');
      const boolQuery = Q.bool()
        .must(termQuery)
        .must(termQuery)  // Same query twice
        .should(termQuery); // Same query in different clause
      
      const json = boolQuery.toJSON();
      expect(json.bool.must).toHaveLength(2);
      expect(json.bool.should).toHaveLength(1);
      expect(json.bool.must![0]).toEqual(json.bool.must![1]);
      expect(json.bool.must![0]).toEqual(json.bool.should![0]);
    });

    test('empty arrays in bool query', () => {
      const boolQuery = Q.bool()
        .must([])  // Empty array
        .should([]) // Empty array
        .filter([]); // Empty array
      
      const json = boolQuery.toJSON();
      expect(json.bool.must).toHaveLength(0);
      expect(json.bool.should).toHaveLength(0);
      expect(json.bool.filter).toHaveLength(0);
    });

    test('mixed query types in bool clauses', () => {
      const mixedBool = Q.bool()
        .must([
          Q.term('type', 'article'),
          Q.match('title', 'test'),
          Q.range('date').gte('2024-01-01'),
          Q.bool().should(Q.term('featured', true))
        ]);
      
      const json = mixedBool.toJSON();
      expect(json.bool.must).toHaveLength(4);
      expect(json.bool.must![0]).toHaveProperty('term');
      expect(json.bool.must![1]).toHaveProperty('match');
      expect(json.bool.must![2]).toHaveProperty('range');
      expect(json.bool.must![3]).toHaveProperty('bool');
    });
  });

  describe('Conditional edge cases', () => {
    test('falsy conditions do not modify queries', () => {
      const original = Q.bool().must(Q.term('base', true));
      
      const withFalsyConditions = original
        .when(false, q => q.should(Q.term('never', true)))
        .when(0, q => q.filter(Q.term('never', true)))
        .when('', q => q.mustNot(Q.term('never', true)))
        .when(null, q => q.boost(999))
        .when(undefined, q => q.minimumShouldMatch(100));
      
      // Should be the same instance since no conditions were true
      expect(withFalsyConditions).toBe(original);
      expect(withFalsyConditions.toJSON()).toEqual({
        bool: { must: [{ term: { base: true } }] }
      });
    });

    test('truthy conditions modify queries', () => {
      const original = Q.bool().must(Q.term('base', true));
      
      const withTruthyConditions = original
        .when(true, q => q.should(Q.term('condition1', true)))
        .when(1, q => q.filter(Q.term('condition2', true)))
        .when('string', q => q.mustNot(Q.term('condition3', true)))
        .when([], q => q.boost(2))  // Empty array is truthy
        .when({}, q => q.minimumShouldMatch(1)); // Empty object is truthy
      
      expect(withTruthyConditions).not.toBe(original);
      const json = withTruthyConditions.toJSON();
      expect(json.bool.should).toHaveLength(1);
      expect(json.bool.filter).toHaveLength(1);
      expect(json.bool.must_not).toHaveLength(1);
      expect(json.bool.boost).toBe(2);
      expect(json.bool.minimum_should_match).toBe(1);
    });

    test('unless with falsy conditions modify queries', () => {
      const original = Q.bool().must(Q.term('base', true));
      
      const withUnless = original
        .unless(false, q => q.should(Q.term('added', true)))
        .unless(0, q => q.filter(Q.term('added2', true)))
        .unless('', q => q.boost(1.5))
        .unless(null, q => q.minimumShouldMatch(1));
      
      expect(withUnless).not.toBe(original);
      const json = withUnless.toJSON();
      expect(json.bool.should).toHaveLength(1);
      expect(json.bool.filter).toHaveLength(1);
      expect(json.bool.boost).toBe(1.5);
      expect(json.bool.minimum_should_match).toBe(1);
    });
  });

  describe('Serialization edge cases', () => {
    test('circular reference handling', () => {
      // Create a complex query that could have circular refs
      const innerBool = Q.bool().must(Q.term('inner', true));
      const outerBool = Q.bool()
        .must(innerBool)
        .should(innerBool)  // Same instance referenced twice
        .filter(Q.bool().must(innerBool)); // Nested reference
      
      // Should serialize without issues
      expect(() => outerBool.toJSON()).not.toThrow();
      expect(() => JSON.stringify(outerBool.toJSON())).not.toThrow();
      
      const json = outerBool.toJSON();
      expect(json.bool.must![0]).toEqual(json.bool.should![0]); // Same structure
    });

    test('deep nesting', () => {
      let deepQuery = Q.bool().must(Q.term('level0', true));
      
      // Create 10 levels of nesting
      for (let i = 1; i <= 10; i++) {
        deepQuery = Q.bool().must(deepQuery).should(Q.term(`level${i}`, true));
      }
      
      expect(() => deepQuery.toJSON()).not.toThrow();
      expect(() => deepQuery.toCode()).not.toThrow();
      
      const json = deepQuery.toJSON();
      expect(json).toHaveProperty('bool');
      expect(json.bool.must).toHaveLength(1);
      expect(json.bool.should).toHaveLength(1);
    });
  });

  describe('Performance edge cases', () => {
    test('large query arrays', () => {
      const largeTerms = Array.from({ length: 1000 }, (_, i) => 
        Q.term(`field_${i}`, `value_${i}`)
      );
      
      const largeBool = Q.bool().must(largeTerms);
      
      expect(() => largeBool.toJSON()).not.toThrow();
      expect(largeBool.toJSON().bool.must).toHaveLength(1000);
    });

    test('many conditional operations', () => {
      let query = Q.bool().must(Q.term('base', true));
      
      // Apply 1000 conditional operations
      for (let i = 0; i < 1000; i++) {
        query = query.when(i % 2 === 0, q => 
          q.should(Q.term(`field_${i}`, `value_${i}`))
        );
      }
      
      expect(() => query.toJSON()).not.toThrow();
      const json = query.toJSON();
      expect(json.bool.should).toHaveLength(500); // Half of 1000 (even numbers)
    });
  });

  describe('Memory safety', () => {
    test('operations do not retain references to original objects', () => {
      const mutableObject = { value: 'original' };
      const query = Q.term('field', mutableObject as any);
      
      // Modify the original object
      mutableObject.value = 'modified';
      
      // Query should contain a copy, not reference
      // getValue() extracts the value property, so it should be 'original'
      expect(query.getValue()).toBe('original');
      
      // Also verify the JSON structure was cloned properly
      expect(query.toJSON()).toEqual({ term: { field: { value: 'original' } } });
    });

    test('deeply nested objects are cloned', () => {
      const deepObject = {
        level1: {
          level2: {
            level3: {
              value: 'deep'
            }
          }
        }
      };
      
      const query = Q.term('field', deepObject as any);
      
      // Modify the original
      deepObject.level1.level2.level3.value = 'modified';
      
      // Query should have the original value
      const queryValue = query.getValue() as any;
      expect(queryValue.level1.level2.level3.value).toBe('deep');
    });
  });
});