#!/usr/bin/env node

/**
 * CLI for testing opensearch-dsl-js
 * 
 * Interactive REPL for experimenting with queries
 */

import { Q } from './Q.js';
import { Query } from './core/Query.js';

function printHeader() {
  console.log('\n🔍 opensearch-dsl-js CLI');
  console.log('==============================');
  console.log('Immutable OpenSearch Query Builder\n');
  console.log('Available commands:');
  console.log('  test-basic      - Run basic immutability tests');
  console.log('  test-composition - Run composition safety tests');
  console.log('  test-real       - Run real-world query examples');
  console.log('  interactive     - Start interactive mode');
  console.log('  examples        - Show usage examples');
  console.log('  help            - Show this help\n');
}

function testBasicImmutability() {
  console.log('🧪 Testing Basic Immutability...\n');
  
  // Test 1: Bool query immutability
  console.log('Test 1: Bool Query Immutability');
  const q1 = Q.bool();
  console.log('q1 =', q1.toString());
  
  const q2 = q1.must(Q.term('status', 'active'));
  console.log('q2 = q1.must(Q.term("status", "active"))');
  console.log('q2 =', q2.toString());
  
  console.log('q1 unchanged?', q1.equals(Q.bool()) ? '✅ YES' : '❌ NO');
  console.log('q1 !== q2?', q1 !== q2 ? '✅ YES' : '❌ NO');
  
  // Test 2: Term query immutability
  console.log('\nTest 2: Term Query Immutability');
  const t1 = Q.term('price', 100);
  console.log('t1 =', t1.toString());
  
  const t2 = t1.boost(2.0);
  console.log('t2 = t1.boost(2.0)');
  console.log('t2 =', t2.toString());
  
  console.log('t1 unchanged?', t1.getBoost() === undefined ? '✅ YES' : '❌ NO');
  console.log('t2 has boost?', t2.getBoost() === 2.0 ? '✅ YES' : '❌ NO');
  
  // Test 3: Range query immutability
  console.log('\nTest 3: Range Query Immutability');
  const r1 = Q.range('date');
  const r2 = r1.gte('2024-01-01');
  const r3 = r2.lte('2024-12-31');
  
  console.log('r1 =', r1.toString());
  console.log('r2 =', r2.toString());
  console.log('r3 =', r3.toString());
  
  console.log('r1 has bounds?', r1.hasBounds() ? '❌ NO' : '✅ YES');
  console.log('r3 has both bounds?', 
    r3.getBounds().gte && r3.getBounds().lte ? '✅ YES' : '❌ NO');
    
  console.log('\n✅ Basic immutability tests completed!\n');
}

function testCompositionSafety() {
  console.log('🔧 Testing Composition Safety...\n');
  
  // Simulate a function that adds user filtering
  function addUserFilter(query: Query, userId: string): Query {
    return Q.bool()
      .must(query)
      .filter(Q.term('user_id', userId));
  }
  
  // Base query
  const baseQuery = Q.bool()
    .must(Q.match('title', 'opensearch'))
    .should(Q.match('content', 'search'));
    
  console.log('Base query:');
  console.log(JSON.stringify(baseQuery.toJSON(), null, 2));
  
  // Apply to different users
  const user1Query = addUserFilter(baseQuery, 'user1');
  const user2Query = addUserFilter(baseQuery, 'user2');
  
  console.log('\nUser 1 query:');
  console.log(JSON.stringify(user1Query.toJSON(), null, 2));
  
  console.log('\nUser 2 query:');
  console.log(JSON.stringify(user2Query.toJSON(), null, 2));
  
  // Verify base query is unchanged
  const originalBase = Q.bool()
    .must(Q.match('title', 'opensearch'))
    .should(Q.match('content', 'search'));
    
  console.log('\nBase query unchanged?', 
    baseQuery.equals(originalBase) ? '✅ YES' : '❌ NO');
  console.log('User queries different?', 
    !user1Query.equals(user2Query) ? '✅ YES' : '❌ NO');
    
  console.log('\n✅ Composition safety tests completed!\n');
}

function testRealWorldExamples() {
  console.log('🌍 Real-world Query Examples...\n');
  
  // Example 1: E-commerce search
  console.log('Example 1: E-commerce Product Search');
  const productSearch = Q.bool()
    .must(Q.match('title', 'laptop'))
    .filter(Q.range('price').gte(500).lte(2000))
    .filter(Q.term('in_stock', true))
    .should(Q.term('brand', 'apple'))
    .should(Q.term('brand', 'dell'))
    .minimumShouldMatch(1)
    .boost(1.2);
    
  console.log('Query JSON:');
  console.log(JSON.stringify(productSearch.toJSON(), null, 2));
  console.log('Generated Code:');
  console.log(productSearch.toCode());
  
  // Example 2: Blog search with conditional logic
  console.log('\n\nExample 2: Blog Search with Conditionals');
  const userRole = 'admin';
  const includePrivate = true;
  const searchTerm = 'opensearch tutorial';
  
  const blogSearch = Q.bool()
    .must(Q.match('content', searchTerm))
    .when(userRole === 'admin', q => 
      q.should(Q.term('visibility', 'private'))
    )
    .unless(includePrivate, q => 
      q.filter(Q.term('is_private', false))
    )
    .filter(Q.range('published_date').gte('2024-01-01'));
    
  console.log('Query JSON:');
  console.log(JSON.stringify(blogSearch.toJSON(), null, 2));
  console.log('Generated Code:');
  console.log(blogSearch.toCode());
  
  // Example 3: Performance validation
  console.log('\n\nExample 3: Performance Test');
  console.time('Create 1000 queries');
  for (let i = 0; i < 1000; i++) {
    Q.bool()
      .must(Q.term('id', i))
      .should(Q.match('title', `test ${i}`))
      .filter(Q.range('score').gte(i * 0.1));
  }
  console.timeEnd('Create 1000 queries');
  
  console.log('\n✅ Real-world examples completed!\n');
}

function showExamples() {
  console.log('📚 Usage Examples\n');
  
  console.log('// Basic query creation');
  console.log('const query = Q.bool()');
  console.log('  .must(Q.term("status", "active"))');
  console.log('  .should(Q.match("title", "search"))');
  console.log('  .filter(Q.range("date").gte("2024-01-01"));');
  
  console.log('\n// Immutable operations');
  console.log('const base = Q.term("type", "article");');
  console.log('const boosted = base.boost(2.0);  // base unchanged!');
  console.log('const caseInsensitive = base.caseInsensitive(true);  // base unchanged!');
  
  console.log('\n// Conditional logic');
  console.log('const query = Q.bool()');
  console.log('  .must(Q.match("content", searchTerm))');
  console.log('  .when(includePrivate, q => q.filter(Q.term("private", true)))');
  console.log('  .unless(isGuest, q => q.boost(1.5));');
  
  console.log('\n// Safe composition');
  console.log('function addPersonalization(query, userId) {');
  console.log('  return Q.bool().must(query).filter(Q.term("user_id", userId));');
  console.log('}');
  console.log('');
  console.log('const base = Q.match("title", "test");');
  console.log('const user1 = addPersonalization(base, "user1");  // base unchanged');
  console.log('const user2 = addPersonalization(base, "user2");  // base still unchanged');
  
  console.log('\n// Debugging');
  console.log('Q.debug(query);  // Shows type, JSON, code, metadata');
  console.log('Q.validate(query);  // Returns validation results');
  console.log('query.toCode();  // Generate source code');
  console.log('');
}

function startInteractive() {
  console.log('🎮 Interactive Mode (Coming Soon!)');
  console.log('This will provide a REPL for experimenting with queries.');
  console.log('For now, use the test commands to explore functionality.\n');
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  printHeader();
  
  switch (command) {
    case 'test-basic':
      testBasicImmutability();
      break;
    case 'test-composition':
      testCompositionSafety();
      break;
    case 'test-real':
      testRealWorldExamples();
      break;
    case 'interactive':
      startInteractive();
      break;
    case 'examples':
      showExamples();
      break;
    case 'help':
    case undefined:
      // Header already printed
      break;
    default:
      console.log(`❌ Unknown command: ${command}`);
      console.log('Run "npm run cli help" for available commands.\n');
  }
}

// Run main if this file is executed directly
if (process.argv[1] && (process.argv[1].endsWith('cli.ts') || process.argv[1].endsWith('cli.js'))) {
  main();
}