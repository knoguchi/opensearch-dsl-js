/**
 * Composition Safety Tests
 * 
 * Tests to verify safe query composition and sharing
 */

import { Q } from '../src/Q.js';
import { Query } from '../src/core/Query.js';

describe('Composition Safety', () => {
  describe('Function composition', () => {
    test('queries can be safely passed to functions', () => {
      function addUserFilter(query: Query, userId: string): Query {
        return Q.bool()
          .must(query)
          .filter(Q.term('user_id', userId));
      }

      const baseQuery = Q.match('title', 'elasticsearch');
      const user1Query = addUserFilter(baseQuery, 'user1');
      const user2Query = addUserFilter(baseQuery, 'user2');

      // Base query should be unchanged
      expect(baseQuery.toJSON()).toEqual({
        match: { title: 'elasticsearch' }
      });

      // User queries should be different
      expect(user1Query.toJSON()).toEqual({
        bool: {
          must: [{ match: { title: 'elasticsearch' } }],
          filter: [{ term: { user_id: 'user1' } }]
        }
      });

      expect(user2Query.toJSON()).toEqual({
        bool: {
          must: [{ match: { title: 'elasticsearch' } }],
          filter: [{ term: { user_id: 'user2' } }]
        }
      });

      expect(user1Query.equals(user2Query)).toBe(false);
    });

    test('complex composition preserves original queries', () => {
      function addPermissionFilter(query: Query, permissions: string[]): Query {
        const permissionQuery = Q.bool();
        permissions.forEach(permission => {
          permissionQuery.should(Q.term('permissions', permission));
        });
        
        return Q.bool()
          .must(query)
          .filter(permissionQuery)
          .minimumShouldMatch(1);
      }

      function addDateRange(query: Query, from: string, to: string): Query {
        return Q.bool()
          .must(query)
          .filter(Q.range('date').gte(from).lte(to));
      }

      const baseSearch = Q.bool()
        .must(Q.match('content', 'search'))
        .should(Q.match('title', 'tutorial'));

      const adminQuery = addPermissionFilter(baseSearch, ['admin', 'editor']);
      const recentAdminQuery = addDateRange(adminQuery, '2024-01-01', '2024-12-31');
      const userQuery = addPermissionFilter(baseSearch, ['user']);

      // All should be different instances
      expect(baseSearch).not.toBe(adminQuery);
      expect(adminQuery).not.toBe(recentAdminQuery);
      expect(baseSearch).not.toBe(userQuery);

      // Base should be unchanged
      expect(baseSearch.toJSON()).toEqual({
        bool: {
          must: [{ match: { content: 'search' } }],
          should: [{ match: { title: 'tutorial' } }]
        }
      });

      // Each modification should be isolated
      expect(adminQuery.toJSON().bool.filter).toBeDefined();
      
      // recentAdminQuery wraps adminQuery, so it has must: [adminQuery] and filter: [dateRange]
      expect(recentAdminQuery.toJSON().bool.filter).toHaveLength(1); // just date range
      expect(recentAdminQuery.toJSON().bool.must).toHaveLength(1); // the adminQuery
      
      expect(userQuery.toJSON().bool.filter).toHaveLength(1); // just permissions
    });
  });

  describe('Query sharing', () => {
    test('shared subqueries remain safe', () => {
      const sharedTermFilter = Q.term('active', true);
      const sharedRangeFilter = Q.range('score').gte(0.5);

      const query1 = Q.bool()
        .must(Q.match('title', 'test1'))
        .filter(sharedTermFilter)
        .filter(sharedRangeFilter);

      const query2 = Q.bool()
        .must(Q.match('title', 'test2'))
        .filter(sharedTermFilter)
        .filter(sharedRangeFilter);

      // Modify one of the shared filters
      const boostedTermFilter = sharedTermFilter.boost(2.0);
      const query3 = Q.bool()
        .must(Q.match('title', 'test3'))
        .filter(boostedTermFilter)
        .filter(sharedRangeFilter);

      // Original shared filters should be unchanged
      expect(sharedTermFilter.getBoost()).toBeUndefined();
      expect(sharedRangeFilter.getBounds().gte).toBe(0.5);

      // Query1 and Query2 should have original filters
      const q1Filters = query1.toJSON().bool.filter!;
      const q2Filters = query2.toJSON().bool.filter!;
      expect(q1Filters[0]).toEqual({ term: { active: true } });
      expect(q2Filters[0]).toEqual({ term: { active: true } });

      // Query3 should have boosted filter
      const q3Filters = query3.toJSON().bool.filter!;
      expect(q3Filters[0]).toEqual({ 
        term: { active: { value: true, boost: 2.0 } } 
      });
    });

    test('deep sharing preserves independence', () => {
      const deepSharedQuery = Q.bool()
        .must(Q.term('type', 'article'))
        .should(Q.match('tags', 'featured'));

      const wrapper1 = Q.bool()
        .must(deepSharedQuery)
        .filter(Q.term('category', 'tech'));

      const wrapper2 = Q.bool()
        .must(deepSharedQuery)
        .filter(Q.term('category', 'science'));

      // Modify the deep shared query
      const modifiedDeepQuery = deepSharedQuery.boost(1.5);
      const wrapper3 = Q.bool()
        .must(modifiedDeepQuery)
        .filter(Q.term('category', 'news'));

      // Original deep query should be unchanged
      expect(deepSharedQuery.toJSON().bool.boost).toBeUndefined();

      // Wrappers 1 and 2 should contain original deep query
      const w1Must = wrapper1.toJSON().bool.must![0] as any;
      const w2Must = wrapper2.toJSON().bool.must![0] as any;
      expect(w1Must.bool.boost).toBeUndefined();
      expect(w2Must.bool.boost).toBeUndefined();

      // Wrapper 3 should contain modified deep query
      const w3Must = wrapper3.toJSON().bool.must![0] as any;
      expect(w3Must.bool.boost).toBe(1.5);
    });
  });

  describe('Conditional composition', () => {
    test('conditional operations are composition-safe', () => {
      function buildSearchQuery(searchTerm: string, userRole: string, includePrivate: boolean): Query {
        return Q.bool()
          .must(Q.match('content', searchTerm))
          .when(userRole === 'admin', q => 
            q.should(Q.term('admin_only', true))
          )
          .when(includePrivate, q => 
            q.should(Q.term('is_private', true))
          )
          .unless(userRole === 'guest', q => 
            q.filter(Q.range('score').gte(0.1))
          );
      }

      const adminQuery = buildSearchQuery('test', 'admin', true);
      const userQuery = buildSearchQuery('test', 'user', false);
      const guestQuery = buildSearchQuery('test', 'guest', false);

      // All should be different
      expect(adminQuery.equals(userQuery)).toBe(false);
      expect(userQuery.equals(guestQuery)).toBe(false);
      expect(adminQuery.equals(guestQuery)).toBe(false);

      // Admin query should have admin_only and is_private should clauses + score filter
      const adminJson = adminQuery.toJSON();
      expect(adminJson.bool.should).toHaveLength(2);
      expect(adminJson.bool.filter).toHaveLength(1);

      // User query should have no admin_only, no is_private, but score filter
      const userJson = userQuery.toJSON();
      expect(userJson.bool.should).toBeUndefined();
      expect(userJson.bool.filter).toHaveLength(1);

      // Guest query should have no admin_only, no is_private, no score filter
      const guestJson = guestQuery.toJSON();
      expect(guestJson.bool.should).toBeUndefined();
      expect(guestJson.bool.filter).toBeUndefined();
    });

    test('nested conditionals work safely', () => {
      function buildComplexQuery(conditions: {
        isAdmin: boolean;
        includePrivate: boolean;
        hasLocation: boolean;
        location?: { lat: number; lon: number };
      }): Query {
        return Q.bool()
          .must(Q.match('content', 'search'))
          .when(conditions.isAdmin, q => 
            q.should(Q.term('admin_content', true))
              .when(conditions.includePrivate, innerQ => 
                innerQ.should(Q.term('is_private', true))
              )
          )
          .when(conditions.hasLocation && conditions.location, q => 
            q.filter(Q.term('location.enabled', true))
          );
      }

      const adminPrivateQuery = buildComplexQuery({
        isAdmin: true,
        includePrivate: true,
        hasLocation: false
      });

      const adminPublicQuery = buildComplexQuery({
        isAdmin: true,
        includePrivate: false,
        hasLocation: false
      });

      const userLocationQuery = buildComplexQuery({
        isAdmin: false,
        includePrivate: false,
        hasLocation: true,
        location: { lat: 40.7128, lon: -74.0060 }
      });

      // Verify different structures
      const adminPrivateJson = adminPrivateQuery.toJSON();
      const adminPublicJson = adminPublicQuery.toJSON();
      const userLocationJson = userLocationQuery.toJSON();

      expect(adminPrivateJson.bool.should).toHaveLength(2); // admin_content + is_private
      expect(adminPublicJson.bool.should).toHaveLength(1); // admin_content only
      expect(userLocationJson.bool.should).toBeUndefined(); // no admin content
      expect(userLocationJson.bool.filter).toHaveLength(1); // location filter
    });
  });

  describe('Combinator safety', () => {
    test('Q.and preserves individual queries', () => {
      const term1 = Q.term('status', 'active');
      const term2 = Q.term('featured', true);
      const combined = Q.and(term1, term2);

      // Modify original terms
      term1.boost(2.0);
      term2.caseInsensitive(true);

      // Combined query should contain original terms
      expect(combined.toJSON()).toEqual({
        bool: {
          must: [
            { term: { status: 'active' } },
            { term: { featured: true } }
          ]
        }
      });

      // Original terms should be unchanged
      expect(term1.getBoost()).toBeUndefined();
      expect(term2.isCaseInsensitive()).toBe(false);
    });

    test('Q.or preserves individual queries', () => {
      const match1 = Q.match('title', 'test1');
      const match2 = Q.match('title', 'test2');
      const combined = Q.or(match1, match2);

      // Modify original matches
      match1.operator('and');
      match2.boost(1.5);

      // Combined query should contain original matches
      expect(combined.toJSON()).toEqual({
        bool: {
          should: [
            { match: { title: 'test1' } },
            { match: { title: 'test2' } }
          ]
        }
      });

      // Original matches should be unchanged
      expect(match1.getOperator()).toBeUndefined();
      expect(match2.toJSON()).toEqual({ match: { title: 'test2' } });
    });
  });

  describe('Memory safety', () => {
    test('large composition chains do not leak references', () => {
      let baseQuery = Q.bool().must(Q.term('base', true));

      // Create a chain of 100 modifications
      for (let i = 0; i < 100; i++) {
        baseQuery = baseQuery.should(Q.term(`field_${i}`, `value_${i}`));
      }

      // Original simple query should still exist and be unchanged
      const originalBase = Q.bool().must(Q.term('base', true));
      expect(originalBase.toJSON()).toEqual({
        bool: { must: [{ term: { base: true } }] }
      });

      // Final query should have all modifications
      const finalJson = baseQuery.toJSON();
      expect(finalJson.bool.must).toHaveLength(1);
      expect(finalJson.bool.should).toHaveLength(100);
    });

    test('shared queries in multiple compositions remain independent', () => {
      const sharedBase = Q.term('shared', 'value');
      const queries: Query[] = [];

      // Create 50 different compositions using the same base
      for (let i = 0; i < 50; i++) {
        queries.push(
          Q.bool()
            .must(sharedBase)
            .filter(Q.term(`unique_${i}`, i))
        );
      }

      // Modify the shared base
      const modifiedBase = sharedBase.boost(5.0);

      // All existing compositions should still reference original base
      queries.forEach((query, index) => {
        const json = query.toJSON();
        expect(json.bool.must[0]).toEqual({ term: { shared: 'value' } });
        expect(json.bool.filter[0]).toEqual({ term: { [`unique_${index}`]: index } });
      });

      // Original shared base should be unchanged
      expect(sharedBase.getBoost()).toBeUndefined();
      expect(modifiedBase.getBoost()).toBe(5.0);
    });
  });
});