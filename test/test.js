var chalk = require('chalk');
var GraphEngine = require('../src/graph-engine.js');

function test(result, expectation, testDescription) {
  if (result == expectation) {
    console.log(chalk.green('PASS ' + testDescription));
  }
  else {
    console.log(chalk.red('FAIL ' + testDescription + '\n    expectation: ' + expectation + '\n    result: ' + result));
  }
}

var g = new GraphEngine();

//  simple test
g.addNode('a', ['b', 'c', 'd']);

test(g.nodes().length, 4, 'expected number of nodes initialized');
test(g.links().length, 3, 'expected number of links initialized');

var errorThrown = false;
try { g.removeNode('b'); }
catch (error) { errorThrown = true; }
test(errorThrown, true, 'expected error thrown when removing node that was implicitly added.');

g.removeNode('a');
test(g.nodes().length, 0, 'All nodes removed as expected');


//  more detailed test
g = new GraphEngine();

g.addNode('a', ['b', 'c', 'd']);
var bNode;
g.nodes().forEach(function (node) {
  if (node.inLink == 'b') { bNode = node; }
});
test(bNode !== undefined, true, 'implicit node added as expected');

g.addNode('b', ['d']);
test(g.nodes().length, 4, 'expected number of nodes initialized');
test(g.links().length, 4, 'expected number of links initialized');

if (bNode) {
  test(bNode.placeholder, false, 'node.placeholder updated to !node.placeholder after explicitly added');
}

g.updateNode('a', ['b', 'c']);
test(g.nodes().length, 4, 'expected node maintained on update');
test(g.links().length, 3, 'expected link removed on update');

g.updateNode('b', []);
test(g.nodes().length, 3, 'expected node removed on update');

console.log(g.nodes());
g.removeNode('b');
console.log(g.nodes());
test(g.nodes().length, 2, 'only expected node removed')

errorThrown = false;
try {g.updateNode('c', ['a'])}
catch (error) {errorThrown = true;}
test(errorThrown, true, 'expected error thrown when updating implicitly added node');
