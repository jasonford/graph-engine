#Graph Engine
A simple object that maintains a list of nodes and links in response to updates

##Usage:

```javascript
var g = new GraphEngine();

g.addNode('anIdForTheNode', ['listOf', 'otherNodeIds', 'thatNodeLinksTo']);
g.updateNode('anIdForTheNode', ['new', 'listOf', 'otherNodeIds']);
g.removeNode('anIdForTheNode');

g.onUpdate(functionToExecuteWheneverGraphChanges);

g.links(); // links in graph
g.nodes(); // nodes in graph
```
