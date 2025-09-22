/**
 * Immutability Tests
 * 
 * Core tests to verify immutability principles
 */

import { Q } from '../src/Q.js';

describe('Immutability', () => {
  describe('BoolQuery', () => {
    test('operations return new instances', () => {
      const q1 = Q.bool();
      const q2 = q1.must(Q.term('status', 'active'));
      
      expect(q1).not.toBe(q2);
      expect(q1.toJSON()).toEqual({ bool: {} });
      expect(q2.toJSON()).toEqual({
        bool: {
          must: [{ term: { status: 'active' } }]
        }
      });
    });

    test('chained operations create separate instances', () => {
      const base = Q.bool();
      const q1 = base.must(Q.term('type', 'article'));
      const q2 = base.should(Q.match('title', 'test'));
      const q3 = q1.should(Q.match('content', 'search'));

      // All should be different instances
      expect(base).not.toBe(q1);
      expect(base).not.toBe(q2);
      expect(q1).not.toBe(q2);
      expect(q1).not.toBe(q3);

      // Original should be unchanged
      expect(base.toJSON()).toEqual({ bool: {} });
      
      // Each should have only its own modifications
      expect(q1.toJSON()).toEqual({
        bool: { must: [{ term: { type: 'article' } }] }
      });
      expect(q2.toJSON()).toEqual({
        bool: { should: [{ match: { title: 'test' } }] }
      });
      expect(q3.toJSON()).toEqual({
        bool: {
          must: [{ term: { type: 'article' } }],
          should: [{ match: { content: 'search' } }]
        }
      });
    });

    test('conditionals preserve immutability', () => {
      const base = Q.bool().must(Q.term('status', 'published'));
      const withConditional = base.when(true, q => q.should(Q.match('title', 'test')));
      const withoutConditional = base.when(false, q => q.should(Q.match('title', 'test')));

      expect(base).not.toBe(withConditional);
      expect(base).toBe(withoutConditional); // Should return same instance when condition is false
      
      expect(base.toJSON()).toEqual({
        bool: { must: [{ term: { status: 'published' } }] }
      });
      expect(withConditional.toJSON()).toEqual({
        bool: {
          must: [{ term: { status: 'published' } }],
          should: [{ match: { title: 'test' } }]
        }
      });
    });
  });

  describe('TermQuery', () => {
    test('modifications return new instances', () => {
      const q1 = Q.term('price', 100);
      const q2 = q1.boost(2.0);
      const q3 = q1.caseInsensitive(true);

      expect(q1).not.toBe(q2);
      expect(q1).not.toBe(q3);
      expect(q2).not.toBe(q3);

      // Original unchanged
      expect(q1.toJSON()).toEqual({ term: { price: 100 } });
      expect(q1.getBoost()).toBeUndefined();
      expect(q1.isCaseInsensitive()).toBe(false);

      // Modifications present
      expect(q2.getBoost()).toBe(2.0);
      expect(q3.isCaseInsensitive()).toBe(true);
    });

    test('chained modifications work correctly', () => {
      const original = Q.term('category', 'electronics');
      const modified = original.boost(1.5).caseInsensitive(true);

      expect(original).not.toBe(modified);
      expect(original.toJSON()).toEqual({ term: { category: 'electronics' } });
      expect(modified.toJSON()).toEqual({
        term: {
          category: {
            value: 'electronics',
            boost: 1.5,
            case_insensitive: true
          }
        }
      });
    });
  });

  describe('MatchQuery', () => {
    test('modifications return new instances', () => {
      const q1 = Q.match('title', 'elasticsearch');
      const q2 = q1.operator('and');
      const q3 = q1.fuzziness('AUTO');

      expect(q1).not.toBe(q2);
      expect(q1).not.toBe(q3);
      expect(q2).not.toBe(q3);

      // Original unchanged
      expect(q1.toJSON()).toEqual({ match: { title: 'elasticsearch' } });
      expect(q1.getOperator()).toBeUndefined();
      expect(q1.getFuzziness()).toBeUndefined();

      // Modifications present
      expect(q2.getOperator()).toBe('and');
      expect(q3.getFuzziness()).toBe('AUTO');
    });
  });

  describe('RangeQuery', () => {
    test('modifications return new instances', () => {
      const q1 = Q.range('date');
      const q2 = q1.gte('2024-01-01');
      const q3 = q2.lte('2024-12-31');

      expect(q1).not.toBe(q2);
      expect(q2).not.toBe(q3);

      // Original unchanged
      expect(q1.hasBounds()).toBe(false);
      
      // Progressive modifications
      expect(q2.getBounds().gte).toBe('2024-01-01');
      expect(q2.getBounds().lte).toBeUndefined();
      
      expect(q3.getBounds().gte).toBe('2024-01-01');
      expect(q3.getBounds().lte).toBe('2024-12-31');
    });

    test('between method creates new instance', () => {
      const q1 = Q.range('price');
      const q2 = q1.between(100, 500);
      const q3 = q1.between(100, 500, false);

      expect(q1).not.toBe(q2);
      expect(q2).not.toBe(q3);

      expect(q1.hasBounds()).toBe(false);
      
      // Inclusive between
      expect(q2.getBounds()).toEqual({
        gte: 100,
        lte: 500,
        gt: undefined,
        lt: undefined
      });
      
      // Exclusive between
      expect(q3.getBounds()).toEqual({
        gt: 100,
        lt: 500,
        gte: undefined,
        lte: undefined
      });
    });
  });

  describe('Complex scenarios', () => {
    test('deeply nested queries maintain immutability', () => {
      const base = Q.bool()
        .must(
          Q.bool()
            .should(Q.match('title', 'test'))
            .should(Q.term('featured', true))
        )
        .filter(Q.range('date').gte('2024-01-01'));

      const modified = base
        .must(Q.term('status', 'published'))
        .boost(1.5);

      expect(base).not.toBe(modified);
      
      // Verify base is unchanged
      const baseJson = base.toJSON();
      expect(baseJson.bool.must).toHaveLength(1);
      expect(baseJson.bool.boost).toBeUndefined();
      
      // Verify modifications
      const modifiedJson = modified.toJSON();
      expect(modifiedJson.bool.must).toHaveLength(2);
      expect(modifiedJson.bool.boost).toBe(1.5);
    });

    test('shared subqueries are safe', () => {
      const sharedFilter = Q.term('active', true);
      
      const query1 = Q.bool().must(Q.match('title', 'test1')).filter(sharedFilter);
      const query2 = Q.bool().must(Q.match('title', 'test2')).filter(sharedFilter);
      
      // Modify shared filter (creates new instance)
      const modifiedFilter = sharedFilter.boost(2.0);
      const query3 = Q.bool().must(Q.match('title', 'test3')).filter(modifiedFilter);

      // Original queries should be unaffected
      expect(query1.toJSON().bool.filter![0]).toEqual({ term: { active: true } });
      expect(query2.toJSON().bool.filter![0]).toEqual({ term: { active: true } });
      expect(query3.toJSON().bool.filter![0]).toEqual({
        term: { active: { value: true, boost: 2.0 } }
      });
    });
  });

  describe('Identity and equality', () => {
    test('same construction produces equal but different instances', () => {
      const q1 = Q.bool().must(Q.term('status', 'active'));
      const q2 = Q.bool().must(Q.term('status', 'active'));

      expect(q1).not.toBe(q2); // Different instances
      expect(q1.equals(q2)).toBe(true); // But structurally equal
    });

    test('operations preserve unique identity', () => {
      const q1 = Q.term('field', 'value');
      const q2 = q1; // Same reference
      const q3 = q1.boost(1.0); // New instance

      expect(q1).toBe(q2); // Same reference
      expect(q1).not.toBe(q3); // Different instances
      expect(q1.id()).not.toBe(q3.id()); // Different IDs
    });
  });
});