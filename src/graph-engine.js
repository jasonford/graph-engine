//  Simple graph engine
//  creates and manages nodes and links according inLinks and outLinks


GraphEngine = function GraphEngine() {
  var nodes    = [];
  var links    = [];
  var onUpdate = [];

  var inLinkToNode = {};
  var linkEncodingToLink = {};

  function difference(a, b) {
    var aMembers = {};
    a.forEach(function (member) { aMembers[member] = true; });
    b.forEach(function (member) { delete aMembers[member]; });
    return Object.keys(aMembers);
  }

  function addNode(inLink, outLinks) {
    var node = inLinkToNode[inLink];
    if (!node) {
      node = {
        inLink : inLink,
        outLinks : outLinks,
        placeholder : false
      };
      inLinkToNode[inLink] = node;
      nodes.push(node);

      //  add links for all the outlinks
      outLinks.forEach(function (outLink) {
        addLink(inLink, outLink);
      });
    }
    else {
      // mark the node as explicitly added
      // in case it was previously added as a placeholder
      node.placeholder = false;
      updateNode(inLink, outLinks);
    }
  }

  function addLink(inLink, outLink) {
    var linkEncoding = inLink + '\n' + outLink;
    if (linkEncodingToLink[linkEncoding]) {
      throw new Error('trying to add a link that already exists ' + inLink + ' -> ' + outLink);
    }
    else {
      var target = inLinkToNode[outLink];
      if (!target) {
        //  create a node as a placeholder
        target = {
          inLink : outLink,
          outLinks : [],
          placeholder : true
        };
        inLinkToNode[outLink] = target;
        nodes.push(target);
      }
      var source = inLinkToNode[inLink];
      var link = {
        source : source,
        target : target
      };
      linkEncodingToLink[linkEncoding] = link;
      links.push(link);
    }
  }

  function removeLink(inLink, outLink) {
    var linkEncoding = inLink + '\n' + outLink;
    var link = linkEncodingToLink[linkEncoding];
    if (!link) {
      throw new Error('Trying to remove a link that does not exist: ' + inLink + ' -> ' + outLink);
    }
    delete linkEncodingToLink[linkEncoding];
    var index = links.indexOf(link);
    if (index > -1) {
      links.splice(index, 1);
    }
  }

  function updateNode(inLink, outLinks) {
    var node = inLinkToNode[inLink];
    if (node && node.placeholder) {
      throw new Error('Cannot update a node that was not explicitly added');
    }
    if (node) {
      var toRemove = difference(node.outLinks, outLinks);
      var toAdd    = difference(outLinks, node.outLinks);

      toRemove.forEach(function (outLink) {
        removeLink(inLink, outLink);
      });

      toAdd.forEach(function (outLink) {
        addLink(inLink, outLink);
      });

      //  set new outLinks
      node.outLinks = outLinks;
      removeOrphanPlaceholders();
    }
    else {
      throw new Error('Cannot update node with id "' + inLink + '". Node does not exist.');
    }
  }

  function removeNode(inLink) {
    var node = inLinkToNode[inLink];
    if (!node) {
      throw new Error('Trying to remove a node that does not exist: ' + inLink);
    }
    if (node.placeholder) {
      throw new Error('Cannot remove a node that was not added explicitly: ' + inLink);
    }
    delete inLinkToNode[inLink];
    var index = nodes.indexOf(node);
    if (index > -1) {
      nodes.splice(index, 1);
      //  remove all links where this one is source
      node.outLinks = [];
      for (var i=0; i<links.length; i++) {
        if (links[i].source == node) {
          var linkEncoding = node.inLink + '\n' + links[i].target.inLink;
          delete linkEncodingToLink[linkEncoding];
          links.splice(i,1);
          i -= 1;
        }
      }
      //  set to placeholder
      //  it will be cleaned up if nothing references it
      node.placeholder = true;
      removeOrphanPlaceholders();
    }
    else {
      throw new Error('Cannot remove node that does not exist.');
    }
  }

  function removeOrphanPlaceholders() {
    //  remove nodes that were added as placeholders for
    //  explicitly added nodes that link to them
    //  orphaned placeholders should never have outlinks
    var notOrphaned = {};
    nodes.forEach(function (node) {
      node.outLinks.forEach(function (outLink) {
        notOrphaned[outLink] = true;
      });
    });
    for (var i=0; i<nodes.length; i++) {
      if (nodes[i].placeholder && !notOrphaned[nodes[i].inLink]) {
        delete inLinkToNode[nodes[i].inLink];
        nodes.splice(i, 1);
        i -= 1;
      }
    }
  }

  //  apply update functions
  this.nodes = function () {return nodes};
  this.links = function () {return links};
  this.addNode    = addNode;
  this.updateNode = updateNode;
  this.removeNode = removeNode;
}


if (module) {
  module.exports = GraphEngine
}
